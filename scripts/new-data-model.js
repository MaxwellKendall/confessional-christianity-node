import fs from 'fs';
import { flattenDeep, groupBy, startCase } from 'lodash';
import YAML from 'yaml';

import removeFormatting from './helpers/formatHelper';
import { getConfessionalAbbreviationId } from './helpers';

const readFileRoot = '../compendium/data';
const writeFileRoot = '../normalized-data';
const yamlExtensionRegExp = RegExp(/.yaml/);
const includedFiles = ['wsc.yaml', 'wlc.yaml', 'wcf.yaml', 'belgic-confession.yaml', 'canons-of-dort.yaml', 'heidelberg-catechism.yaml'];

const prefixes = ['articles', 'chapters', 'questions', 'days'];
const prettyPrefix = {
  articles: 'Article',
  chapters: 'Chapter',
  questions: 'Question',
  days: 'Day',
};

const getPrefix = (obj) => {
  return ['chapter', 'article', 'question']
    .filter((str) => Object.keys(obj).includes(str))[0];
};

const getContent = (obj) => {
  if (obj && !Array.isArray(obj)) {
    const nestedPropertyName = prefixes.filter((prefix) => (
      Object.keys(obj).includes(prefix)
    ))[0];
    if (nestedPropertyName) {
      return obj[nestedPropertyName];
    }
    if (Object.keys(obj).includes('content')) {
      return obj.content;
    }
  }
  return obj;
};

const enforceJSONShape = (json, confession = '') => {
  if (!Array.isArray(json)) {
    return {
      title: json.name,
      type: json.type,
      content: enforceJSONShape(getContent(json), getConfessionalAbbreviationId(json.name)),
    };
  }
  const hasNestedContent = json.some((obj) => (
    Object.keys(obj)
      .some((key) => (
        key !== 'verses'
        && prefixes.includes(key)
      ))
  ));
  if (hasNestedContent) {
    const nestedPropertyName = prefixes.filter((prefix) => (
      json.some((obj) => Object.keys(obj).includes(prefix))
    ))[0];
    return json
      .map((obj) => ({
        title: obj.name || obj.question || obj.day,
        number: obj.number,
        isParent: true,
        parent: confession,
        id: `${confession}-${obj.number}`,
      }))
      .concat(flattenDeep(
        json
          .map((obj) => (
            obj[nestedPropertyName]
              .map((innerObj) => ({
                title: `${prettyPrefix[nestedPropertyName]} ${innerObj.number}${Object.keys(innerObj).includes('question') ? `: ${innerObj.question}` : ''}`,
                text: innerObj.text || innerObj.answer,
                verses: innerObj.verses,
                isParent: false,
                parent: `${confession}-${obj.number}`,
                id: `${confession}-${obj.number}-${innerObj.number}`,
              }))
          )),
      ));
  }

  return json.map((obj) => ({
    title: `${startCase(getPrefix(obj))} ${obj.number}${Object.keys(obj).includes('question') ? `: ${obj.question}` : `: ${obj.name}`}`,
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

const groupContent = (obj) => {
  if (obj.isParent) {
    return obj.id;
  }
  return obj.parent;
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

readDirectoryAndWriteFiles();
