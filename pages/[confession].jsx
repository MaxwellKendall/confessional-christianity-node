import React from 'react';
import path from 'path';
import { readFile } from 'fs';

const confessionPathByName = {
  'westminster-confession-of-faith': path.resolve(__dirname, '../normalized-data/westminster/wcf.json'),
  'westminster-larger-catechism': path.resolve(__dirname, '../normalized-data/westminster/wlc.json'),
  'westminster-shorter-catechism': path.resolve(__dirname, '../normalized-data/westminster/wsc.json'),
  'heidelberg-catechism': path.resolve(__dirname, '../normalized-data/three-forms-of-unity/heidelberg-catechism.json'),
};

export async function getStaticPaths(context) {
// will be passed to the page component as props
  const pathToConfession = confessionPathByName[context.params.confession];
  let data = '';
  readFile(pathToConfession, 'utf-8', (e, d) => {
    data += d;
  });
  return {
    props: {
      ...data,
    },
  };
}

export default ({
  title,
  content,
}) => {
  console.log('yo wut up', title);
  return (
    <h1>HI</h1>
  )
};
