import React from 'react';
import { capitalize, groupBy } from 'lodash';
import path from 'path';
import { promises } from 'fs';

import { confessionPathByName, confessionCitationByIndex, confessionIdsWithoutTitles } from '../dataMapping';
import { parseOsisBibleReference } from '../scripts/helpers';
import { getContentById } from './index';
import { getDocumentId, handleSortById, isChapter } from '../helpers';
import ConfessionChapterResult from '../components/ConfessionChapterResult';
import ConfessionTextResult from '../components/ConfessionTextResult';

export const getStaticProps = async (context) => {
  const contentById = await Object
    .entries(confessionPathByName)
    .filter(([key]) => key === context.params.confession)
    .reduce((prevPromise, [, value]) => prevPromise.then(async (acc) => {
      const pathToConfession = path.join(process.cwd(), value);
      const fileContents = await promises.readFile(pathToConfession, 'utf8');
      const parsed = JSON.parse(fileContents);
      const asObject = parsed.content
        .reduce((asObj, obj) => ({
          ...asObj,
          [obj.id]: obj,
        }), {});
      return Promise.resolve({
        ...acc,
        ...asObject,
      });
    }), Promise.resolve({}));
  
  return {
    props: {
      contentById,
      title: capitalize(context.params.confession.split('-').join(' ')),
      documentId: Object
        .entries(contentById)
        .find(([k, v]) => v.parent.split('-').length === 1)[1].parent
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
  documentId
}) => {
  const renderContent = () => {
    const chapters = Object
      .keys(contentById)
      .filter((id) => isChapter(id, contentById))
      .sort((a, b) => {
        const first = parseInt(a.split('-')[1], 10);
        const second = parseInt(b.split('-')[1], 10);
        return first - second;
      })

    if (confessionIdsWithoutTitles.includes(documentId)) {
      return Object
        .entries(contentById)
        .map(([key, obj]) => {
          return (
            <ConfessionTextResult
              {...obj}
              contentById={contentById}
              searchTerms={[]}
            />
          )
        })
      }

    return chapters
      .map((key) => {
        const children = Object
          .entries(contentById)
          .filter(([k, obj]) => {
            return (
              obj.parent === key ||
              obj.parent === `${key}-articles` ||
              obj.parent === `${key}-rejections`
            );
          })
          .reduce((acc, [k, v]) => {
            return acc.concat(v);
          }, []);

        return (
          <ConfessionChapterResult
            title={contentById[key].title}
            searchTerms={[]}
            data={children
              .map((c) => ({
                ...c,
                searchTerms: [],
                hideChapterTitle: true,
                hideDocumentTitle: true
              }))}
            contentById={contentById}
          />
        );
      })
  };

  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <h1 className="text-center text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <h2 className="my-24 text-3xl mx-auto text-center w-full">{title}</h2>
      <ul className="w-full max-4xl lg:px-48">
        {renderContent()}
      </ul>
    </div>
  );
};

export default Confession;
