import fs from 'fs';
import path from 'path';
import algoliasearch from 'algoliasearch';
import fetch from 'isomorphic-fetch';
import queryString from 'query-string';

import { addRecordToIndex, bibleApiAbbrByOsis, parseOsisBibleReference, mapOSisTextToApiValues } from './helpers/index';

const ESV_API_SECRET = process.env.ESV_API_SECRET;
const SCRIPTURE_API_SECRET = process.env.SCRIPTURE_API_SECRET;

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const bibleIndex = client.initIndex('bible verses');

const readFrom = '../normalized-data/three-forms-of-unity/belgic-confession.json';

const cache = {};

// API REQUEST:
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

const getCitationsInOsisAndPrettyFormat = (obj) => ({
  ...obj,
  osis: obj.verses,
  verses: Object.entries(obj.verses)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value.map((str) => parseOsisBibleReference(str)),
    }), {}),
});

const doesFileHaveCitations = (f) => f.content.some((obj) => Object.keys(obj).includes('verses'));

const enforceSchema = (arr, existingData) => arr
  .filter((obj) => Object.keys(obj).includes('verses'))
  .reduce((acc, obj) => {
    const verses = Object
      .entries(obj.verses)
      .map(([key, value]) => {
        const osis = value;
        const citedBy = `${obj.id}-${key}`;
        // const confession = obj.text;
        return {
          osis,
          // confession,
          citedBy,
        };
      });
    verses.forEach(({ osis, confession, citedBy }) => {
      osis.forEach((v) => {
        if (acc[v]) {
          acc[v].citedBy.push(citedBy);
          // acc[v].confession.push(confession);
        } else {
          acc[v] = {
            citedBy: [citedBy],
            // confession: [confession],
          };
        }
      });
    });
    return acc;
  }, existingData);

const parseDetailFromFile = async (data) => {
  console.log("!!!")
  const parsedData = JSON.parse(data);
  const { title } = data;
  if (doesFileHaveCitations(parsedData)) {
    let existingFile = '';
    const readStream = fs.createReadStream(path.resolve(__dirname, '../deduped-bible-verses.json'));
    readStream.on('data', (d) => {
      existingFile += d;
    });
    readStream.on('end', () => {
      console.log('existingfile', existingFile)
      const normalizedCitation = enforceSchema(parsedData.content, JSON.parse(existingFile));
      const write = fs.createWriteStream(path.resolve(__dirname, '../deduped-bible-verses.json'));
      write.write(JSON.stringify(normalizedCitation));
      write.on('error', (e) => {
        console.error('there was an error writing the file', e);
        write.close();
      });
      write.on('end', () => {
        console.log('Finished writing', title);
        write.close();
      });
    });
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
    parseDetailFromFile(data, idPrefix.replace(new RegExp(/.json$/), '').toUpperCase());
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
