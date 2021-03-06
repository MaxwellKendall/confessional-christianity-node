/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import path from 'path';
import { promises as fs } from 'fs';
import algoliasearch from 'algoliasearch';
import { groupBy, set, throttle } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { confessionPathByName, parentIdByAbbreviation } from '../dataMapping';

import ConfessionTextResult from '../components/ConfessionTextResult';
import ConfessionChapterResult from '../components/ConfessionChapterResult';
import BibleTextResult from '../components/BibleTextResult';
import SEO from '../components/SEO';
import {
  allResultsAreSameConfession,
  areResultsChaptersOnly,
  areResultsUniformChapter,
  getUniformConfessionTitle,
} from '../helpers';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
  process.env.NEXT_PUBLIC_ALGOLIA_SECRET_KEY,
);

const aggIndex = client.initIndex('aggregate');
const facets = ['document:Heidelberg Catechism'];
const prePopulatedSearch = { query: 'What is thy only comfort in life and death', index: 'aggregate' };

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

  const chaptersById = groupBy(Object
    .entries(contentById)
    .filter(([k]) => k.includes('-'))
    .reduce((acc, [, value]) => acc.concat([value]), []),
  (obj) => obj.parent);

  const resp = await aggIndex.search(prePopulatedSearch.query, {
    facetFilters: facets,
    attributesToHighlight: [
      'text',
      'title',
    ],
  });

  return {
    props: {
      chaptersById,
      prePopulatedSearchResults: resp.hits
        .map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      prePopulatedQuery: prePopulatedSearch.query,
      contentById,
    },
  };
}

const documentFacetRegex = new RegExp(/document:(WCF|Westminster\sConfession\sof\sFaith|westminster\sconfession\sof\sfaith|HC|Heidelberg\sCatechism|heidelberg\scatechism|WSC|Westminster\sShorter\sCatechism|westminster\sshorter\scatechism|WLC|Westminster\sLarger\sCatechism|westminster\slarger\scatechism)/);
const chapterFacetRegex = new RegExp(/.*chapter:([0-9]*|lord's\sday:[0-9]*|lords\sday:[0-9]*|question:[0-9]*|Question:[0-9]*|answer:[0-9]*|Answer:[0-9]*).*/);

const handleSortById = (a, b) => {
  if (Object.keys(a).includes('number')) {
    if (a.number > b.number) return 1;
    if (b.number > a.number) return -1;
    return 0;
  }
  const [idA, idB] = [a.id.split('-'), b.id.split('-')];
  if (parseInt(idA[idA.length - 1], 10) < parseInt(idB[idB.length - 1], 10)) return -1;
  if (parseInt(idB[idB.length - 1], 10) < parseInt(idA[idA.length - 1], 10)) return 1;
  return 0;
};

const stickyBreakPoint = 41;

const HomePage = ({
  prePopulatedSearchResults,
  prePopulatedQuery,
  contentById,
  chaptersById,
}) => {
  const router = useRouter();
  const { search } = router.query;
  const initialSearch = search || prePopulatedQuery;
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState([]);
  const [areResultsPristine, setAreResultsPristine] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [areResultsUniform, setAreResultsUniform] = useState(false);
  const [areResultsSameChapter, setAreResultsSameChapter] = useState(false);
  const [currentPg, setCurrentPg] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSticky, setSticky] = useState(false);
  const searchRef = useRef();

  const parseFacets = (str) => {
    const document = documentFacetRegex.exec(str);
    const chapter = chapterFacetRegex.exec(str);
    if (document && chapter) return [`parent:${parentIdByAbbreviation[document[1]]}-${chapter[1]}`];
    if (document) return [`parent:${parentIdByAbbreviation[document[1]]}`];
    return [];
  };

  const handleScroll = throttle(() => {
    if (searchRef.current) {
      const { top } = searchRef.current.getBoundingClientRect();
      if (top < stickyBreakPoint) {
        setSticky(true);
      } else if (isSticky) {
        setSticky(false);
      }
    }
  }, 200);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchResults = throttle(() => {
    const facetFilters = parseFacets(search);
    setIsLoading(true);
    setAreResultsPristine(false);
    if (searchTerm !== search) setSearchTerm(search);
    setAreResultsUniform(false);
    setAreResultsSameChapter(false);
    client.multipleQueries(defaultQueries.map((obj) => ({
      ...obj,
      query: search.replace(chapterFacetRegex, '').replace(documentFacetRegex, ''),
      page: currentPg,
      facetFilters,
    })))
      .then(({ results }) => {
        setIsLoading(false);
        const hasMoreData = results.reduce((acc, { nbPages }) => {
          if (acc) return acc;
          return currentPg < nbPages - 1;
        }, false);
        setHasMore(hasMoreData);
        const parsedResults = results
          .map(({ hits, index }) => hits.map((h) => ({ ...h, index })))
          .reduce((acc, arr) => acc.concat(arr), []);
        if (currentPg > 0) {
          setSearchResults(searchResults.concat(parsedResults));
        } else {
          setSearchResults(parsedResults);
        }
        if (areResultsChaptersOnly(parsedResults)) {
          setAreResultsUniform(true);
        } else if (allResultsAreSameConfession(parsedResults)) {
          setAreResultsUniform(true);
          if (areResultsUniformChapter(parsedResults)) {
            setAreResultsSameChapter(true);
          }
        } else {
          setAreResultsUniform(false);
        }
      });
  }, 300);

  useEffect(() => {
    if (currentPg > 0) {
      fetchResults();
    }
  }, [currentPg]);

  useEffect(() => {
    if (search) {
      fetchResults();
    }
  }, [search]);

  const handleSubmit = (e) => {
    e.persist();
    if (e.keyCode === 13) {
      setCurrentPg(0);
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
    if (result.index === 'aggregate' && Object.keys(result).includes('text')) {
      return (
        <ConfessionTextResult
          {...result}
          contentById={contentById}
          document={areResultsUniform || areResultsSameChapter ? null : result.document}
        />
      );
    }
    if (result.index === 'aggregate') {
      return (
        <ConfessionChapterResult
          {...result}
          contentById={contentById}
          data={chaptersById[result.id]}
        />
      );
    }
    return (
      <BibleTextResult contentById={contentById} {...result} />
    );
  };

  const renderChapterTitle = () => {
    const [result] = searchResults;
    if (result.id.includes('WSC') || result.id.includes('WLC')) return null;
    return (
      <h3 className="text-2xl lg:text-3xl w-full text-center mb-24">{contentById[searchResults[0].parent].title}</h3>
    );
  };

  const handleLoadMore = () => {
    setCurrentPg(currentPg + 1);
  };

  const pgTitle = search ? `Confessional Christianity | ${searchTerm}` : 'Confessional Christianity | Historic Creeds & Catechisms';
  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <SEO title={pgTitle} />
      <h1 className="text-center text-4xl lg:text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <div className="w-full lg:w-1/2 my-24 mx-auto sticky top-0 pt-10 pb-5 z-10 bg-white">
        <input
          ref={searchRef}
          type="text"
          className={`${isSticky ? ' shadow-lg' : ''} home-pg-search border border-gray-500 rounded-full leading-10 outline-none w-full pl-12 pr-12 py-2`}
          value={searchTerm}
          onChange={handleSearchInput}
          onKeyDown={handleSubmit}
        />
      </div>
      <ul className="results w-full lg:w-1/2 mx-auto">
        {isLoading && (
          <li className="w-full flex">
            <p className="text-xl w-full text-center">
              <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
              Fetching your search results...
            </p>
          </li>
        )}
        {searchResults.length && !areResultsPristine && areResultsUniform && (
          <h2 className="text-3xl lg:text-4xl w-full text-center mb-24">{`The ${getUniformConfessionTitle(searchResults)}`}</h2>
        )}
        {!isLoading && areResultsPristine && prePopulatedSearchResults.map(renderResults)}
        {searchResults.length && !areResultsPristine && areResultsSameChapter && (
          renderChapterTitle()
        )}
        {!areResultsPristine && searchResults.length && (
          searchResults
            .sort((a, b) => {
              if (areResultsSameChapter || areResultsUniform) return handleSortById(a, b);
              return 0;
            })
            .map(renderResults)
        )}
        {isLoading && searchResults.length && (
          <li className="w-full flex">
            <p className="text-xl w-full text-center">
              <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
              Loading more...
            </p>
          </li>
        )}
      </ul>
      {hasMore && !isLoading && (
        <button type="submit" onClick={handleLoadMore}>LOAD MORE</button>
      )}
    </div>
  );
};

export default HomePage;
