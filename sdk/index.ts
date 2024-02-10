import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';

import * as helpers from "./helpers";
import { AlgoliaIndexRequest, AlgoliaResponse, Config, Content, DocumentIds, Query } from "./types";
import contentByIdJson from './dataMapping/content-by-id.json';
import { omit } from 'lodash';

interface SdkType {
  parseUserQuery: (input: string) => { facets: string | undefined, q: string | undefined };
  performSearch: (q: Query) => AlgoliaResponse | any
}

const allFacets = Object.keys(contentByIdJson);

const HITS_PER_PAGE = 25;
const QUERY_CONFIG = [
  {
    indexName: 'aggregate',
    query: '',
    params: {
      hitsPerPage: HITS_PER_PAGE,
      attributesToHighlight: [
        'text',
        'title',
      ],
    },
  },
  {
    indexName: 'bible verses',
    query: '',
    params: {
      hitsPerPage: HITS_PER_PAGE,
      attributesToHighlight: [
        'citation',
        'bibleText',
      ],
    },
  },
];

class Sdk implements SdkType {
    config: Config
    client: SearchClient
    aggregateIndex: SearchIndex
    bibleIndex: SearchIndex;
    queries: AlgoliaIndexRequest[] = [];
    constructor(c: Config) {
      this.config = c;
      this.client = algoliasearch(this.config.algolia.publicKey, this.config.algolia.secretKey);
      this.aggregateIndex = this.client.initIndex('aggregate');
      this.bibleIndex = this.client.initIndex('bible verses');
      c.indecies.forEach(({ name: indexName, hitsPerPage, attributesToHighlight}) => {
        this.queries.push({
          indexName,
          page: 0,
          params: {
            hitsPerPage,
            attributesToHighlight
          },
          query: '',
        })
      })
    }
  
    parseUserQuery(input: string) : Query {
      const facets = helpers.parseFacets(input);
      const q = helpers.parseQuery(input);
      return {
        facets,
        q
      };
    }

    fetchFromLocalJson(f: string) {
      const json : Record<string, Content> = contentByIdJson;
      const facet = f.split(':').slice(1).join('');
      const data = json[facet];
      if (data && data.isParent) {
        const children = allFacets
          .filter(f => facet.includes(f))
          .reduce((arr: Content[], id) => {
            const d = omit(json[id], "parent", "isParent");
            return arr.concat([d]);
          }, [])
          .sort((a, b) => a.number - b.number);
        return [data, ...children];
      }
      return [data];
    }

    private async fetchFromAlgolia(facets: string, query: string, page = 0) {
      const data = await this.client.multipleQueries(QUERY_CONFIG.map((obj) => ({
        ...obj,
        facets,
        page,
        query,
      })));
      return data;
    }

    performSearch(query: Query) {
      const algoliaFacet = helpers.fromFacetToAlgoliaFacet(query);
      if (query.q) {
        // call algolia
        return this.fetchFromAlgolia(algoliaFacet, query.q);
      }
      // otherwise, just use local json
      return Promise.resolve({
        results: this.fetchFromLocalJson(algoliaFacet)
      });
    }
}


export default Sdk;