/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import path from 'path';
import { promises as fs } from 'fs';
import algoliasearch from 'algoliasearch';
import { throttle } from 'lodash';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { confessionPathByName, parseConfessionId, removeCitationId } from '../helpers';
import { getConfessionalAbbreviationId } from '../scripts/helpers';

// const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
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
  const [showMore, setShowMore] = useState([]);

  const fetchResults = throttle(() => {
    setIsLoading(true);
    if (areResultsPristine) setAreResultsPristine(false);
    if (searchTerm !== search) setSearchTerm(search);
    client.multipleQueries(defaultQueries.map((obj) => ({ ...obj, query: search })))
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

  const handleShowMore = (id) => {
    if (showMore.includes(id)) {
      setShowMore(showMore.filter((str) => str !== id));
    }
    else {
      setShowMore(showMore.concat([id]));
    }
  };

  console.log('results', areResultsPristine, searchResults);

  const renderResults = (result) => {
    if (result.index === 'aggregate') {
      const text = Object.keys(result).includes('text');
      return (
        <li className="w-full flex flex-col justify-center mb-24">
          <h2 className="text-4xl w-full text-center mb-24">{`The ${result.document}`}</h2>
          <Highlighter className="text-2xl" textToHighlight={result.title} searchWords={result._highlightResult.title.matchedWords} highlightClassName="search-result-matched-word" />
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
          {result.citedBy.map((id) => (
            <div className="show-more">
              <p className="">
                {parseConfessionId(id)}
                <button
                  type="submit"
                  onClick={() => handleShowMore(id)}
                >
                  {showMore.includes(id) ? '(Hide Citation)' : '(Show Citation)'}
                </button>
              </p>
              {showMore.includes(id) && (
                <p className="pl-2 my-2 border-l-4">{contentById[removeCitationId(id)]}</p>
              )}
            </div>
          ))}
        </div>
      </li>
    );
  };

  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <h1 className="text-center text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <input type="text" className="home-pg-search border border-gray-500 rounded-full leading-10 w-full lg:w-1/2 my-24 mx-auto outline-none pl-12 py-2" value={searchTerm} onChange={handleSearchInput} onKeyDown={handleSubmit} />
      <ul className="results w-full lg:w-1/2 mx-auto">
        {isLoading && (
          <li className="w-full flex">
            <p className="text-xl w-full text-center">
              <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
              Fetching your search results...
            </p>
          </li>
        )}
        {areResultsPristine && !isLoading && prePopulatedSearchResults.map((obj) => renderResults(obj))}
        {!areResultsPristine && !isLoading && searchResults.map((obj) => renderResults(obj))}
      </ul>
    </div>
  );
};

export async function getStaticProps() {
  // will be passed to the page component as props
  const contentById = await Object
    .entries(confessionPathByName)
    .reduce((prevPromise, [key, value]) => {
      return prevPromise.then(async (acc) => {
        const pathToConfession = path.join(process.cwd(), value);
        const fileContents = await fs.readFile(pathToConfession, 'utf8');
        const parsed = JSON.parse(fileContents);
        const asObject = parsed.content
          .reduce((asObj, obj) => {
            return {
              ...asObj,
              [obj.id]: obj.text || '',
            };
          }, {});
        return Promise.resolve({
          ...acc,
          ...asObject,
        });
      });
    }, Promise.resolve({}));

  const resp = await aggIndex.search(prePopulatedSearch.query, {
    // facetFilters: facets,
    attributesToHighlight: [
      'text',
      'title',
    ],
  });

  return {
    props: {
      prePopulatedSearchResults: resp.hits.map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      prePopulatedQuery: prePopulatedSearch.query,
      contentById,
    },
  };
}

export default HomePage;
