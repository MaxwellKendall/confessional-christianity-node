import algolia from 'algoliasearch';
const algoliasearch = algolia.default;

import * as helpers from "../helpers/index.ts";
import { AlgoliaIndexRequest, AlgoliaResponse, Config, DocumentIds, Query } from "../types/index.ts";

interface SdkType {
  parseUserQuery: (input: string) => { facets: string | undefined, q: string | undefined };
  performSearch: (q: Query) => AlgoliaResponse | any
}

class Sdk implements SdkType {
    config: Config
    client: any;
    queries: AlgoliaIndexRequest[] = [];
    constructor(c: Config) {
      this.config = c;
      this.client = algoliasearch(this.config.algolia.publicKey, this.config.algolia.secretKey);
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

    private fetchFromLocalJson(facet: Query['facets']) {
      
    }

    private fetchFromAlgolia(q: Query) {
      const facets = helpers.fromQueryToAlgoliaQuery(q);
    }

    performSearch(query: Query) {
      if (query.q) {
        // call algolia
        return this.fetchFromAlgolia(query);
      }
      // otherwise, just use local json
      return this.fetchFromLocalJson(query.facets);
    }
}


export default Sdk;