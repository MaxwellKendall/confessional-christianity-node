/* eslint-disable no-restricted-syntax */

import fs from 'fs';
import path from 'path';
import algoliasearch from 'algoliasearch';

import { addRecordToIndex } from '../helpers';

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const aggIndex = client.initIndex('aggregate');

const readDir = path.resolve(__dirname, '../normalized-data');
const includedDirs = ['three-forms-of-unity', 'reformation', 'anglican'];
const includedFiles = ['canons-of-dort.json', 'belgic-confession.json', '95-theses.json', '39-articles.json'];

const addFileContentsToIndex = (filePath) => new Promise((resolve) => {
  const stream = fs.createReadStream(filePath);
  let data = '';
  stream.on('data', (d) => {
    data += d;
  });
  stream.on('error', (e) => {
    console.error('error reading file', filePath, e);
    throw e;
  });
  stream.on('end', () => {
    const { title, content } = JSON.parse(data);
    console.info(`Processing content for ${title} ...`);
    return content.reduce((prevPromise, d, i, arr) => {
      const isLast = arr.length === i - 1;
      if (isLast) {
        return prevPromise.then(() => addRecordToIndex(aggIndex, {
          ...d,
          document: title,
        })
          .then(() => resolve(title)));
      }
      return prevPromise.then(() => addRecordToIndex(aggIndex, {
        ...d,
        document: title,
      }));
    }, Promise.resolve(null));
  });
});

const readFiles = async (dir = readDir) => {
  fs.readdir(dir, 'utf-8', (err, files) => {
    files
      .forEach(async (file) => {
        const isDirectory = fs.lstatSync(path.resolve(dir, file)).isDirectory();
        if (isDirectory && includedDirs.includes(file)) {
          readFiles(path.resolve(dir, file));
        } else if (includedFiles.includes(file)) {
          addFileContentsToIndex(path.resolve(dir, file));
        }
      });
  });
};

readFiles();
