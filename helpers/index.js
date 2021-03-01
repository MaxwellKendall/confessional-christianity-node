export const removeJsonExtension = new RegExp(/.json$/);

export const confessionCitationByIndex = {
  WCoF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  HC: ['Heidelberg Catechism', 'LORD\'s Day', 'Question and Answer', 'Scripture Citation'],
  WSC: ['Westminster Shorter Catechism', 'Question and Answer', 'Scripture Citation'],
  WLC: ['Westminster Larger Catechism', 'Question and Answer', 'Scripture Citation'],
};
export const parseConfessionId = (id) => {
  const fragments = id.split('-');
  console.log('id', fragments)
  return fragments.reduce((acc, frag, i, src) => {
    const isLast = src.length === i - 1;
    if (isLast) return `${acc}${confessionCitationByIndex[src[0]][i]} ${frag.toUpperCase()}`;
    if (i === 0) return `${acc}${confessionCitationByIndex[src[0]][i]} `;
    return `${acc}${confessionCitationByIndex[src[0]][i]} ${frag} `;
  }, '');
};

export const confessionPathByName = {
  'westminster-confession-of-faith': 'normalized-data/westminster/wcf.json',
  'westminster-larger-catechism': 'normalized-data/westminster/wlc.json',
  'westminster-shorter-catechism': 'normalized-data/westminster/wsc.json',
  'heidelberg-catechism': 'normalized-data/three-forms-of-unity/heidelberg-catechism.json',
};

export const removeCitationId = (id) => {
  return id.split('-').slice(0, id.split('-').length - 1).join('-');
};
