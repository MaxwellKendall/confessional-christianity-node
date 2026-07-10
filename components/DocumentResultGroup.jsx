/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import { getConfessionalAbbreviationId } from '../scripts/helpers';
import {
  isChapter, groupContentByChapter, handleSortById, getConciseDocId,
} from '../helpers';
import ConfessionChapterResult from './ConfessionChapterResult';
import ConfessionTextResult from './ConfessionTextResult';

// Renders one document's worth of matched entries: a title/match-count header
// with an expand/collapse toggle, and either a ConfessionChapterResult (when
// the match is a whole chapter) or ConfessionTextResult (a single entry) per
// result. Shared by the homepage search results and the per-entry pages, so
// both surfaces stay visually and behaviorally identical.
/**
 * @param {object} props
 * @param {ContentById} props.contentById
 */
const DocumentResultGroup = ({
  documentTitle,
  results,
  contentById,
  showArticleNav,
  showChapterNav,
  searchTerms = [],
  getResultSearchTerms = () => [],
  collapsed,
  setCollapsed,
  isExpanded,
  onToggleExpand,
}) => {
  const documentId = getConfessionalAbbreviationId(documentTitle);
  const conciseDocId = getConciseDocId(documentTitle);
  const groupedByChapter = groupContentByChapter(results);

  return (
    <li>
      <h2 className="text-3xl lg:text-4xl w-full mb-24 flex flex-wrap text-center">
        <Link href={{ pathname: '/', query: { search: conciseDocId } }}>
          {documentTitle}
        </Link>
        <span className="text-xl lg:text-lg my-auto mx-auto 2xl:mt-0 2xl:ml-auto 2xl:mr-0">
          {`${results.length} ${results.length === 1 ? 'MATCH' : 'MATCHES'}`}
          <FontAwesomeIcon
            className="ml-5 my-auto text-xl lg:text-lg cursor-pointer"
            icon={isExpanded ? faMinus : faPlus}
            onClick={onToggleExpand}
          />
        </span>
      </h2>
      {isExpanded && (
        <ul className="relative mx-4">
          {Object
            .keys(groupedByChapter)
            .sort((a, b) => handleSortById({ id: a }, { id: b }))
            .filter((key) => key.includes(documentId))
            .map((chapterId) => {
              const isResultChapter = isChapter(chapterId, contentById);
              if (isResultChapter) {
                return (
                  <ConfessionChapterResult
                    docTitle={documentTitle}
                    docId={conciseDocId}
                    chapterId={chapterId.split('-')[1]}
                    showNav={showChapterNav}
                    title={contentById[chapterId].title}
                    searchTerms={searchTerms}
                    collapsedChapters={collapsed}
                    setCollapsed={setCollapsed}
                    data={groupedByChapter[chapterId]
                      .filter((obj) => !obj.isParent)
                      .map((obj) => ({
                        ...obj,
                        showNav: showArticleNav,
                        searchTerms: getResultSearchTerms(obj),
                        hideChapterTitle: true,
                        hideDocumentTitle: true,
                        setCollapsed,
                      }))
                      .sort(handleSortById)}
                    contentById={contentById}
                  />
                );
              }
              return groupedByChapter[chapterId]
                .map((obj) => (
                  <ConfessionTextResult
                    {...obj}
                    chapterId={chapterId.split('-')[1]}
                    docTitle={documentTitle}
                    docId={conciseDocId}
                    linkToChapter
                    showNav={showArticleNav}
                    searchTerms={getResultSearchTerms(obj)}
                    contentById={contentById}
                    hideDocumentTitle
                  />
                ));
            })}
        </ul>
      )}
    </li>
  );
};

export default DocumentResultGroup;
