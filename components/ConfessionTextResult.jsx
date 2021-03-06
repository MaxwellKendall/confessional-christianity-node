/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import fetch from 'isomorphic-fetch';
import queryString from 'query-string';
import { trim, trimStart } from 'lodash';

import { parseOsisBibleReference } from '../scripts/helpers';

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
  document,
  text = '',
  title,
  id: confessionId,
  parent: parentId,
  verses = {},
  _highlightResult,
}) => {
  const [bibleTextById, setBibleTextById] = useState({});

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
    return fetch(`${baseUrl}/?${getQueryParams(bibleText)}`, {
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

  return (
    <li className="w-full flex flex-col justify-center mb-24">
      <h2 className="text-3xl lg:text-4xl w-full text-center mb-24">{`The ${document}`}</h2>
      {document !== contentById[parentId].title && (
        <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{contentById[parentId].title}</h3>
      )}
      <Highlighter className="text-2xl" textToHighlight={title} searchWords={_highlightResult.title.matchedWords} highlightClassName="search-result-matched-word" />
      {text && (
        <Highlighter className="mt-4" textToHighlight={text} searchWords={_highlightResult.text.matchedWords} highlightClassName="search-result-matched-word" />
      )}
      {Object.keys(verses).length && (
        <ul className="mt-12">
          <li>
            {Object
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
};

export default ConfessionTextResult;
