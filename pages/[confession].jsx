import React from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import { groupBy } from 'lodash';

import { confessionCitationByIndex } from '../helpers';
import { parseOsisBibleReference } from '../scripts/helpers';

const confessionPathByName = {
  'westminster-confession-of-faith': 'normalized-data/westminster/wcf.json',
  'westminster-larger-catechism': 'normalized-data/westminster/wlc.json',
  'westminster-shorter-catechism': 'normalized-data/westminster/wsc.json',
  'heidelberg-catechism': 'normalized-data/three-forms-of-unity/heidelberg-catechism.json',
};

export const getStaticProps = async (context) => {
  const pathToConfession = path.join(process.cwd(), confessionPathByName[context.params.confession]);
  const fileContents = await fs.readFile(pathToConfession, 'utf8');
  console.log('contents', fileContents);
  return {
    props: {
      ...JSON.parse(fileContents),
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

export default ({
  title,
  content,
}) => {
  const renderContent = (content) => {
    const data = groupBy(content, (obj) => {
      if (Object.keys(confessionCitationByIndex).includes(obj.parent)) return obj.id;
      return obj.parent;
    });
    return Object
      .entries(data)
      .reduce((acc, [key, value]) => acc.concat(value), [])
      .map((obj) => {
        if (Object.keys(confessionCitationByIndex).includes(obj.parent) && !Object.keys(obj).includes('text')) {
          return (
            <h3 className="text-center text-2xl mx-auto max-w-2xl">{obj.title}</h3>
          );
        }
        return (
          <div className="pl-10 my-12">
            <h4 className="text-xl max-w-2xl">{obj.title}</h4>
            <p>{obj.text}</p>
            {/* <ul className="mt-10">
              {Object
                .entries(obj.verses)
                .map(([key, verse]) => (
                  <li>
                    <p>{`${key.toUpperCase()}: ${verse}`}</p>
                  </li>
                ))}
            </ul> */}
          </div>
        );
      });
  };

  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <h1 className="text-center text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <h2 className="my-24 text-3xl mx-auto text-center w-full">{title}</h2>
      <div className="w-full max-4xl lg:px-48">
        {renderContent(content)}
      </div>
    </div>
  );
};
