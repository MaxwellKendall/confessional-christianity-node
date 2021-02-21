import fs from 'fs';
import { startCase, flattenDeep } from 'lodash';
import algoliasearch from 'algoliasearch';
import fetch from 'isomorphic-fetch';
import queryString from 'query-string'

import { addRecordToIndex, bibleApiAbbrByOsis, parseOsisBibleReference, mapOSisTextToApiValues } from './helpers/index';

const ESV_API_SECRET = process.env.ESV_API_SECRET;
const SCRIPTURE_API_SECRET = process.env.SCRIPTURE_API_SECRET;

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const bibleIndex = client.initIndex('bible verses');

// const readFrom = '../data/second-london/keach.json';✅
// const readFrom = '../data/three-forms-of-unity/heidelberg-catechism.json';✅
// const readFrom = '../data/westminster/wlc.json';✅
// const readFrom = '../data/westminster/wsc.json'; ✅
// const readFrom = '../data/westminster/wcf.json'; ✅
const readFrom = '../data/second-london/1689-confession.json';
// const readFrom = '../data/ancient-church/apostles-creed.json';
// const readFrom = '../data/miscellany/catechism-young-children.json';
// const readFrom = '../data/anglican/39-articles.json';
// const readFrom = '../data';

const cache = {};

const baseUrl = 'https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/passages';

const getQueryParams = () => {
  return queryString.stringify({
    'content-type': 'json',
    'include-notes': false,
    'include-titles': true,
    'include-chapter-numbers': false,
    'include-verse-numbers': true,
    'include-verse-spans': false,
    'use-org-id': false
  })
}

const parsePassages = (passages) => {
  return passages
    .filter(({ type }) => type === 'text')
    .reduce((acc, { text: str }) => {
      return `${acc}${str}`;
    }, '')
}

const getApiBookIdByOsisValue = (osis) => {
  return mapOSisTextToApiValues(osis);
}

const getBibleVerse = ({ bibleText: osis, citedBy, confession }) => {
  const bibleText = getApiBookIdByOsisValue(osis);
  if (Object.keys(cache).includes(bibleText)) {
    console.info('CACHE HIT', bibleText)
    return Promise.resolve({
      bibleText: cache.bibleText,
      citedBy,
      confession
    });
  }
  if (!bibleText) return Promise.resolve({ bibleText: '', citedBy, confession });
  const url = `${baseUrl}/${bibleText}?${getQueryParams()}`;
  return fetch(url, {
    headers: {
      'api-key': SCRIPTURE_API_SECRET
    }
  })
    .then((resp) => {
      return resp.json();
    })
    .then((resp) => {
      if (resp.statusCode !== 200) {
        console.error('resp', resp);
        console.error('url', url);
      }
      const { data: { reference: bibleCitationPretty, content: [passages] } } = resp;
      const parsedPassage = `${parsePassages(passages.items)} (${bibleCitationPretty})`;
      console.info('CACHE MISS', bibleText)
      console.info('***** payload from esv api: ', parsedPassage);
      if (parsedPassage) {
        cache[bibleText] = parsedPassage;
        return {
          citedBy,
          confession,
          bibleText: parsedPassage
        }
      }
      return {
        citedBy,
        confession,
        bibleText: null
      }
    })
    .catch((e) => {
      console.error(e);
      throw e;
    });
};

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

const getAllBibleVerses = (allCitations) => {
  return allCitations
    .reduce((acc, c, i, src) => {
      return acc
        .then((data) => {
          if (data) {
            return getBibleVerse(c).then((d) => [data].concat([d]))
          }
          return getBibleVerse(c);
        })
        .catch((e) => {
          console.error('Error fetching bible verses', e);
          throw e;
        })
    }, Promise.resolve(null))
};

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

const extractAllCitations = (detail) => {
  const { name: citedBy, osis: verses } = detail;
  if (Array.isArray(verses)) {
    // handle array of verses
    return flattenDeep(verses)
      .map((verse) => ({
        ...{
          [detail?.question ? 'question' : '']: detail.question || '',
        },
        confession: detail?.answer || detail?.text,
        citedBy,
        bibleText: verse
      }))
  }

  return Object
    .entries(verses)
    .reduce((acc, [, verses]) => acc.concat(verses), [])
    .map((verses) => ({
      // build object
        ...{
          [detail?.question ? 'question' : '']: detail.question || '',
        },
        confession: detail?.answer || detail?.text,
        citedBy,
        bibleText: verses
      }));
}

const getDedupedQuestionProperty = (existingCitation, newCitation) => {
  if (newCitation?.question && existingCitation?.question && Array.isArray(existingCitation?.question)) {
    return {
      question: existingCitation.question.concat(`${newCitation.question} (${newCitation.citedBy})`)
    };
  }
  if (newCitation?.question && existingCitation?.question && !Array.isArray(existingCitation?.question)) {
    return {
      question: [
        `${existingCitation.question} (${existingCitation.citedBy})`,
        `${newCitation.question} (${newCitation.citedBy})`
      ]
    };
  }
  if (newCitation?.question && !existingCitation.question) {
    return {
      question: `${newCitation.question} (${newCitation.citedBy})`
    };
  }
  return {};
};

const parseDetailFromFile = async (data, fileName) => {
  const prettyFileName = startCase(fileName.split('.')[0]);
  const file = JSON.parse(data); 
  if (doesFileHaveCitations(file)) {
    const detail = getDetailWithCitations(file);
    if (Array.isArray(detail)) {
      const details = flattenDeep(detail).map((d) => extractAllCitations(d));
      const deDuped = flattenDeep(details)
        .reduce((acc, obj) => {
          const { bibleText, citedBy } = obj;
          const existingCitation = acc.find((obj) => obj.bibleText === bibleText);
          if (existingCitation) {
            return acc
              .filter(({ bibleText: existingBibleText }) => existingBibleText !== bibleText)
              .concat([{
                ...existingCitation,
                citedBy: Array.isArray(existingCitation.citedBy)
                  ? existingCitation.citedBy.concat([citedBy])
                  : [existingCitation.citedBy].concat([citedBy]),
                confession: Array.isArray(existingCitation.confession)
                  ? existingCitation.confession.concat([obj.confession])
                  : [existingCitation.confession].concat([obj.confession]),
                ...getDedupedQuestionProperty(existingCitation, obj)
              }])
          }
          return acc.concat([obj]);
        }, []);
      
      console.info('HAS CITATIONS (are hitting api) ', prettyFileName);
      if (deDuped.length) {
        return getAllBibleVerses(deDuped)
          .then((allCitations) => {
            flattenDeep(allCitations).reduce((prevPromise, record) => {
              return prevPromise.then(() => {
                return addRecordToIndex(bibleIndex, record, fileName)
              })
            }, Promise.resolve())
          });
      }
    }
    else {
      // only the nicene creed reaches this point
      console.info('HAS CITATIONS (not hitting api)', prettyFileName);
    }
  }
  else {
    const detail = getDetail(file);
    if (Array.isArray(detail)) {
      const details = flattenDeep(detail);
      console.info('NO CITATIONS (array):', prettyFileName);
    }
    else {
      console.info('NO CITATIONS (object): ', prettyFileName);
    }
  }
};

const readFile = (filePath) => {
  let data = '';
  const idPrefix = filePath.split('/')[filePath.split('/').length - 1]
  const readStream = fs.createReadStream(filePath);
  readStream.on('data', (d) => {
    data += d;
  });
  readStream.on('end', () => {
    // parseDetailFromFile(data, idPrefix.replace(new RegExp(/.json$/), '').toUpperCase());
    parseDetailFromFile(data, '1689');
  });
};

const readPath = (filePath) => {
  fs.readdir(filePath, 'utf-8', (err, files) => {
    if (err) {
      console.error('Error reading dir', filePath, err);
      throw err;
    }
    files
      .forEach((file) => {
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

// readPath(readFrom);
readFile(readFrom);
