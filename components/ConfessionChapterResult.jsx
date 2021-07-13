/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import { uniqueId } from 'lodash';
import Highlighter from 'react-highlight-words';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import ConfessionTextResult from './ConfessionTextResult';
import { getConfessionalAbbreviationId } from '../scripts/helpers';

const generateLink = (docId, chapterId) => ({
  pathname: '/',
  query: {
    search: `document:${docId} chapter:${chapterId}`,
  },
});

const ConfessionChapterResult = ({
  docId = null,
  chapterId = null,
  docTitle = null,
  showNav = false,
  title,
  data,
  contentById,
  searchTerms = '',
}) => {
  const elaborateId = docTitle ? getConfessionalAbbreviationId(docTitle) : null;
  const chapterIdAsInt = parseInt(chapterId, 10);
  const hasPrevious = elaborateId && !!contentById[`${elaborateId}-${chapterIdAsInt - 1}-1`];
  const hasNext = elaborateId && !!contentById[`${elaborateId}-${chapterIdAsInt + 1}-1`];

  const renderNav = () => [{ direction: 1, show: hasNext }, { direction: -1, show: hasPrevious }]
    .filter(({ show }) => show)
    .map((obj) => (
      <li className={obj.direction > 0 ? 'absolute top-0 left-full ml-2 lg:ml-5' : 'absolute top-0 right-full mr-2 lg:mr-5'}>
        <Link scroll={false} href={generateLink(docId, chapterIdAsInt + obj.direction)} className="relative left-full">
          {obj.direction > 0
            ? <FontAwesomeIcon className="cursor-pointer" icon={faChevronRight} size="xs" />
            : <FontAwesomeIcon className="cursor-pointer" icon={faChevronLeft} size="xs" />}
        </Link>
      </li>
    ));

  return (
    <li key={uniqueId()} className={`w-full flex flex-col justify-center mb-24 ${showNav ? ' absolute' : ''}`}>
      <>
        {docId && chapterId && (
          <Link scroll={false} href={generateLink(docId, chapterId)}>
            <a className="cursor-pointer header text-3xl lg:text-4xl w-full text-center mb-24 uppercase">
              {searchTerms && (
                <Highlighter textToHighlight={title} searchWords={searchTerms} highlightClassName="search-result-matched-word" />
              )}
              {!searchTerms && (
                <h3>{title}</h3>
              )}
              {showNav && (
                <ul>
                  {renderNav()}
                </ul>
              )}
            </a>
          </Link>
        )}
        {!docId && !chapterId && !searchTerms && (
          <h3 className="cursor-pointer text-3xl lg:text-4xl w-full text-center mb-24">{title}</h3>
        )}
      </>
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
}

export default ConfessionChapterResult;
