/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import fetch from 'isomorphic-fetch';
import queryString from 'query-string';
import { trim, trimStart, uniqueId } from 'lodash';
import { parseOsisBibleReference } from '../scripts/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const { NEXT_PUBLIC_ESV_API_SECRET } = process.env;
const baseUrl = 'https://api.esv.org/v3/passage/text';
const getQueryParams = (bibleText) => queryString.stringify({
  q: bibleText,
  'content-type': 'json',
  'include-passage-references': false,
  'include-footnotes': false,
  'include-footnote-body': false,
  'include-headings': false,
});

const ConfessionTextResult = ({
  contentById,
  searchTerms,
  document = '',
  text = '',
  title,
  id: confessionId,
  parent: parentId,
  hideChapterTitle = false,
  verses = {},
}) => {
  const [bibleTextById, setBibleTextById] = useState({});
  const [loadingTexts, setLoadingTexts] = useState([]);

  const parseBibleText = (t) => {
    const textAsArr = t.split('(ESV)');
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

  const handleFetchCitation = (bibleText, id) => {
    if (bibleTextById[id]) {
      setBibleTextById(Object
        .keys(bibleTextById)
        .filter((str) => str !== id)
        .reduce((acc, key) => ({ ...acc, [key]: bibleTextById[key] }), {}));
      return Promise.resolve();
    }
    setLoadingTexts(id);
    return fetch(`${baseUrl}/?${getQueryParams(bibleText)}`, {
      headers: {
        Authorization: `Token ${NEXT_PUBLIC_ESV_API_SECRET}`,
      },
    })
      .then((resp) => resp.json())
      .then((resp) => {
        const { passages, canonical } = resp;
        setBibleTextById({ ...bibleTextById, [id]: `${passages} (${canonical})` });
        setLoadingTexts(loadingTexts.filter((t) => t !== id));
      });
  };

  const renderVerses = () => Object
    .entries(verses)
    .map(([citation, value]) => {
      const citationId = `${confessionId}-${citation}`;
      return (
        <div className="citation-container flex flex-wrap py-2">
          <ul className="flex flex-wrap items-center">
            {[citation]
              .concat(value)
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
                <button type="submit" className="cursor-pointer mx-1 text-base focus:outline-none" onClick={() => handleFetchCitation(value.join(','), citationId)}>
                  {Object.keys(bibleTextById).includes(citationId) ? '(SHOW LESS)' : '(SHOW MORE)'}
                </button>,
              ])}
          </ul>
          <div className="my-2 w-full pl-4 border-l-4 flex flex-col">
            {loadingTexts.includes(citationId) && (
              <FontAwesomeIcon icon={faSpinner} spin />
            )}
          </div>
          {Object.keys(bibleTextById).includes(citationId) && (
            <div className="verses ml-5 lg:ml-10">
              {parseBibleText(bibleTextById[citationId])}
            </div>
          )}
        </div>
      );
    });

  const renderTitle = () => {
    if (confessionId.includes('WSC') || confessionId.includes('WLC')) return null;
    if (!hideChapterTitle && document.toUpperCase() !== contentById[parentId].title.toUpperCase()) {
      return <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{contentById[parentId].title}</h3>;
    }
    return null;
  };

  return (
    <li key={uniqueId(confessionId)} className="w-full flex flex-col justify-center mb-24">
      {renderTitle()}
      {searchTerms.length && (
        <>
          <Highlighter className="text-2xl" textToHighlight={title} searchWords={searchTerms} highlightClassName="search-result-matched-word" />
          <Highlighter className="mt-4" textToHighlight={text} searchWords={searchTerms} highlightClassName="search-result-matched-word" />
        </>
      )}
      {!searchTerms.length && (
        <>
          <h4 className="text-2xl">{title}</h4>
          <p className="mt-4">{text}</p>
        </>
      )}
      {Object.keys(verses).length && (
        <ul className="mt-12">
          <li key={uniqueId()}>
            {renderVerses(verses)}
          </li>
        </ul>
      )}
    </li>
  );
};

export default ConfessionTextResult;
