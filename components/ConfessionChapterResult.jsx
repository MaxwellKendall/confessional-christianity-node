/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import Highlighter from 'react-highlight-words';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft, faChevronRight, faMinus, faPlus,
} from '@fortawesome/free-solid-svg-icons';

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
  collapsedChapters,
  setCollapsed,
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
          onClick={() => {
            if (obj.direction > 0) {
              setCollapsed({ [nextConfessionId]: false });
            } else {
              setCollapsed({ [prevConfessionId]: false });
            }
          }}
          href={obj.direction > 0
            ? generateLink(nextConfessionId, facetNamesByCanonicalDocId[docId])
            : generateLink(prevConfessionId, facetNamesByCanonicalDocId[docId])}
        >
          {obj.direction > 0
            ? (
              <FontAwesomeIcon
                className="cursor-pointer"
                onClick={() => setCollapsed({ [nextConfessionId]: false })}
                icon={faChevronRight}
                size="xs"
              />
            )
            : (
              <FontAwesomeIcon
                className="cursor-pointer"
                onClick={() => setCollapsed({ [prevConfessionId]: false })}
                icon={faChevronLeft}
                size="xs"
              />
            )}
        </Link>
      </li>
    ));

  const isCollapsed = !!collapsedChapters[confessionId];
  const expandCollapseIcon = isCollapsed ? faPlus : faMinus;

  return (
    <li key={`${docId}-${chapterId}`} className="w-full flex flex-col justify-center mb-24">
      <>
        {docId && chapterId && (
          <Link scroll={false} href={generateLink(confessionId)}>
            <a
              role="button"
              onClick={() => setCollapsed({ [confessionId]: false })}
              className="cursor-pointer header text-3xl lg:text-4xl w-full text-center mb-24 uppercase"
            >
              <Highlighter textToHighlight={title} searchWords={searchTerms || []} highlightClassName="search-result-matched-word" />
              {/* {!showNav && ( */}
              <FontAwesomeIcon
                className="p-2 cursor-pointer"
                size="sm"
                icon={expandCollapseIcon}
                onClick={isCollapsed
                  ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCollapsed({ ...collapsedChapters, [confessionId]: false });
                  }
                  : (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCollapsed({ ...collapsedChapters, [confessionId]: true });
                  }}
              />
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
      <ul className="relative">
        {data
          .filter(() => !isCollapsed)
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
