import { confessionCitationByIndex } from '../dataMapping';

export const parseConfessionId = (id) => {
  const fragments = id.split('-');
  return fragments.reduce((acc, frag, i, src) => {
    const isLast = src.length === i - 1;
    if (isLast) return `${acc}${confessionCitationByIndex[src[0]][i]} ${frag.toUpperCase()}`;
    if (i === 0) return `${acc}${confessionCitationByIndex[src[0]][i]} `;
    return `${acc}${confessionCitationByIndex[src[0]][i]} ${frag} `;
  }, '');
};

export const getCitationContextById = (id, idPositions = 1) => id.split('-').slice(0, idPositions).join('-');

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

export const getUniformConfessionTitle = ([result], idPosition = 1) => parseConfessionId(
  getCitationContextById(result.id, idPosition),
);

export const areResultsChaptersOnly = (results) => results.length && results.every((o) => !Object.keys(o).includes('text'));

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
