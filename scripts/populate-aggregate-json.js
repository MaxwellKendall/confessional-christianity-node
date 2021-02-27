import fs, { readdir } from 'fs';
import path from 'path';
import { flattenDeep } from 'lodash';
import YAML from 'yaml';

import removeFormatting from './helpers/formatHelper';
import { getConfessionalAbbreviationId } from './helpers';

const readFileRoot = '../compendium/data';
const writeFileRoot = '../normalized-data';
const yamlExtensionRegExp = RegExp(/.yaml/);

const includedFiles = ['wsc.yaml', 'wlc.yaml', 'wcf.yaml', 'heidelberg-catechism.yaml'];
const prettyChildrenTitleByChildrenType = {
  articles: 'Article',
  chapters: 'Chapter',
  questions: 'Question',
  days: 'LORD\'s Day',
  rejections: 'Rejection',
};

const getChildrenType = (obj) => {
  const nestedPrefix = Object.entries(obj).reduce((acc, [key, value]) => {
    if (acc) return acc;
    if (Array.isArray(value) && key !== 'verses' && key !== 'recommended_reading') return key;
    return '';
  }, '');
  if (nestedPrefix) return nestedPrefix;
  return null;
};

const getTitle = (obj, prefix = null) => {
  if (prefix && (obj.name || obj.question)) {
    return `${prettyChildrenTitleByChildrenType[prefix]} ${obj.number}: ${obj.name || obj.question}`;
  }
  return `${prettyChildrenTitleByChildrenType[prefix]} ${obj.number}`;
};

const enforceJSONShape = (json, confession = '', childrenType = '') => {
  if (!Array.isArray(json)) {
    return {
      title: json.name,
      type: json.type,
      content: enforceJSONShape(json[getChildrenType(json)], getConfessionalAbbreviationId(json.name), getChildrenType(json)),
    };
  }

  const grandChildrenType = json.reduce((grandChildName, obj) => {
    if (grandChildName) return grandChildName;
    return getChildrenType(obj);
  }, null);

  if (grandChildrenType) {
    return json
      .map((obj) => ({
        title: getTitle(obj, childrenType),
        number: obj.number,
        isParent: true,
        parent: confession,
        id: `${confession}-${obj.number}`,
      }))
      .concat(flattenDeep(
        json
          .map((obj) => (
            obj[grandChildrenType]
              .map((innerObj) => ({
                title: getTitle(innerObj, grandChildrenType),
                text: innerObj.text || innerObj.answer,
                verses: innerObj.verses,
                isParent: false,
                parent: `${confession}-${obj.number}`,
                id: `${confession}-${obj.number}-${innerObj.number}`,
              }))
          )),
      ));
  }
  // BC, WSC, & WLC
  return json.map((obj) => ({
    title: getTitle(obj, childrenType),
    text: obj.text || obj.answer,
    verses: obj.verses || {},
    isParent: false,
    parent: confession,
    id: `${confession}-${obj.number}`,
  }));
};

const fileToJson = async (file) => {
  const yml = await fs.readFileSync(file, 'utf8');
  return YAML.parse(yml);
};

const writeFile = async (path, json) => {
  const directoryPath = path.split('/')[path.split('/').length - 2];
  const writePath = `${writeFileRoot}/${directoryPath}`;
  if (fs.existsSync(writePath)) {
    const normalizedJSON = enforceJSONShape(json);
    fs.writeFileSync(path, JSON.stringify(normalizedJSON));
  } else {
    fs.mkdir(writePath, async () => {
      writeFile(path, json);
    });
  }
};

const readFileAndWriteUnformattedJSON = async (pathToSubDir, pathToFile) => {
  const readFilePath = `${readFileRoot}/${pathToSubDir}/${pathToFile}`;
  const json = await fileToJson(readFilePath);
  const unFormattedJson = removeFormatting(json);
  const writeFilePath = `${writeFileRoot}/${pathToSubDir}/${pathToFile.replace(yamlExtensionRegExp, '.json')}`;
  writeFile(writeFilePath, unFormattedJson);
};

const readDirectoryAndWriteFiles = async (subDirPath = '') => {
  const fullDirPath = subDirPath.includes(readFileRoot)
    ? subDirPath
    : `${readFileRoot}/${subDirPath}`;
  fs.readdir(fullDirPath, 'utf-8', (err, files) => {
    files
      .forEach(async (file) => {
        const pathToFile = `${fullDirPath}/${file}`;
        const isDir = fs.lstatSync(pathToFile).isDirectory();
        if (isDir) {
          readDirectoryAndWriteFiles(file);
        } else if (includedFiles.includes(file)) {
          readFileAndWriteUnformattedJSON(subDirPath, file);
        }
      });
  });
};

readDirectoryAndWriteFiles()
  .then(() => {
    const files = await readdir(readFileRoot);
    const read = fs.createReadStream(path.resolve(__dirname, readFileRoot));
    read.on('data', (d) => {
      console.log('d', d);
    })
  });
