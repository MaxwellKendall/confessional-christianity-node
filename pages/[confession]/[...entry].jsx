import React, { useEffect } from 'react';
import { capitalize } from 'lodash';
import Link from 'next/link';

import { confessionPathByName } from '../../dataMapping';
import { loadConfessionContent } from '../../lib/confessionContent';
import { entryIdToPathSegments, truncateForMeta } from '../../helpers';
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

  // ConfessionTextResult's own prev/next nav only ever looks up
  // `${documentId}-${secondFragment +/- 1}` (see getNextConfessionId), so
  // only ship those two lookup keys instead of the whole document's content.
  const [, chapterOrNumber] = id.split('-');
  const neighborContentById = [1, -1].reduce((acc, offset) => {
    const neighborId = `${documentId}-${Number(chapterOrNumber) + offset}`;
    return contentById[neighborId] ? { ...acc, [neighborId]: true } : acc;
  }, {});

  return {
    props: {
      slug,
      documentId,
      documentTitle,
      contentById: neighborContentById,
      item,
      parentTitle: parentEntry ? parentEntry.title : null,
      canonicalUrl: `${SITE_URL}/${slug}/${entry.join('/')}`,
      description: truncateForMeta(item.text),
    },
  };
};

const ConfessionEntry = ({
  slug,
  documentId,
  documentTitle,
  contentById,
  item,
  parentTitle,
  canonicalUrl,
  description,
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
        <ul className="results w-full lg:w-1/2 mx-auto">
          <ConfessionTextResult
            {...item}
            docId={documentId}
            docTitle={documentTitle}
            contentById={contentById}
            searchTerms={[]}
            showNav
            hideChapterTitle
          />
        </ul>
      </div>
    </div>
  );
};

export default ConfessionEntry;
