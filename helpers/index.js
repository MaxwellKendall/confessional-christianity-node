import { groupBy } from 'lodash';
import { confessionCitationByIndex, excludedWordsInDocumentId, parentIdByAbbreviation } from '../dataMapping';

/**
 * parseConfessionId
 * @return {string} pretty version of the ID
 * For example: fn(hc-12-45) --> Heidelberg Catechism LORD's Day 12, Question 45
 */
export const parseConfessionId = (id) => {
  const fragments = id.split('-');
  return fragments.reduce((acc, frag, i, src) => {
    const isLast = src.length === i - 1;
    if (isLast) return `${acc}${confessionCitationByIndex[src[0]][i]} ${frag.toUpperCase()}`;
    if (i === 0) return `${acc}${confessionCitationByIndex[src[0]][i]} `;
    return `${acc}${confessionCitationByIndex[src[0]][i]} ${frag} `;
  }, '');
};

/**
 * getCitationContextById
 * @return {string} a portion of an ID from which the context of the original input can be decided
 * For example, fn(HC-1-12) ==> HC or Heidelberg Catechism
 */
export const getCitationContextById = (id, idPositions = 1) => id.split('-').slice(0, idPositions).join('-');

/**
 * allResultsAreSameConfession
 * @return {boolean} indicating whether input array is all the same confession
 */
export const allResultsAreSameConfession = (results) => (
  results.length
  && results.reduce((acc, { id }, i, arr) => {
    if (i === 0) return getCitationContextById(id);
    const current = getCitationContextById(id);
    const prev = getCitationContextById(arr[i - 1].id);
    return (
      acc
      && prev === current
    );
  }, false)
);

export const areResultsUniformChapter = (results) => (
  results.length
  && results.reduce((acc, { id }, i, arr) => {
    if (i === 0) return true;
    const current = getCitationContextById(id, 2);
    const prev = getCitationContextById(arr[i - 1].id, 2);
    return (
      acc
      && prev === current
    );
  }, false)
);

/**
 * getUniformConfessionTitle
 * @return {string} returns document title (Heidelberg Catechism)
 * or Chapter Title (Of Gods Eternal Decree)
 */
export const getUniformConfessionTitle = ([result], idPosition = 1) => {
  if (result.index === 'aggregate') {
    return `The ${parseConfessionId(
      getCitationContextById(result.id, idPosition),
    )}`;
  }
  return '';
};

/**
 * handleSortById
 * @return {integer} used for sorting results
 */
export const handleSortById = (a, b) => {
  if (Object.keys(a).includes('number')) {
    if (a.number > b.number) return 1;
    if (b.number > a.number) return -1;
    return 0;
  }
  const [idA, idB] = [a.id.split('-'), b.id.split('-')];
  if (parseInt(idA[idA.length - 1], 10) < parseInt(idB[idB.length - 1], 10)) return -1;
  if (parseInt(idB[idB.length - 1], 10) < parseInt(idA[idA.length - 1], 10)) return 1;
  return 0;
};

export const documentFacetRegex = new RegExp(/document:(wcf|Westminster\sConfession\sof\sFaith|hc|Heidelberg\sCatechism|WSC|Westminster\sShorter\sCatechism|WLC|Westminster\sLarger\sCatechism|39A|Thirty Nine Articles|39 Articles|bcf|bc|Belgic Confession of Faith|Belgic Confession|COD|CD|Canons of Dordt|95T|95 Theses|Ninety Five Theses)/i);
export const chapterFacetRegex = new RegExp(/chapter:([0-9]*)|lord's\sday:([0-9]*)|lords\sday:([0-9]*)/i);
export const articleFacetRegex = new RegExp(/article:([0-9]*)|rejection:([0-9]*)|question:([0-9]*)/i);

export const parseFacets = (str) => {
  const document = documentFacetRegex.test(str)
    ? documentFacetRegex.exec(str)[1]
      .toUpperCase()
      .split(' ')
      .filter((w) => !excludedWordsInDocumentId.includes(w))
      .map((s, i, arr) => {
        if (arr.length === 1) return s;
        // in this case, the document is the full text vs the abbreviation.
        return s[0];
      })
      .join('')
    : null;
  const chapter = chapterFacetRegex.exec(str)
    ? chapterFacetRegex.exec(str).filter((v) => !!v)
    : null;
  const article = articleFacetRegex.exec(str)
    ? articleFacetRegex.exec(str).filter((v) => !!v)
    : null;

  if ((document === 'CD' || document === 'COD') && chapter) {
    if (article && article[0].toLowerCase().includes('rejection')) {
      return [
        `id:${parentIdByAbbreviation[document]}-${chapter[1]}-rejections-${article[1]}`,
      ];
    }
    if (article && !article[0].toLowerCase().includes('rejection')) {
      return [
        `id:${parentIdByAbbreviation[document]}-${chapter[1]}-articles-${article[1]}`,
      ];
    }
    return [
      [
        `parent:${parentIdByAbbreviation[document]}-${chapter[1]}-articles`,
        `parent:${parentIdByAbbreviation[document]}-${chapter[1]}-rejections`,
      ],
    ];
  }
  if ((document === '95T' || document === 'BCF') && chapter) {
    return [`id:${parentIdByAbbreviation[document]}-${chapter[1]}`];
  }
  if (document && chapter && article) return [`id:${parentIdByAbbreviation[document]}-${chapter[1]}-${article[1]}`];
  if (document && chapter) return [`parent:${parentIdByAbbreviation[document]}-${chapter[1]}`];
  if (document && article) return [`id:${parentIdByAbbreviation[document]}-${article[1]}`];
  if (document) return [`document:${confessionCitationByIndex[document][0]}`];
  return [];
};

export const getDocumentId = (id) => id.split('-')[0];

export const isDocumentId = (id) => !id.includes('-');

export const groupContentByChapter = (content) => groupBy(content, (obj) => {
  if (isDocumentId(obj.parent)) return obj.id;
  if (getDocumentId(obj.id) === 'CoD') {
    return `CoD-${obj.parent.split('-')[1]}`;
  }
  return obj.parent;
});

export const isChapter = (chapterId, contentById) => (
  // parent would then be the document
  chapterId.split('-').length === 2
    && !chapterId.includes('WSC')
    && !chapterId.includes('WLC')
    && contentById[chapterId].isParent
);

// returns doc id excluding of/the, so not WCoF --> WCF. This is confusing tech debt.
export const getConciseDocId = (docTitle) => docTitle
  .toUpperCase()
  .split(' ')
  .filter((w) => !excludedWordsInDocumentId.includes(w))
  .reduce((acc, str) => `${acc}${str[0]}`, '');
