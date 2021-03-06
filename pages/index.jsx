/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import path from 'path';
import { promises as fs } from 'fs';
import algoliasearch from 'algoliasearch';
import { throttle } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { confessionPathByName } from '../dataMapping';

import ConfessionTextResult from '../components/ConfessionTextResult';
import BibleTextResult from '../components/BibleTextResult';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
  process.env.NEXT_PUBLIC_ALGOLIA_SECRET_KEY,
);

const aggIndex = client.initIndex('aggregate');
const facets = ['document:Heidelberg Catechism'];
const prePopulatedSearch = {
  query: 'What is thy only comfort in life and death',
  index: 'aggregate',
};

const defaultQueries = [
  {
    indexName: 'aggregate',
    query: '',
    params: {
      hitsPerPage: 10,
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
      hitsPerPage: 10,
      attributesToHighlight: [
        'citation',
        'bibleText',
      ],
    },
  },
];

const documentFacetRegex = new RegExp(/document:(WCF|Westminster\sConfession\sof\sFaith|westminster\sconfession\sof\sfaith|HC|Heidelberg\sCatechism|heidelberg\scatechism|WSC|Westminster\sShorter\sCatechism|westminster\sshorter\scatechism|WLC|Westminser\sLarger\sCatechism|westminster\slarger\scatechism)/);
const chapterFacetRegex = new RegExp(/chapter:[0-9]*|lord's\sday:[0-9]*|lords\sday:[0-9]*|question|Question|answer|Answer/);

const HomePage = ({
  prePopulatedSearchResults,
  prePopulatedQuery,
  contentById,
}) => {
  const router = useRouter();
  const { search } = router.query;
  const initialSearch = search || prePopulatedQuery;
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState([]);
  const [areResultsPristine, setAreResultsPristine] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const parseFacets = (str) => {
    const document = str.match(documentFacetRegex);
    const chapter = str.match(chapterFacetRegex);

    if (document && chapter) return [document[0]].concat(chapter[0]);
    if (document) return [document[0]];
    if (chapter) return [chapter[0]];
    return [];
  };

  const fetchResults = throttle(() => {
    const facetFilters = parseFacets(search);
    setIsLoading(true);
    if (areResultsPristine) setAreResultsPristine(false);
    if (searchTerm !== search) setSearchTerm(search);
    client.multipleQueries(defaultQueries.map((obj) => ({
      ...obj,
      query: search.replace(chapterFacetRegex, '').replace(documentFacetRegex, ''),
      facetFilters,
    })))
      .then(({ results }) => {
        setIsLoading(false);
        const parsedResults = results
          .map(({ hits, index }) => hits.map((h) => ({ ...h, index })))
          .reduce((acc, arr) => acc.concat(arr), []);
        setSearchResults(parsedResults);
      });
  }, 300);

  useEffect(() => {
    if (search) {
      fetchResults();
    }
  }, [search]);

  const handleSubmit = (e) => {
    e.persist();
    if (e.keyCode === 13) {
      router.push({
        pathname: '',
        query: {
          search: searchTerm,
        },
      });
    }
  };

  const handleSearchInput = (e) => {
    e.persist();
    setSearchTerm(e.target.value);
  };

  const renderResults = (result) => {
    if (result.index === 'aggregate') {
      return (
        <ConfessionTextResult contentById={contentById} {...result} />
      );
    }
    return (
      <BibleTextResult contentById={contentById} {...result} />
    );
  };

  const pgTitle = search ? `Confessional Christianity | ${searchTerm}` : 'Confessional Christianity | Historic Creeds & Catechisms';

  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <Head>
        <title>{pgTitle}</title>
        <meta property="og:title" content={pgTitle} key="title" />
        <meta property="og:image" content="/preview-img.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:domain" value="confessionalchristianity.com" />
        <meta property="og:twitter-image" content="/preview-img.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-center text-4xl lg:text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <input type="text" className="home-pg-search border border-gray-500 rounded-full leading-10 w-full lg:w-1/2 my-24 mx-auto outline-none pl-12 pr-4 py-2" value={searchTerm} onChange={handleSearchInput} onKeyDown={handleSubmit} />
      <ul className="results w-full lg:w-1/2 mx-auto">
        {isLoading && (
          <li className="w-full flex">
            <p className="text-xl w-full text-center">
              <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
              Fetching your search results...
            </p>
          </li>
        )}
        {areResultsPristine && !isLoading && (
          prePopulatedSearchResults.map((obj) => renderResults(obj))
        )}
        {!areResultsPristine && !isLoading && searchResults.filter((obj) => Object.keys(obj).includes('text')).map((obj) => renderResults(obj))}
      </ul>
    </div>
  );
};

export async function getStaticProps() {
  // will be passed to the page component as props
  const contentById = await Object
    .entries(confessionPathByName)
    .reduce((prevPromise, [, value]) => prevPromise.then(async (acc) => {
      const pathToConfession = path.join(process.cwd(), value);
      const fileContents = await fs.readFile(pathToConfession, 'utf8');
      const parsed = JSON.parse(fileContents);
      const asObject = parsed.content
        .reduce((asObj, obj) => ({
          ...asObj,
          [obj.id]: obj,
        }), {});
      return Promise.resolve({
        ...acc,
        ...asObject,
      });
    }), Promise.resolve({}));

  const resp = await aggIndex.search(prePopulatedSearch.query, {
    facetFilters: facets,
    attributesToHighlight: [
      'text',
      'title',
    ],
  });

  return {
    props: {
      prePopulatedSearchResults: resp.hits
        .map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      prePopulatedQuery: prePopulatedSearch.query,
      contentById,
    },
  };
}

export default HomePage;
