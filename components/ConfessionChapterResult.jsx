/* eslint-disable no-underscore-dangle */
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
  searchTerms = '',
}) => (
  <li key={uniqueId()} className="w-full flex flex-col justify-center mb-24">
    {!searchTerms.length > 0 && (
      <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{title}</h3>
    )}
    {searchTerms.length > 0 && (
      <Highlighter className="header text-3xl lg:text-4xl w-full text-center mb-24 uppercase" textToHighlight={title} searchWords={searchTerms} highlightClassName="search-result-matched-word" />
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
