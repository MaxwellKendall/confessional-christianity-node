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
import { generateLink } from '../helpers';
import { facetNamesByCanonicalDocId } from '../dataMapping';

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
  const confessionId = `${docId}-${chapterId}`;
  const nextConfessionId = `${docId}-${chapterIdAsInt + 1}`;
  const prevConfessionId = `${docId}-${chapterIdAsInt - 1}`;
  const hasPrevious = elaborateId && Object.keys(contentById).some((k) => k.includes(`${elaborateId}-${chapterIdAsInt - 1}-`));
  const hasNext = elaborateId && Object.keys(contentById).some((k) => k.includes(`${elaborateId}-${chapterIdAsInt + 1}-`));

  // Refactor to be its own component.
  const renderNav = () => [{ direction: 1, show: hasNext }, { direction: -1, show: hasPrevious }]
    .filter(({ show }) => show)
    .map((obj) => (
      <li className={obj.direction > 0 ? 'absolute top-0 left-full ml-2 lg:ml-5' : 'absolute top-0 right-full mr-2 lg:mr-5'}>
        <Link
          scroll={false}
          className="relative left-full"
          href={obj.direction > 0
            ? generateLink(nextConfessionId, facetNamesByCanonicalDocId[docId])
            : generateLink(prevConfessionId, facetNamesByCanonicalDocId[docId])}
        >
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
          <Link scroll={false} href={generateLink(confessionId, facetNamesByCanonicalDocId[docId])}>
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
              chapterId={chapterId}
              docId={docId}
              docTitle={docTitle}
              contentById={contentById}
            />
          ))}
      </ul>
    </li>
  );
};

export default ConfessionChapterResult;
