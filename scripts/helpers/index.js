import { bibleBookByAbbreviation } from '../dataMapping';

export const parseOsisBibleReference = (osisStr) => {
  if (!osisStr) return '';
  if (osisStr.includes(',')) {
    return osisStr
      .split(',')
      .map((s) => parseOsisBibleReference(s))
      .join(',');
  }
  const splitStr = osisStr.split('-');
  return splitStr
    .reduce((acc, str, i) => {
      const bookChapterVerse = str.split('.');
      const book = bibleBookByAbbreviation[bookChapterVerse[0]];
      const chapterVerse = bookChapterVerse.slice(1).join(':');
      if (i !== 0) {
        return `${acc} - ${book} ${chapterVerse}`;
      }
      return `${book} ${chapterVerse} `;
    }, '');
};

export const mapOSisTextToApiValues = (osisStr) => {
  if (!osisStr) return '';
  const splitStr = osisStr.split('-');
  return splitStr
    .reduce((acc, str, i) => {
      const bookChapterVerse = str.split('.');
      const book = bibleApiAbbrByOsis[bookChapterVerse[0]];
      const chapterVerse = bookChapterVerse.slice(1).join('.');
      if (i !== 0) {
        return `${acc}-${book}.${chapterVerse}`;
      }
      return `${book}.${chapterVerse}`;
    }, '');
};

export const addRecordToIndex = async (index, record) => index
  .saveObject({ ...record, objectID: record.id })
  .then(() => {
    console.log('record added: ', record.id);
    return Promise.resolve();
  })
  .catch((e) => {
    console.error('Error adding record to index', e);
  });

export const getConfessionalAbbreviationId = (name) => name.split(' ').reduce((acc, str) => `${acc}${str[0]}`, '');
