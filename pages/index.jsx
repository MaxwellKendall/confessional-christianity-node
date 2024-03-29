/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Link from 'next/link';

import algoliasearch from 'algoliasearch';
import {
  groupBy, throttle,
} from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinus, faPlus, faSpinner, faTimes,
} from '@fortawesome/free-solid-svg-icons';

import {
  DOCUMENTS_WITHOUT_ARTICLES,
} from '../dataMapping';

import ConfessionTextResult from '../components/ConfessionTextResult';
import ConfessionChapterResult from '../components/ConfessionChapterResult';
import BibleTextResult from '../components/BibleTextResult';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import contentById from '../dataMapping/content-by-id.json';

import {
  handleSortById,
  parseFacets,
  isChapter,
  groupContentByChapter,
  getConciseDocId,
  regexV2,
  keyWords,
  usePgTitle,
  isEmptyKeywordSearch,
  isFacetLength,
  bibleRegex,
} from '../helpers';

import { getConfessionalAbbreviationId } from '../scripts/helpers';

const HITS_PER_PAGE = 25;

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
  process.env.NEXT_PUBLIC_ALGOLIA_SECRET_KEY,
);

const aggIndex = client.initIndex('aggregate');
const prePopulatedSearch = { query: 'Psalms', index: 'citations' };
const prePopulatedExpanded = [];

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
    indexName: 'citations',
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
  if (obj.index === 'citations') return 'bible';
  return obj.document;
});

export async function getServerSideProps() {
  // will be passed to the page component as props

  const resp = await aggIndex.search('', {
    facetFilters: parseFacets(prePopulatedSearch.query),
    attributesToHighlight: [
      'text',
      'title',
    ],
  });

  const prepopulatedTotals = {
    confession: resp.nbHits,
  };

  return {
    props: {
      prePopulatedSearchResults: groupByDocument(
        resp.hits.map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      ),
      prePopulatedQuery: prePopulatedSearch.query,
      prepopulatedTotals,
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
  prepopulatedTotals,
}) => {
  const router = useRouter();
  const search = ('search' in router.query) ? router.query.search : prePopulatedQuery;
  const initialSearch = search || prePopulatedQuery;
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  // expanded documents, collapsed by default.
  const [expanded, setExpanded] = useState(prePopulatedExpanded);
  // collapsed chapters, expanded by default.
  const [collapsed, setCollapsed] = useState({});
  const [searchResults, setSearchResults] = useState(search ? [] : prePopulatedSearchResults);
  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState({
    bible: 0,
    confession: prepopulatedTotals.confession,
  });
  const [currentPg, setCurrentPg] = useState(0);
  const [hasMore, setHasMore] = useState(
    prepopulatedTotals.confession > getResultsLength(prePopulatedSearchResults),
  );
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
    window && window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchResults = throttle((clearExisting = false) => {
    const facetFilters = parseFacets(search);
    setIsLoading(true);
    if (searchTerm !== search) setSearchTerm(search);
    const queryWithoutFacetFilters = search
      .replace(regexV2, '')
      .replace(bibleRegex, '')
      .replace(keyWords, '');

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
          bible: results.find((o) => o.index === 'citations').nbHits,
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
    fetchResults(true);
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
        const groupedByChapter = groupContentByChapter(results);
        const showArticleNav = (
          // wcf.1.2
          (regexV2.test(searchTerm) && isFacetLength(searchTerm, 3))
          || (
            // wsc.1 or wsc
            DOCUMENTS_WITHOUT_ARTICLES.includes(documentId) && isEmptyKeywordSearch(search)
          )
        );
        const showChapterNav = isEmptyKeywordSearch(searchTerm);
        const isExpanded = (
          expanded.includes(documentId)
          || (searchTerm && searchTerm.match(regexV2) && !keyWords.test(searchTerm))

        );
        return acc.concat([
          <li>
            <h2 className="text-3xl lg:text-4xl w-full mb-24 flex flex-wrap text-center">
              <Link
                href={{ pathname: '/', query: { search: getConciseDocId(documentTitle) } }}
              >
                {documentTitle}
              </Link>
              <span className="text-xl lg:text-lg my-auto mx-auto 2xl:mt-0 2xl:ml-auto 2xl:mr-0">
                {`${results.length} ${results.length === 1 ? 'MATCH' : 'MATCHES'}`}
                <FontAwesomeIcon
                  className="ml-5 my-auto text-xl lg:text-lg cursor-pointer"
                  icon={isExpanded ? faMinus : faPlus}
                  onClick={() => handleExpand(documentId)}
                />
              </span>
            </h2>
            {isExpanded && (
              <ul className="relative mx-4">
                {Object
                  .keys(groupedByChapter)
                  .sort((a, b) => handleSortById({ id: a }, { id: b }))
                  .filter((key) => key.includes(documentId))
                  .map((chapterId) => {
                    const isResultChapter = isChapter(chapterId, contentById);
                    // No chapter results displayed.
                    if (isResultChapter) {
                      return (
                        <ConfessionChapterResult
                          docTitle={documentTitle}
                          docId={getConciseDocId(documentTitle)}
                          chapterId={chapterId.split('-')[1]}
                          showNav={showChapterNav}
                          title={contentById[chapterId].title}
                          searchTerms={searchTerm.split(' ')}
                          collapsedChapters={collapsed}
                          setCollapsed={setCollapsed}
                          data={groupedByChapter[chapterId]
                            .filter((obj) => !obj.isParent)
                            .map((obj) => ({
                              ...obj,
                              showNav: showArticleNav,
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
                          showNav={showArticleNav}
                          searchTerms={getSearchTerms(obj, searchTerm)}
                          contentById={contentById}
                          hideDocumentTitle
                        />
                      ));
                  })}
              </ul>
            )}
          </li>,
        ]);
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

  const handleClearSearch = (e) => {
    e.preventDefault();
    setSearchTerm('');
  };

  const [pgTitle, query] = usePgTitle(search);
  return (
    <div className="home flex flex-col p-8 w-full mt-24">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel&family=Cinzel+Decorative&family=Marcellus&display=swap" rel="stylesheet" />
      </Head>
      <SEO subTitle={pgTitle} query={query} />
      <Link
        href={{
          pathname: '',
          query: {
            search: '',
          },
        }}
      >
        <h1 className="cursor-pointer text-center text-4xl lg:text-5xl mx-auto max-w-2xl">
          Confessional Christianity
        </h1>
      </Link>
      <div className="w-full lg:w-1/2 mt-24 mx-auto sticky top-0 pt-10 pb-5 z-10 bg-white">
        <input
          ref={searchRef}
          type="text"
          className={`${isSticky ? ' shadow-lg' : ''} home-pg-search border border-gray-500 rounded-full leading-10 outline-none w-full pl-12 pr-12 py-2 relative`}
          value={searchTerm}
          onChange={handleSearchInput}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            if (!e.relatedTarget) return;
            const classes = e.relatedTarget.getAttribute('class');
            const clickedSearchOrClear = (
              classes && (
                classes.includes('home-pg-search-btn')
                || classes.includes('home-pg-clear-search')
              )
            );
            if (clickedSearchOrClear) {
              e.target.focus();
            }
          }}
        />
        <button className="absolute home-pg-search-btn" onClick={submitSearch} type="submit" tabIndex={-1} />
        <FontAwesomeIcon icon={faTimes} onClick={handleClearSearch} className="home-pg-clear-search absolute" tabIndex={-1} />
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
      {!isLoading && getResultsLength(searchResults) < 0 && (
        <p className="text-xl w-full text-center">
          No results found.
        </p>
      )}
      {hasMore && !isLoading && (
        <button type="submit" className="w-full mb-24" onClick={handleLoadMore}>LOAD MORE</button>
      )}
      <Footer
        links={[{ link: 'ABOUT', href: '/about' }, { link: 'BLOG', href: 'https://blog.confessionalchristianity.com' }]}
      />
    </div>
  );
};

export default HomePage;
