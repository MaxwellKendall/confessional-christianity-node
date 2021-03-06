/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import path from 'path';
import { promises as fs } from 'fs';
import Link from 'next/link';

import algoliasearch from 'algoliasearch';
import { groupBy, throttle } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinus, faPlus, faSpinner, faTimes,
} from '@fortawesome/free-solid-svg-icons';

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
  isChapter,
  groupContentByChapter,
  getConciseDocId,
} from '../helpers';

import { getConfessionalAbbreviationId } from '../scripts/helpers';

const HITS_PER_PAGE = 25;

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

const groupByDocument = (results) => groupBy(results, (obj) => {
  if (obj.index === 'bible verses') return 'bible';
  return obj.document;
});

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
      prePopulatedSearchResults: groupByDocument(
        resp.hits.map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      ),
      prePopulatedQuery: 'document:WCF chapter:3',
      contentById,
    },
  };
}

const getSearchTerms = (obj, term) => {
  const highlightedProperties = ['text', 'title', 'bibleText', 'citation'];
  const { _highlightResult: result } = obj;
  return highlightedProperties
    .reduce((acc, key) => {
      const doesExist = result
        ? Object.keys(result).includes(key)
        : false;
      if (doesExist) {
        return acc.concat(result[key].matchedWords);
      }
      return acc;
    }, term.split(' '));
};

const getResultsLength = (map) => Object
  .entries(map)
  .reduce((acc, [, entry]) => acc + entry.length, 0);

const parseResults = (results, existingResults, currentPg) => {
  const newResults = results
    .map(({ hits, index }) => hits.map((h) => ({ ...h, index })))
    .reduce((acc, arr) => acc.concat(arr), []);

  const newResultsMapped = groupByDocument(newResults);

  if (currentPg > 0) {
    return {
      ...Object
        .keys(newResultsMapped)
        .reduce((acc, key) => ({
          ...acc,
          [key]: Object.keys(acc).includes(key)
            ? acc[key].concat(newResultsMapped[key])
            : newResultsMapped[key],
        }), existingResults),
    };
  }
  return newResultsMapped;
};

const stickyBreakPoint = 41;

const HomePage = ({
  prePopulatedSearchResults,
  prePopulatedQuery,
  contentById,
}) => {
  const router = useRouter();
  const { search } = router.query;
  const initialSearch = search || prePopulatedQuery;
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  // expanded documents, collapsed by default.
  const [expanded, setExpanded] = useState(['WCoF']);
  // collapsed chapters, expanded by default.
  const [collapsed, setCollapsed] = useState({});
  const [searchResults, setSearchResults] = useState(search ? [] : prePopulatedSearchResults);
  const [areResultsPristine, setAreResultsPristine] = useState(true);
  const [isLoading, setIsLoading] = useState(!!search);
  const [totals, setTotals] = useState({
    bible: 0,
    confession: getResultsLength(prePopulatedSearchResults),
  });
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

  const fetchResults = throttle((clearExisting = false) => {
    const facetFilters = parseFacets(search);
    setIsLoading(true);
    setAreResultsPristine(false);
    if (searchTerm !== search) setSearchTerm(search);
    const queryWithoutFacetFilters = search.replace(chapterFacetRegex, '').replace(documentFacetRegex, '').replace(articleFacetRegex, '');
    client.multipleQueries(defaultQueries.map((obj) => ({
      ...obj,
      query: queryWithoutFacetFilters,
      page: clearExisting ? 0 : currentPg,
      facetFilters,
    })))
      .then(({ results }) => {
        setIsLoading(false);
        const hasMoreData = results.reduce((acc, { nbPages }) => {
          if (acc) return acc;
          return currentPg < nbPages - 1;
        }, false);
        setTotals({
          bible: results.find((o) => o.index === 'bible verses').nbHits,
          confession: results.find((o) => o.index === 'aggregate').nbHits,
        });
        setHasMore(hasMoreData);
        setSearchResults(parseResults(results, clearExisting ? [] : searchResults, currentPg));
        if (clearExisting) {
          setCurrentPg(0);
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
      fetchResults(true);
    }
  }, [search]);

  const submitSearch = () => {
    setCurrentPg(0);
    router.push({
      pathname: '',
      query: {
        search: searchTerm,
      },
    });
  };

  const handleKeyDown = (e) => {
    e.persist();
    if (e.keyCode === 13) {
      submitSearch();
    }
  };

  const handleSearchInput = (e) => {
    e.persist();
    setSearchTerm(e.target.value);
  };

  const handleExpand = (id) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((s) => s !== id));
    } else {
      setExpanded(expanded.concat([id]));
    }
  };

  const renderResults = () => {
    const groupedListOfResults = Object
      .entries(searchResults)
      .sort(([a], [b]) => {
        if (a === 'bible') return 1;
        if (b === 'bible') return -1;
        return 0;
      })
      .reduce((acc, [documentTitle, results]) => {
        if (documentTitle === 'bible') {
          return acc
            .concat(
              results
                .map((result) => <BibleTextResult contentById={contentById} {...result} />),
            );
        }

        const documentId = getConfessionalAbbreviationId(documentTitle);
        const isExpanded = expanded.includes(documentId);
        const groupedByChapter = groupContentByChapter(results);

        return (
          acc.concat([
            <li>
              <h2 className="text-3xl lg:text-4xl w-full mb-24 flex flex-wrap text-center">
                <Link href={{ pathname: '/', query: { search: `document:${getConciseDocId(documentTitle)}` } }}>
                  {documentTitle}
                </Link>
                <span className="text-xl lg:text-lg my-auto mx-auto 2xl:mt-0 2xl:ml-auto 2xl:mr-0">
                  {`${results.length} ${results.length === 1 ? 'MATCH' : 'MATCHES'}`}
                  <FontAwesomeIcon
                    className="ml-5 my-auto text-xl lg:text-lg"
                    icon={isExpanded ? faMinus : faPlus}
                    onClick={() => handleExpand(documentId)}
                  />
                </span>
              </h2>
              {isExpanded && (
                <ul className="relative">
                  {Object
                    .keys(groupedByChapter)
                    .sort((a, b) => handleSortById({ id: a }, { id: b }))
                    .filter((key) => key.includes(documentId))
                    .map((chapterId) => {
                      const isResultChapter = isChapter(chapterId, contentById);
                      // No chapter results displayed.
                      if (isResultChapter || areResultsPristine) {
                        return (
                          <ConfessionChapterResult
                            docTitle={documentTitle}
                            docId={getConciseDocId(documentTitle)}
                            chapterId={chapterId.split('-')[1]}
                            showNav={chapterFacetRegex.test(searchTerm)}
                            title={contentById[chapterId].title}
                            searchTerms={searchTerm.split(' ')}
                            collapsedChapters={collapsed}
                            setCollapsed={setCollapsed}
                            data={groupedByChapter[chapterId]
                              .filter((obj) => !obj.isParent)
                              .map((obj) => ({
                                ...obj,
                                searchTerms: getSearchTerms(obj, searchTerm),
                                hideChapterTitle: true,
                                hideDocumentTitle: true,
                                setCollapsed,
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
                            chapterId={chapterId.split('-')[1]}
                            docTitle={documentTitle}
                            docId={getConciseDocId(documentTitle)}
                            linkToChapter
                            showNav={(
                              articleFacetRegex.test(searchTerm)
                              || chapterFacetRegex.test(searchTerm)
                            )}
                            searchTerms={getSearchTerms(obj, searchTerm)}
                            contentById={contentById}
                            hideDocumentTitle
                          />
                        ));
                    })}
                </ul>
              )}
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
      <div className="w-full lg:w-1/2 mt-24 mx-auto sticky top-0 pt-10 pb-5 z-10 bg-white">
        <input
          ref={searchRef}
          type="text"
          className={`${isSticky ? ' shadow-lg' : ''} home-pg-search border border-gray-500 rounded-full leading-10 outline-none w-full pl-12 pr-12 py-2 relative`}
          value={searchTerm}
          onChange={handleSearchInput}
          onKeyDown={handleKeyDown}
        />
        <button className="absolute home-pg-search-btn" onClick={submitSearch} type="submit" />
        <FontAwesomeIcon icon={faTimes} onClick={() => setSearchTerm('')} className="home-pg-clear-search absolute" />
      </div>
      {!isLoading && (
        <span className="w-full text-center mb-24">
          {`SHOWING ${getResultsLength(searchResults)} of ${totals.bible + totals.confession} TOTAL MATCHES`}
            {hasMore && !isLoading && (
              <button type="submit" className="w-full" onClick={handleLoadMore}>LOAD MORE</button>
            )}
        </span>
      )}
      {isLoading && (
        <p className="text-xl w-full text-center mb-24">
          <FontAwesomeIcon icon={faSpinner} spin className="text-xl mr-4" />
          Fetching your search results...
        </p>
      )}
      {renderResults()}
      {!isLoading && !areResultsPristine && getResultsLength(searchResults) < 0 && (
        <p className="text-xl w-full text-center">
          No results found.
        </p>
      )}
      {hasMore && !isLoading && (
        <button type="submit" className="w-full" onClick={handleLoadMore}>LOAD MORE</button>
      )}
    </div>
  );
};

export default HomePage;
