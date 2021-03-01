/* eslint-disable no-underscore-dangle */
import algoliasearch from 'algoliasearch';
import { throttle } from 'lodash';
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { parseConfessionId } from '../helpers';

// const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_API_KEY, process.env.NEXT_PUBLIC_ALGOLIA_SECRET_KEY);

const aggIndex = client.initIndex('aggregate');
const facets = ['document:Heidelberg Catechism'];
const prePopulatedSearch = {
  query: 'Question 1: What is thy only comfort',
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

const HomePage = ({
  prePopulatedSearchResults,
  prePopulatedQuery
}) => {
  const [searchTerm, setSearchTerm] = useState(prePopulatedQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [areResultsPristine, setAreResultsPristine] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = throttle(() => {
    setIsLoading(true);
    if (areResultsPristine) setAreResultsPristine(false);
    client.multipleQueries(defaultQueries.map((obj) => ({ ...obj, query: searchTerm })))
      .then(({ results }) => {
        console.log('response', results);
        const parsedResults = results
          .map(({ hits, index }) => hits.map((h) => ({ ...h, index })))
          .reduce((acc, arr) => acc.concat(arr), []);
        setSearchResults(parsedResults);
      });
  }, 300);

  const handleSubmit = (e) => {
    e.persist();
    if (e.keyCode === 13) {
      fetchResults();
    }
  };

  const handleSearchInput = (e) => {
    e.persist();
    setSearchTerm(e.target.value);
    if (e.target.value.length > 3) {
      // fetchResults();
    }
  };

  const renderResults = (result) => {
    if (result.index === 'aggregate') {
      const text = Object.keys(result).includes('text');
      return (
        <li className="w-full flex flex-col justify-center mb-24">
          <h2 className="text-4xl w-full text-center mb-24">{`The ${result.document}`}</h2>
          <Highlighter textToHighlight={result.title} searchWords={result._highlightResult.title.matchedWords} highlightClassName="search-result-matched-word" />
          {text && <Highlighter className="mt-4" textToHighlight={result.text} searchWords={result._highlightResult.text.matchedWords} highlightClassName="search-result-matched-word" />}
        </li>
      );
    }
    return (
      <li className="w-full flex flex-col justify-center">
        <Highlighter
          highlightClassName="search-result-matched-word"
          className="text-4xl w-full text-center mb-24"
          textToHighlight={result.citation}
          searchWords={result._highlightResult.citation.matchedWords}
        />
        <Highlighter
          className="mt-4"
          textToHighlight={result.bibleText}
          searchWords={result._highlightResult.bibleText.matchedWords}
          />
        <div className="citations pt-5 mb-24">
          <h3>Passage Cited by:</h3>
          {result.citedBy.map((id) => <p className="">{parseConfessionId(id)}</p>)}
        </div>
      </li>
    );
  };

  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <h1 className="text-center text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <input type="text" className="home-pg-search border border-gray-500 rounded-full leading-10 w-full lg:w-1/2 my-24 mx-auto outline-none pl-12 py-2" value={searchTerm} onChange={handleSearchInput} onKeyDown={handleSubmit} />
      <ul className="results w-full lg:w-1/2 mx-auto">
        {areResultsPristine && prePopulatedSearchResults.map((obj) => renderResults(obj))}
        {!areResultsPristine && searchResults.map((obj) => renderResults(obj))}
      </ul>
    </div>
  );
};

export async function getStaticProps(context) {
  // will be passed to the page component as props
  const resp = await aggIndex.search(prePopulatedSearch.query, {
    facetFilters: facets,
    attributesToHighlight: [
      'text',
      'title',
    ],
  });

  return {
    props: {
      prePopulatedSearchResults: resp.hits.map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      prePopulatedQuery: prePopulatedSearch.query,
    },
  };
}

export default HomePage;
