/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import path from 'path';
import fetch from 'isomorphic-fetch';
import queryString from 'query-string';
import { promises as fs } from 'fs';
import algoliasearch from 'algoliasearch';
import { throttle, trim, trimStart } from 'lodash';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import {
  confessionPathByName,
  confessionCitationByIndex,
} from '../dataMapping';

import { parseConfessionId, getCitationContextById } from '../helpers';
import { parseOsisBibleReference } from '../scripts/helpers';

const baseUrl = 'https://api.esv.org/v3/passage/text';
const getQueryParams = (bibleText) => queryString.stringify({
  q: bibleText,
  'content-type': 'json',
  'include-passage-references': false,
  'include-footnotes': false,
  'include-footnote-body': false,
  'include-headings': false,
});

const { NEXT_PUBLIC_ESV_API_SECRET } = process.env;
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
  const [showMore, setShowMore] = useState([]);
  const [bibleTextById, setBibleTextById] = useState({});

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

  const handleShowMore = (id) => {
    if (showMore.includes(id)) {
      setShowMore(showMore.filter((str) => str !== id));
    } else {
      setShowMore(showMore.concat([id]));
    }
  };

  const handleFetchCitation = (text, id) => {
    if (bibleTextById[id]) {
      setBibleTextById(Object
        .keys(bibleTextById)
        .filter((str) => str !== id)
        .reduce((acc, key) => ({ ...acc, [key]: bibleTextById[key] }), {}));
      return Promise.resolve();
    }
    return fetch(`${baseUrl}/?${getQueryParams(text)}`, {
      headers: {
        Authorization: `Token ${NEXT_PUBLIC_ESV_API_SECRET}`,
      },
    })
      .then((resp) => resp.json())
      .then((resp) => {
        const { passages, canonical } = resp;
        setBibleTextById({ ...bibleTextById, [id]: `${passages} (${canonical})` });
      });
  };

  const parseBibleText = (text) => {
    const textAsArr = text.split('(ESV)');
    const citationSummary = textAsArr[textAsArr.length - 1].split(';');
    const cleanCitation = new RegExp(/^[\s,(]|^[,]|[,)\s]$/);
    const cleanVerse = new RegExp(/^[\s,]/);
    return textAsArr
      .slice(0, textAsArr.length - 1)
      .map((str, i) => (
        <p className="my-2 w-full pl-4 border-l-4 flex flex-col">
          {trimStart(str).replace(cleanVerse, '')}
          <strong className="font-bold tracking-wider uppercase w-full my-4 ml-2 md:ml-4">
            {`~ ${trim(citationSummary[i]).replace(cleanCitation, '')} (ESV)`}
          </strong>
        </p>
      ));
  };

  const parseConfessionText = (obj, id) => (
    <div className="my-4 w-full ml-10 flex flex-col">
      {Object.keys(obj).includes('title') && (
        <h4 className="pl-4 border-l-4">{obj.title}</h4>
      )}
      {Object.keys(obj).includes('text') && (
        <p className="pl-4 border-l-4">{obj.text}</p>
      )}
      <p className="pl-8 border-l-4 py-4 font-bold">{`~ ${parseConfessionId(id)}`}</p>
    </div>
  );

  const renderCitedBy = (citedBy) => citedBy.map((id, i) => {
    const confessionName = confessionCitationByIndex[getCitationContextById(id, 1)][0];
    // chapter where scripture is cited etc...
    const citationTitle = confessionName.includes('Heidelberg')
      ? contentById[getCitationContextById(id, 3)].title
      : contentById[getCitationContextById(id, 2)].title;

    const idWithoutCitation = getCitationContextById(id, id.split('-').length - 1);
    return (
      <div className="pl-4 py-2">
        <p>
          {`${i + 1}. ${confessionName} ${citationTitle}`}
          <button
            type="submit"
            className="cursor-pointer mx-1 text-base focus:outline-none"
            onClick={() => handleShowMore(id)}
          >
            {showMore.includes(id) ? '(SHOW LESS)' : '(SHOW MORE)'}
          </button>
        </p>
        {showMore.includes(id) && parseConfessionText(contentById[idWithoutCitation], id)}
      </div>
    );
  });

  const renderResults = (result) => {
    if (result.index === 'aggregate') {
      const text = Object.keys(result).includes('text');
      return (
        <li className="w-full flex flex-col justify-center mb-24">
          <h2 className="text-3xl lg:text-4xl w-full text-center mb-24">{`The ${result.document}`}</h2>
          {result.document !== contentById[result.parent].title && (
            <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{contentById[result.parent].title}</h3>
          )}
          <Highlighter className="text-2xl" textToHighlight={result.title} searchWords={result._highlightResult.title.matchedWords} highlightClassName="search-result-matched-word" />
          {text && (
            <Highlighter className="mt-4" textToHighlight={result.text} searchWords={result._highlightResult.text.matchedWords} highlightClassName="search-result-matched-word" />
          )}
          {Object.keys(result).includes('verses') && (
            <ul className="mt-12">
              <li>
                {Object
                  .entries(result.verses)
                  .map(([citation, verses]) => {
                    const citationId = `${result.id}-${citation}`;
                    return (
                      <div className="citation-container flex flex-wrap py-2">
                        <ul className="flex flex-wrap items-center">
                          {[citation]
                            .concat(verses)
                            .map((v) => {
                              if (v.length < 3) {
                                return (
                                  <p className="text-lg mx-1">{`${v}: `}</p>
                                );
                              }
                              return (
                                <p className="text-lg mx-1">{parseOsisBibleReference(v)}</p>
                              );
                            })
                            .concat([
                              <button type="submit" className="cursor-pointer mx-1 text-base focus:outline-none" onClick={() => handleFetchCitation(verses.join(','), citationId)}>
                                {Object.keys(bibleTextById).includes(citationId) ? '(SHOW LESS)' : '(SHOW MORE)'}
                              </button>,
                            ])}
                        </ul>
                        {Object.keys(bibleTextById).includes(citationId) && (
                          <div className="verses ml-5 lg:ml-10">
                            {parseBibleText(bibleTextById[citationId])}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </li>
            </ul>
          )}
        </li>
      );
    }
    return (
      <li className="w-full flex flex-col justify-center">
        <Highlighter
          highlightClassName="search-result-matched-word"
          className="text-3xl lg:text-4xl w-full text-center mb-24"
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
          {renderCitedBy(result.citedBy)}
        </div>
      </li>
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
    .reduce((prevPromise, [key, value]) => prevPromise.then(async (acc) => {
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
      prePopulatedSearchResults: resp.hits.map((obj) => ({ ...obj, index: prePopulatedSearch.index })),
      prePopulatedQuery: prePopulatedSearch.query,
      contentById,
    },
  };
}

export default HomePage;
