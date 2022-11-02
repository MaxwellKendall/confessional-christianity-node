/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { uniqueId } from 'lodash';

import Link from 'next/link';
import {
  parseConfessionId, getCitationContextById, generateLink, sliceConfessionId,
} from '../helpers';
import { confessionCitationByIndex } from '../dataMapping';

const BibleTextResult = ({
  contentById,
  bibleText,
  citation,
  citedBy,
  _highlightResult,
}) => {
  const [showMore, setShowMore] = useState([]);

  const handleShowMore = (id) => {
    if (showMore.includes(id)) {
      setShowMore(showMore.filter((str) => str !== id));
    } else {
      setShowMore(showMore.concat([id]));
    }
  };

  const parseConfessionText = (obj, id) => (
    <div className="my-4 w-full ml-10 flex flex-col">
      <Link href={generateLink(sliceConfessionId(id, id.split('-').length - 1))}>
        <a>
          {Object.keys(obj).includes('title') && (
          <h4 className="pl-4 border-l-4">{obj.title}</h4>
          )}
          {Object.keys(obj).includes('text') && (
          <p className="pl-4 border-l-4">{obj.text}</p>
          )}
          <p className="pl-8 border-l-4 py-4 font-bold">{`~ ${parseConfessionId(id)}`}</p>
        </a>
      </Link>
    </div>
  );

  const renderCitedBy = () => citedBy.map((id, i) => {
    const confessionName = confessionCitationByIndex[getCitationContextById(id, 1)][0];
    // chapter where scripture is cited etc...
    const citationTitle = confessionName.includes('Heidelberg')
      ? contentById[getCitationContextById(id, 3)].title
      : contentById[getCitationContextById(id, 2)].title;
    const idWithoutCitation = getCitationContextById(id, id.split('-').length - 1);
    return (
      <div className="pl-4 py-2">
        <p>
          <Link className="cursor-pointer" href={generateLink(idWithoutCitation)}>
            <a className="cursor-pointer">
              {`${i + 1}. ${confessionName} ${citationTitle}`}
            </a>
          </Link>
          <button
            type="submit"
            className="cursor-pointer mx-1 text-base focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              handleShowMore(id);
            }}
          >
            {showMore.includes(id) ? '(SHOW LESS)' : '(SHOW MORE)'}
          </button>
        </p>
        {showMore.includes(id) && parseConfessionText(contentById[idWithoutCitation], id)}
      </div>
    );
  });

  return (
    <li key={uniqueId()} className="w-full flex flex-col justify-center">
      <Link
        className="cursor-pointer"
        href={{
          pathname: '',
          query: {
            search: citation,
          },
        }}
      >
        <div className="flex flex-col cursor-pointer">
          <Highlighter
            highlightClassName="search-result-matched-word"
            className="text-3xl lg:text-4xl w-full text-center mb-24"
            textToHighlight={citation}
            searchWords={_highlightResult.citation.matchedWords}
          />
          <Highlighter
            className="mt-4"
            highlightClassName="search-result-matched-word"
            textToHighlight={bibleText}
            searchWords={_highlightResult.bibleText.matchedWords}
          />
        </div>
      </Link>
      <div className="citations pt-5 mb-24">
        <h3>Passage Cited by:</h3>
        {renderCitedBy()}
      </div>
    </li>
  );
};

export default BibleTextResult;
