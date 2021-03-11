/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import path from 'path';
import { promises as fs } from 'fs';
import algoliasearch from 'algoliasearch';
import { groupBy, throttle } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { confessionPathByName } from '../dataMapping';

import ConfessionTextResult from '../components/ConfessionTextResult';
import ConfessionChapterResult from '../components/ConfessionChapterResult';
import BibleTextResult from '../components/BibleTextResult';
import SEO from '../components/SEO';
import {
  handleSortById,
  documentFacetRegex,
  chapterFacetRegex,
  articleFacetRegex,
  parseFacets,
  getUniformConfessionTitle,
  getCitationContextById,
} from '../helpers';

import { getConfessionalAbbreviationId } from '../scripts/helpers';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
  process.env.NEXT_PUBLIC_ALGOLIA_SECRET_KEY,
);

const aggIndex = client.initIndex('aggregate');
const facets = ['parent:WCoF-3'];
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

  const resp = await aggIndex.search('', {
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
      prePopulatedQuery: 'document:WCF chapter:3',
      contentById,
    },
  };
}

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
  const [searchResults, setSearchResults] = useState(search ? [] : prePopulatedSearchResults);
  const [areResultsPristine, setAreResultsPristine] = useState(true);
  const [isLoading, setIsLoading] = useState(!!search);
  const [currentPg, setCurrentPg] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSticky, setSticky] = useState(false);
  const searchRef = useRef();

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
    const queryWithoutFacetFilters = search.replace(chapterFacetRegex, '').replace(documentFacetRegex, '').replace(articleFacetRegex, '');
    client.multipleQueries(defaultQueries.map((obj) => ({
      ...obj,
      query: queryWithoutFacetFilters,
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

  const renderResults = () => {
    const groupedResults = groupBy(searchResults, (obj) => {
      if (obj.index === 'aggregate') return obj.document;
      return 'bible';
    });

    console.log('results', groupedResults);

    const groupedListOfResults = Object
      .entries(groupedResults)
      .reduce((acc, [documentTitle, results]) => {
        console.log('test documentTitle', documentTitle);
        if (documentTitle === 'bible') {
          console.log('acc', acc, results);
          return acc
            .concat(
              results
                .map((result) => <BibleTextResult contentById={contentById} {...result} />),
            );
        }
        const groupedByChapter = groupBy(results, (obj) => obj.parent);
        const documentId = getConfessionalAbbreviationId(documentTitle);
        return (
          acc.concat([
            <li>
              <h2 className="text-3xl lg:text-4xl w-full text-center mb-24">
                {documentTitle}
              </h2>
              <ul>
                {Object
                  .keys(groupedByChapter)
                  .sort((a, b) => handleSortById({ id: a }, { id: b }))
                  .filter((key) => key.includes(documentId))
                  .map((chapterId) => {
                    const isResultChapter = (
                      chapterId.split('-').length === 1
                      && !chapterId.includes('WSC')
                      && !chapterId.includes('WLC')
                    );
                    // should be true for WSC and WLC
                    if (isResultChapter) {
                      console.log('chapterId', chapterId);
                      return (
                        <ConfessionChapterResult
                          title={contentById[chapterId].title}
                          searchTerm={search}
                          data={chaptersById[chapterId]
                            .map((obj) => ({
                              ...obj,
                              hideChapterTitle: true,
                              hideDocumentTitle: true,
                            }))
                            .sort(handleSortById)}
                          contentById={contentById}
                        />
                      );
                    }
                    return groupedByChapter[chapterId]
                      .map((obj) => (
                        <ConfessionTextResult
                          {...obj}
                          searchTerms={[
                            search,
                            obj._highlightResult.text.matchedWords,
                            obj._highlightResult.title.matchedWords,
                          ]}
                          contentById={contentById}
                          hideDocumentTitle
                        />
                      ));
                  })}
              </ul>
            </li>,
          ])
        );
      }, []);
    return (
      <ul className="results w-full lg:w-1/2 mx-auto">
        {groupedListOfResults}
      </ul>
    );
  };

  const handleLoadMore = () => {
    setCurrentPg(currentPg + 1);
  };

  const pgTitle = search ? `Confessional Christianity | ${searchTerm}` : 'Confessional Christianity | Historic Creeds & Catechisms';
  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <SEO title={pgTitle} />
      <h1 className="text-center text-4xl lg:text-5xl mx-auto max-w-2xl">
        Confessional Christianity
      </h1>
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
      {isLoading && (
        <p className="text-xl w-full text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
          Fetching your search results...
        </p>
      )}
      {renderResults()}
      {isLoading && searchResults.length && (
      <p className="text-xl w-full text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
        Loading more...
      </p>
      )}
      {!isLoading && !areResultsPristine && !searchResults.length && (
        <p className="text-xl w-full text-center">
          No results found.
        </p>
      )}
      {hasMore && !isLoading && (
        <button type="submit" onClick={handleLoadMore}>LOAD MORE</button>
      )}
    </div>
  );
};

export default HomePage;
