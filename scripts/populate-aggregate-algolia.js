import fs from 'fs';
import { startCase, flattenDeep, uniqueId } from 'lodash';
import algoliasearch from 'algoliasearch';

import { addRecordToIndex, parseOsisBibleReference } from './helpers/index';

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);

const aggIndex = client.initIndex('aggregate');

const getConfessionContextByName = (ctx) => {
  if (ctx.toLowerCase().includes('catechism') && ctx.toLowerCase().includes('heidelberg')) {
    return `${ctx} LORD's Day `;
  }
  if (ctx.toLowerCase().includes('catechism')) {
    return `${ctx} Question `;
  }
  return `${ctx} Chapter `;
}

const getSecondaryNumericalPositionPrefix = (ctx, number) => {
  if (ctx.toLowerCase().includes('catechism') && ctx.toLowerCase().includes('heidelberg')) {
    return `${ctx}Question ${number} `;
  }
  return `${ctx}Article ${number} `;
}

// import fetch from 'isomorphic-fetch';

// const readFrom = '../data/json/unformatted/three-forms-of-unity/heidelberg-catechism.json';
// const readFrom = '../data/json/unformatted/anglican/39-articles.json';
// const readFrom = '../data/json/unformatted/second-london/1689-confession.json';
// const readFrom = '../data/json/unformatted/second-london/keach.json';
// const readFrom = '../data/json/unformatted/ancient-church/apostles-creed.json';
const readFrom = '../data';

const parseVerses = (obj) => {
  if (Array.isArray(obj.verses)) {
    return {
      ...obj,
      verses: obj.verses.map((str) => {
        return parseOsisBibleReference(str);
      }),
      osis: obj.verses,
    }
  }
  return {
    ...obj,
    osis: obj.verses,
    verses: Object.entries(obj.verses)
      .reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: value.map((str) => parseOsisBibleReference(str))
        }
      }, {})
  }
}

const getDetail = (fileAsObjOrArr, ctx = '') => {
  if (Object.keys(fileAsObjOrArr).includes('text')) {
    return {
      ...fileAsObjOrArr,
      name: Object.keys(fileAsObjOrArr).includes('name')
        ? `${ctx} ${fileAsObjOrArr.name}`
        : ctx
    };
  }
  if (Array.isArray(fileAsObjOrArr)) {
    return fileAsObjOrArr
      .map((item) => getDetail(item, ctx));
  }

  const name = ctx
    ? `${ctx}${fileAsObjOrArr?.name || fileAsObjOrArr?.number}`
    : `${fileAsObjOrArr?.name || fileAsObjOrArr?.number} `;

  return Object
    .entries(fileAsObjOrArr)
    .filter(([, value]) => typeof value === 'object')
    .map(([, value]) => getDetail(value, name));
};

// end goal is to have format like this: confession name, chapter, section
const getContext = (existingCtx, obj) => {
  if (existingCtx && Object.keys(obj).includes('name') && Object.keys(obj).includes('number')) {
    return `${existingCtx}${obj.number} ${obj.name} `;
  }
  if (existingCtx && Object.keys(obj).includes('name')) {
    return `${existingCtx}${obj.name} `;
  }
  if (existingCtx && Object.keys(obj).includes('number')) {
    // ie, article number within chapter or question w/in lords day
    const isSecondaryNumericalPosition = existingCtx.split(' ').some((str) => !Number.isNaN(parseInt(str, 10)));
    return isSecondaryNumericalPosition
      ? `${getSecondaryNumericalPositionPrefix(existingCtx, obj.number)}`
      : `${existingCtx}${obj.number} `;
  }
  if (Object.keys(obj).includes('name')) {
    return getConfessionContextByName(obj.name);
  }
}

const getDetailWithCitations = (fileAsObjOrArr, ctx = '') => {
  if (Object.keys(fileAsObjOrArr).includes('verses')) {
    const name = getContext(ctx, fileAsObjOrArr);
    return {
      name,
      ...parseVerses(fileAsObjOrArr),
    }
  };
  if (Array.isArray(fileAsObjOrArr)) {
    return fileAsObjOrArr
      .map((item) => getDetailWithCitations(item, ctx));
  }

  const name = getContext(ctx, fileAsObjOrArr); 

  return Object
    .entries(fileAsObjOrArr)
    .filter(([, value]) => typeof value === 'object')
    .map(([, value]) => getDetailWithCitations(value, name));
};

const doesFileHaveCitations = (fileAsObjOrArr) => {
  if (typeof fileAsObjOrArr === 'string') return false;
  if (Object.keys(fileAsObjOrArr).includes('verses')) return true;
  if (Array.isArray(fileAsObjOrArr)) {
    return fileAsObjOrArr.some((item) => doesFileHaveCitations(item));
  }
  return Object
    .entries(fileAsObjOrArr)
    .filter(([, value]) => typeof value === 'object')
    .some(([, value]) => doesFileHaveCitations(value));
};

const parseDetailFromFile = (data, fileName) => {
  const prettyFileName = startCase(fileName.split('.')[0]);
  const file = JSON.parse(data); 
  if (doesFileHaveCitations(file)) {
    const detail = getDetailWithCitations(file);
    if (Array.isArray(detail)) {
      const details = flattenDeep(detail);
      // console.log('data for confession w/ citations', prettyFileName, details.length);
      details.forEach((d) => {
        console.log('name', d.name)
        // addRecordToIndex(aggIndex, { ...d, objectID: uniqueId() });
      })
    }
    else {
      // console.log('data for confession w/ citations', prettyFileName, detail);
    }
  }
  else {
    const detail = getDetail(file);
    if (Array.isArray(detail)) {
      const details = flattenDeep(detail);
      // console.log('data for confession w/o any citations: ', prettyFileName, details, details.length);
    }
    else {
      // console.log('data for confession w/o any citations: ', prettyFileName, detail);
    }
  }
};

const readFile = (filePath, fileName) => {
  let data = '';
  const readStream = fs.createReadStream(filePath);
  readStream.on('data', (d) => {
    data += d;
  });
  readStream.on('end', () => {
    parseDetailFromFile(data, fileName);
  });
};

const readPath = (filePath) => {
  fs.readdir(filePath, 'utf-8', (err, files) => {
    if (err) {
      console.error('Error reading dir', filePath, err);
      throw err;
    }
    files
      .forEach(async (file) => {
        const pathToFile = `${filePath}/${file}`;
        const isDir = fs.lstatSync(pathToFile).isDirectory();
        if (isDir) {
          readPath(pathToFile);
        } else {
          readFile(pathToFile, file);
        }
      });
  });
};

readPath(readFrom);
// readFile(readFrom, 'anglican 39 articles');