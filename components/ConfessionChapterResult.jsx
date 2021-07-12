/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import { uniqueId } from 'lodash';
import Highlighter from 'react-highlight-words';
import Link from 'next/link';

import { excludedWordsInDocumentId } from '../dataMapping';
import ConfessionTextResult from './ConfessionTextResult';

const generateLink = (docTitle, chapterId) => {
  const docId = docTitle
    .toUpperCase()
    .split(' ')
    .filter((w) => !excludedWordsInDocumentId.includes(w))
    .reduce((acc, str) => `${acc}${str[0]}`, '');

  return {
    pathname: '/',
    query: {
      search: `document:${docId} chapter:${chapterId.split('-')[1]}`,
    },
  };
};

const ConfessionChapterResult = ({
  docTitle = null,
  chapterId = null,
  title,
  data,
  contentById,
  searchTerms = '',
}) => (
  <li key={uniqueId()} className="w-full flex flex-col justify-center mb-24">
    {docTitle && chapterId && searchTerms.length > 0 && (
      <Link href={generateLink(docTitle, chapterId)}>
        <Highlighter className="cursor-pointer header text-3xl lg:text-4xl w-full text-center mb-24 uppercase" textToHighlight={title} searchWords={searchTerms} highlightClassName="search-result-matched-word" />
      </Link>
    )}
    {docTitle && chapterId && !searchTerms && (
      <Link href={generateLink(docTitle, chapterId)}>
        <h3 className="cursor-pointer text-3xl lg:text-4xl w-full text-center mb-24">{title}</h3>
      </Link>
    )}
    <ul>
      {data
        .map((d) => (
          <ConfessionTextResult
            {...d}
            contentById={contentById}
          />
        ))}
    </ul>
  </li>
);

export default ConfessionChapterResult;
