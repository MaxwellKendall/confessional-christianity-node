/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';

import { parseConfessionId, getCitationContextById } from '../helpers';
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
      {Object.keys(obj).includes('title') && (
        <h4 className="pl-4 border-l-4">{obj.title}</h4>
      )}
      {Object.keys(obj).includes('text') && (
        <p className="pl-4 border-l-4">{obj.text}</p>
      )}
      <p className="pl-8 border-l-4 py-4 font-bold">{`~ ${parseConfessionId(id)}`}</p>
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

  return (
    <li className="w-full flex flex-col justify-center">
      <Highlighter
        highlightClassName="search-result-matched-word"
        className="text-3xl lg:text-4xl w-full text-center mb-24"
        textToHighlight={citation}
        searchWords={_highlightResult.citation.matchedWords}
      />
      <Highlighter
        className="mt-4"
        textToHighlight={bibleText}
        searchWords={_highlightResult.bibleText.matchedWords}
      />
      <div className="citations pt-5 mb-24">
        <h3>Passage Cited by:</h3>
        {renderCitedBy()}
      </div>
    </li>
  );
};

export default BibleTextResult;
