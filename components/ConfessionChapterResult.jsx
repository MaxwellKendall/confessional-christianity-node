/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import { uniqueId } from 'lodash';
import Highlighter from 'react-highlight-words';

import ConfessionTextResult from './ConfessionTextResult';

const ConfessionChapterResult = ({
  title,
  data,
  contentById,
  searchTerm = '',
}) => (
  <li key={uniqueId()} className="w-full flex flex-col justify-center mb-24">
    {!searchTerm && (
      <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{title}</h3>
    )}
    {searchTerm && (
      <Highlighter className="header text-3xl lg:text-4xl w-full text-center mb-24" textToHighlight={title} searchWords={[searchTerm]} highlightClassName="search-result-matched-word" />
    )}
    <ul>
      {data
        .map((d) => (
          <ConfessionTextResult {...d} contentById={contentById} searchTerms={[searchTerm]} />
        ))}
    </ul>
  </li>
);

export default ConfessionChapterResult;
