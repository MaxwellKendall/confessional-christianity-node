import { uniqueId } from "lodash";

export const bibleBookByAbbreviation = {
  Gen: 'Genesis',
  Exod: 'Exodus',
  Lev: 'Leviticus',
  Num: 'Numbers',
  Deut: 'Deuteronomy',
  Josh: 'Joshua',
  Judg: 'Judges',
  Ruth: 'Ruth',
  '1Sam': '1 Samuel',
  '2Sam': '2 Samuel',
  '1Kgs': '1 Kings',
  '2Kgs': '2 Kings',
  '1Chr': '1 Chronicles',
  '2Chr': '2 Chronicles',
  Ezra: 'Ezra',
  Neh: 'Nehemiah',
  Esth: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Prov: 'Proverbs',
  Eccl: 'Ecclesiastes',
  Song: 'Song of Solomon',
  Isa: 'Isaiah',
  Jer: 'Jeremiah',
  Lam: 'Lamentations',
  Ezek: 'Ezekiel',
  Dan: 'Daniel',
  Hos: 'Hosea',
  Joel: 'Joel',
  Amos: 'Amos',
  Obad: 'Obadiah',
  Jonah: 'Jonah',
  Mic: 'Micah',
  Nah: 'Nahum',
  Hab: 'Habakkuk',
  Zeph: 'Zephaniah',
  Hag: 'Haggai',
  Zech: 'Zechariah',
  Mal: 'Malachi',
  New: 'Testament',
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  '1Cor': '1 Corinthians',
  '2Cor': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Phil: 'Philippians',
  Col: 'Colossians',
  '1Thess': '1 Thessalonians',
  '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy',
  '2Tim': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Heb: 'Hebrews',
  Jas: 'James',
  '1Pet': '1 Peter',
  '2Pet': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  Jude: 'Jude',
  Rev: 'Revelation',
};

export const bibleApiAbbrByOsis = {
  Gen: 'GEN',
  Exod: 'EXO',
  Lev: 'LEV',
  Num: 'NUM',
  Deut: 'DEU',
  Josh: 'JOS',
  Judg: 'JDG',
  Ruth: 'RUT',
  '1Sam': '1SA',
  '2Sam': '2SA',
  '1Kgs': '1KI',
  '2Kgs': '2KI',
  '1Chr': '1CH',
  '2Chr': '2CH',
  Ezra: 'Ezr',
  Neh: 'Neh',
  Esth: 'Est',
  Job: 'Job',
  Ps: 'Psa',
  Prov: 'Pro',
  Eccl: 'Ecc',
  Song: 'Sng',
  Isa: 'Isa',
  Jer: 'Jer',
  Lam: 'Lam',
  Ezek: 'Ezk',
  Dan: 'Dan',
  Hos: 'Hos',
  Joel: 'Jol',
  Amos: 'Amo',
  Obad: 'Oba',
  Jonah: 'Jon',
  Mic: 'Mic',
  Nah: 'Nam',
  Hab: 'Hab',
  Zeph: 'Zep',
  Hag: 'Hag',
  Zech: 'Zec',
  Mal: 'Mal',
  Matt: 'Mat',
  Mark: 'Mrk',
  Luke: 'Luk',
  John: 'Jhn',
  Acts: 'Act',
  Rom: 'Rom',
  '1Cor': '1Co',
  '2Cor': '2Co',
  Gal: 'Gal',
  Eph: 'Eph',
  Phil: 'Php',
  Col: 'Col',
  '1Thess': '1Th',
  '2Thess': '2Th',
  '1Tim': '1Ti',
  '2Tim': '2Ti',
  Titus: 'Tit',
  Phlm: 'Phm',
  Heb: 'Heb',
  Jas: 'Jas',
  '1Pet': '1Pe',
  '2Pet': '2Pe',
  '1John': '1Jn',
  '2John': '2Jn',
  '3John': '3Jn',
  Jude: 'Jud',
  Rev: 'Rev',
};

export const parseOsisBibleReference = (osisStr) => {
  if (!osisStr) return '';
  if (osisStr.includes(',')) {
    return osisStr
      .split(',')
      .map((s) => parseOsisBibleReference(s))
      .join(', ');
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
      return `${book} ${chapterVerse}`;
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

// ALGOLIA STUFF
const isItemInIndex = (index, id) => index.search(id)
  .then((data) => data.hits.length)
  .catch((e) => console.log('error from isItemInIndex', e));

export const addRecordToIndex = async (index, record, objectIDPrefix) => {
  const name = record.name ? record.name : record.citedBy;
  // const doesRecordExist = await isItemInIndex(index, record.objectID);
  const doesRecordExist = false;
  if (!doesRecordExist) {
    return index
      .saveObject({ ...record, objectID: uniqueId(objectIDPrefix) })
      .then(() => {
        console.log('record added: ', name);
        return Promise.resolve();
      })
      .catch((e) => {
        console.error('Error adding record to index', e);
      });
  }
  return Promise.resolve();
};

export const getConfessionalAbbreviationId = (name) => name.split(' ').reduce((acc, str) => `${acc}${str[0]}`, '');
