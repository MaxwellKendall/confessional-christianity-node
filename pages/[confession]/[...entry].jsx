import React, { useEffect } from 'react';
import { capitalize } from 'lodash';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { confessionPathByName } from '../../dataMapping';
import { loadConfessionContent } from '../../lib/confessionContent';
import {
  compareEntryIds,
  entryIdToPathSegments,
  truncateForMeta,
} from '../../helpers';
import Header from '../../components/Header';
import ConfessionTextResult from '../../components/ConfessionTextResult';
import SEO, { SITE_URL } from '../../components/SEO';
import { track, EVENTS } from '../../lib/analytics';

export const getStaticPaths = async () => {
  const paths = (await Promise.all(
    Object.keys(confessionPathByName).map(async (slug) => {
      const { contentById, documentId } = await loadConfessionContent(slug);
      return Object
        .values(contentById)
        .filter((item) => !item.isParent)
        .map((item) => ({
          params: {
            confession: slug,
            entry: entryIdToPathSegments(item.id, documentId),
          },
        }));
    }),
  )).flat();

  return { paths, fallback: false };
};

export const getStaticProps = async (context) => {
  const { confession: slug, entry } = context.params;
  const { contentById, documentId } = await loadConfessionContent(slug);
  const id = `${documentId}-${entry.join('-')}`;
  const item = contentById[id];

  if (!item) return { notFound: true };

  const documentTitle = capitalize(slug.split('-').join(' '));
  const parentEntry = contentById[item.parent];

  const leafIds = Object
    .values(contentById)
    .filter((v) => !v.isParent)
    .map((v) => v.id)
    .sort(compareEntryIds);
  const currentIndex = leafIds.indexOf(id);
  const prevId = currentIndex > 0 ? leafIds[currentIndex - 1] : null;
  const nextId = currentIndex < leafIds.length - 1 ? leafIds[currentIndex + 1] : null;

  const toHref = (entryId) => `/${slug}/${entryIdToPathSegments(entryId, documentId).join('/')}`;

  return {
    props: {
      slug,
      documentId,
      documentTitle,
      item,
      parentTitle: parentEntry ? parentEntry.title : null,
      canonicalUrl: `${SITE_URL}/${slug}/${entry.join('/')}`,
      description: truncateForMeta(item.text),
      prevHref: prevId ? toHref(prevId) : null,
      nextHref: nextId ? toHref(nextId) : null,
    },
  };
};

const ConfessionEntry = ({
  slug,
  documentId,
  documentTitle,
  item,
  parentTitle,
  canonicalUrl,
  description,
  prevHref,
  nextHref,
}) => {
  useEffect(() => {
    track(EVENTS.CONFESSION_VIEWED, {
      confession_id: documentId,
      confession_title: documentTitle,
      entry_id: item.id,
      entry_title: item.title,
    });
  }, [documentId, documentTitle, item.id, item.title]);

  return (
    <div className="home flex flex-col w-full">
      <SEO
        title={`${item.title} | ${documentTitle}`}
        description={description}
        canonicalUrl={canonicalUrl}
        subTitle={item.title}
        query={documentTitle}
      />
      <Header />
      <div className="p-8 my-12">
        <h2 className="text-3xl lg:text-4xl my-12 flex flex-wrap justify-center w-full lg:w-1/2 mx-auto">
          <Link href={`/${slug}`}>
            <span className="cursor-pointer">{documentTitle}</span>
          </Link>
        </h2>
        {parentTitle && (
          <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{parentTitle}</h3>
        )}
        <ul className="results w-full lg:w-1/2 mx-auto relative">
          <ConfessionTextResult
            {...item}
            docId={documentId}
            docTitle={documentTitle}
            contentById={{}}
            searchTerms={[]}
            showNav={false}
            hideChapterTitle
          />
          {prevHref && (
            <li className="absolute top-2 right-full">
              <Link scroll={false} className="text-md p-4" href={prevHref}>
                <FontAwesomeIcon className="cursor-pointer" icon={faChevronLeft} />
              </Link>
            </li>
          )}
          {nextHref && (
            <li className="absolute top-2 left-full">
              <Link scroll={false} className="text-md p-4" href={nextHref}>
                <FontAwesomeIcon className="cursor-pointer" icon={faChevronRight} />
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ConfessionEntry;
