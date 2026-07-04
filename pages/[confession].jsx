import React, { useState, useEffect } from 'react';
import { capitalize } from 'lodash';

import { confessionPathByName, confessionIdsWithoutTitles } from '../dataMapping';
import { isChapter, truncateForMeta } from '../helpers';
import { loadConfessionContent } from '../lib/confessionContent';
import ConfessionChapterResult from '../components/ConfessionChapterResult';
import ConfessionTextResult from '../components/ConfessionTextResult';
import Header from '../components/Header';
import SEO, { SITE_URL } from '../components/SEO';
import { track, EVENTS } from '../lib/analytics';

export const getStaticProps = async (context) => {
  const { contentById, documentId } = await loadConfessionContent(context.params.confession);
  const title = capitalize(context.params.confession.split('-').join(' '));
  const firstEntry = Object.values(contentById).find((v) => !v.isParent);

  return {
    props: {
      contentById,
      title,
      documentId,
      description: firstEntry ? truncateForMeta(firstEntry.text) : null,
      canonicalUrl: `${SITE_URL}/${context.params.confession}`,
    },
  };
};

export async function getStaticPaths() {
// will be passed to the page component as props
  return {
    paths: Object.keys(confessionPathByName).map((c) => ({ params: { confession: c } })),
    fallback: false,
  };
}

const Confession = ({
  title,
  contentById,
  documentId,
  description,
  canonicalUrl,
}) => {
  const [collapsed, setCollapsed] = useState({});

  // Track confession viewed
  useEffect(() => {
    track(EVENTS.CONFESSION_VIEWED, {
      confession_id: documentId,
      confession_title: title,
    });
  }, [documentId, title]);

  const renderContent = () => {
    const chapters = Object
      .keys(contentById)
      .filter((id) => isChapter(id, contentById))
      .sort((a, b) => {
        const first = parseInt(a.split('-')[1], 10);
        const second = parseInt(b.split('-')[1], 10);
        return first - second;
      });

    if (confessionIdsWithoutTitles.includes(documentId)) {
      return Object
        .entries(contentById)
        .map(([key, obj]) => (
          <ConfessionTextResult
            {...obj}
            docId={documentId}
            chapterId={obj.id.split('-')[1]}
            docTitle={title}
            contentById={contentById}
            searchTerms={[]}
          />
        ));
    }

    return chapters
      .map((key) => {
        const children = Object
          .entries(contentById)
          .filter(([k, obj]) => (
            obj.parent === key
              || obj.parent === `${key}-articles`
              || obj.parent === `${key}-rejections`
          ))
          .reduce((acc, [k, v]) => acc.concat(v), []);

        return (
          <ConfessionChapterResult
            docId={documentId}
            chapterId={key.split('-')[1]}
            docTitle={title}
            collapsedChapters={collapsed}
            setCollapsed={setCollapsed}
            title={contentById[key].title}
            data={children
              .map((c) => ({
                ...c,
                searchTerms: [],
                hideChapterTitle: true,
                hideDocumentTitle: true,
              }))}
            contentById={contentById}
          />
        );
      });
  };

  return (
    <div className="home flex flex-col w-full">
      <SEO title={`${title} | Confessional Christianity`} description={description} canonicalUrl={canonicalUrl} />
      <Header />
      <div className="p-8 my-12">
        <h2 className="text-3xl lg:text-4xl my-12 flex flex-wrap justify-center w-full lg:w-1/2 mx-auto">{title}</h2>
        <ul className="results w-full lg:w-1/2 mx-auto">
          {renderContent()}
        </ul>
      </div>
    </div>
  );
};

export default Confession;
