import { confessionCitationByIndex, parentIdByAbbreviation } from '../dataMapping';

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

export const documentFacetRegex = new RegExp(/document:(WCF|Westminster\sConfession\sof\sFaith|westminster\sconfession\sof\sfaith|HC|Heidelberg\sCatechism|heidelberg\scatechism|WSC|Westminster\sShorter\sCatechism|westminster\sshorter\scatechism|WLC|Westminster\sLarger\sCatechism|westminster\slarger\scatechism)/);
export const chapterFacetRegex = new RegExp(/chapter:([0-9]*|lord's\sday:[0-9]*|lords\sday:[0-9]*|question:[0-9]*|Question:[0-9]*|answer:[0-9]*|Answer:[0-9]*)/);
export const articleFacetRegex = new RegExp(/Article|article:([0-9]*)/);

const confessions = ['wcf', 'wlc', 'wsc', 'hc'];

export const parseFacets = (str) => {
  const document = documentFacetRegex.exec(str)
    ? documentFacetRegex.exec(str)[1]
      .split(' ')
      .map((s) => {
        if (confessions.includes(s.toLowerCase())) return s.toUpperCase();
        return s[0].toUpperCase();
      })
      .join('')
    : null;
  const chapter = chapterFacetRegex.exec(str);
  const article = articleFacetRegex.exec(str);
  if (document && chapter && article) return [`id:${parentIdByAbbreviation[document]}-${chapter[1]}-${article[1]}`];
  if (document && chapter) return [`parent:${parentIdByAbbreviation[document]}-${chapter[1]}`];
  if (document) return [`document:${confessionCitationByIndex[document][0]}`];
  return [];
};