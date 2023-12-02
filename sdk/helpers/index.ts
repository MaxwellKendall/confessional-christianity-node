import { trim } from 'lodash';
import {
  confessionCitationByIndex,
  excludedWordsInDocumentId,
  algoliaIdByDocumentId,
} from '../dataMapping';
import { AlgoliaIds, DocumentIds, Query } from '../types';

// returns doc id excluding of/the, so not WCoF --> WCF. This is confusing tech debt.
export const getConciseDocId = (docTitle: string) => docTitle
  .toUpperCase()
  .split(' ')
  .filter((w) => !excludedWordsInDocumentId.includes(w))
  .reduce((acc, str) => `${acc}${str[0]}`, '');

export const getCanonicalDocId = (docTitleOrId: string) => {
  const arr = docTitleOrId.split(' ');
  if (arr.length === 1) {
    // we have some weird ID... get the doc name & derive ID from that.
    return getConciseDocId(confessionCitationByIndex[docTitleOrId.toUpperCase()][0]);
  }
  return getConciseDocId(docTitleOrId);
};

export const generateLink = (confessionId: string) => {
  const idAsArr = confessionId.split('-');
  const [id, chapterOrQuestion] = idAsArr;
  const docId = getCanonicalDocId(id);
  if (docId === 'CD') {
    // handle canons of dordt chapter
    if (idAsArr.length < 4) {
      return {
        pathname: '',
        query: {
          // arbitrarily always choosing articles for now rather than rejections...
          search: `${docId}.${chapterOrQuestion}`,
        },
      };
    }
    // handle canons of dordt articles/rejections
    return {
      pathname: '',
      query: {
        search: idAsArr[2] === 'rejections'
          ? `${docId}.${chapterOrQuestion}.r${idAsArr[3]}`
          : `${docId}.${chapterOrQuestion}.${idAsArr[3]}`,
      },
    };
  }
  if (idAsArr.length === 2) {
    return {
      pathname: '/',
      query: {
        search: `${docId}.${chapterOrQuestion}`,
      },
    };
  }
  const article = idAsArr[2];
  return {
    pathname: '/',
    query: {
      search: `${docId}.${chapterOrQuestion}.${article}`,
    },
  };
};

/**
 * parseConfessionId
 * @return {string} pretty version of the ID
 * For example: fn(hc-12-45) --> Heidelberg Catechism LORD's Day 12, Question 45
 */
export const parseConfessionId = (id: string) => {
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
export const getCitationContextById = (id: string, idPositions = 1) => id.split('-').slice(0, idPositions).join('-');

/**
 * allResultsAreSameConfession
 * @return {boolean} indicating whether input array is all the same confession
 */
// export const allResultsAreSameConfession = (results) => (
//   results.length
//   && results.reduce((acc, { id }, i, arr) => {
//     if (i === 0) return getCitationContextById(id);
//     const current = getCitationContextById(id);
//     const prev = getCitationContextById(arr[i - 1].id);
//     return (
//       acc
//       && prev === current
//     );
//   }, false)
// );

// export const areResultsUniformChapter = (results) => (
//   results.length
//   && results.reduce((acc, { id }, i, arr) => {
//     if (i === 0) return true;
//     const current = getCitationContextById(id, 2);
//     const prev = getCitationContextById(arr[i - 1].id, 2);
//     return (
//       acc
//       && prev === current
//     );
//   }, false)
// );

/**
 * getUniformConfessionTitle
 * @return {string} returns document title (Heidelberg Catechism)
 * or Chapter Title (Of Gods Eternal Decree)
 */
// export const getUniformConfessionTitle = ([result], idPosition = 1) => {
//   if (result.index === 'aggregate') {
//     return `The ${parseConfessionId(
//       getCitationContextById(result.id, idPosition),
//     )}`;
//   }
//   return '';
// };

/**
 * handleSortById
 * @return {integer} used for sorting results
 */
// export const handleSortById = (a, b) => {
//   if (Object.keys(a).includes('number')) {
//     if (a.number > b.number) return 1;
//     if (b.number > a.number) return -1;
//     return 0;
//   }
//   const [idA, idB] = [a.id.split('-'), b.id.split('-')];
//   if (parseInt(idA[idA.length - 1], 10) < parseInt(idB[idB.length - 1], 10)) return -1;
//   if (parseInt(idB[idB.length - 1], 10) < parseInt(idA[idA.length - 1], 10)) return 1;
//   return 0;
// };

export const regexV2 = /(wcf|Westminster\sConfession\sof\sFaith|hc|Heidelberg\sCatechism|WSC|Westminster\sShorter\sCatechism|WLC|Westminster\sLarger\sCatechism|39A|Thirty Nine Articles|39 Articles|tar|bcf|bc|Belgic Confession of Faith|Belgic Confession|COD|CD|Canons of Dordt|95T|95 Theses|Ninety Five Theses|ML9T|\*)|(\1\.[0-9]{1,})|(\1\2\.[0-9]{1,})|(\1\.r[0-9]{1,})|(\1\2\.r[0-9]{1,})/ig;
export const bibleRegex = /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|1\ssamuel|2\ssamuel|1\skings|2\skings|1\schronicles|2\schronicles|ezra|nehemiah|esther|job|psalms|psalm|proverbs|ecclesiastes|song\sof\ssolomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|testament|matthew|mark|luke|john|acts|romans|1\scorinthians|2\scorinthians|galatians|ephesians|philippians|colossians|1\sthessalonians|2\sthessalonians|1\stimothy|2\stimothy|titus|philemon|hebrews|james|1\speter|2\speter|1\sjohn|2\sjohn|3\sjohn|jude|revelation)|(\1\s[0-9]{1,}:[0-9]{1,})|(\1\s[0-9]{1,})/ig;

export const isEmptyKeywordSearch = (search: string) => search.replace(regexV2, '') === '';

export const parseFacets = (str: string) => {
  const confessions = str
    .match(regexV2)
    ?.map((s, i) => {
      if (i === 0) {
        return getCanonicalDocId(s);
      }
      return s;
    })
    ?.join('')

  if (confessions) return confessions;

  return str
    .match(bibleRegex)
    ?.join('');
};

export const parseQuery = (str: string) => {
  const q = str.replaceAll(regexV2, '');
  if (q) {
    return trim(q);
  }
  return undefined;
}

export const isFacetLength = (search: string, length: number) => search.split('.').length === length;

const maxDepthByDocumentId : Record<string, number> = {
  WSC: 2,
  WLC: 2,
  TBCoF: 2,
  TAoR: 2,
  ML9t: 1,
  CoD: 3,
  HC: 3,
  WCoF: 3
}

const getPrefixByDepthAndDocument = (doc: string, depth: number) => {
  const maxDepth : number | undefined = maxDepthByDocumentId[doc];
  if (maxDepth) {
    if (depth === maxDepth) return 'id';
    if (depth === 1) return 'document';
    return 'parent';
  }
  return 'document';
}
/**
 * All Data: document:CoD
 * Chapter 1: parent:CoD-1-articles,parent:CoD-1-rejections
 * Chapter 1 Articles: parent:CoD-1-articles
 * Chapter 1 Article 1: id:CoD-1-articles-1
 * Chapter 1 Rejections: parent:CoD-1-rejections
 * Chapter 1 Rejection 1: id:CoD-1-rejections-1
 * 
 */
const parseCanonsOfDordt = (fragments: { prefix: string, location: string, document: string }) => {
  const { prefix, location } = fragments;
  if (prefix === 'id') {
    // insert articles or rejections
    const isRejection = location && location.includes('r');
    const delimitter = isRejection ? '-r' : '-';
    const [chapter, article] = location.split(delimitter);
    return `${prefix}:${fragments.document}-${chapter}-${isRejection ? 'rejections' : 'articles'}-${article}`;
  } else if (prefix === 'parent' && location.length) {
    return `${prefix}:${fragments.document}-${fragments.location}-articles,${prefix}:${fragments.document}-${fragments.location}-rejections`;
  }
  return `${prefix}:${fragments.document}`;
}

export const fromFacetToAlgoliaFacet = (q: Query) => {
  if (q.facets) {
    /**
     * Transform into AlgoliaIndexRequest['facetFilters']
     * A facetFilter is a key on a record within an index.
     * We have 2 in the aggregate index right now:
     * (a): document (document:WCF/WLC/WSC etc...)
     * (b): id (id:WCF-1)
     */
    const fragments = q.facets
      .split('.')
      .reduce((acc, char, i, arr) => {
        const doc = algoliaIdByDocumentId[char];
        const location = acc.location ? `${acc.location}-${char}` : char;
        // +1 to account for document being absent from .location
        const depth = location.split('-').length + 1;
        return {
          ...acc,
          location: doc ? '' : location,
          document: doc || acc.document,
          prefix: getPrefixByDepthAndDocument(acc.document, depth)
        };
      }, { prefix: '', document: '', location: '' });
    
    const algoliaFacet = fragments.location
      ? `${fragments.prefix}:${fragments.document}-${fragments.location}`
      : `${fragments.prefix}:${fragments.document}`;
    
    // the canons of dordt have a different schema
    if (fragments.document === 'CoD') {
      return parseCanonsOfDordt(fragments);
    }
    return algoliaFacet;
  }
  return '';
}

// const removePrefix = (str: string) => str.replace(documentPrefix, '');

// const getSubTitleFromConfession = (query, docId, chapterId, articleId) => {
//   if (query) return query;
//   const confessionId = `${docId}-${chapterId}`;
//   if (confessionId.startsWith('HC') && chapterId && !articleId) {
//     // title is just LORD's Day X
//     return '';
//   }
//   if (confessionId.startsWith('HC') && chapterId && articleId) {
//     // title is actually useful, return it
//     return removePrefix(contentById[`${confessionId}-${articleId}`].title);
//   }

//   return removePrefix(contentById[confessionId].title);
// };

// export const usePgTitle = (search) => {
//   let queryWithoutFacetFilters = (search && `${search.replace(regexV2, '').replace(keyWords, '')}`).replace(bibleRegex, '') || null;
//   queryWithoutFacetFilters = queryWithoutFacetFilters ? `search results for "${startCase(queryWithoutFacetFilters)}"` : queryWithoutFacetFilters;
//   if (!search) return ['Search the Confessions of Historic Protestantism', 'By Keyword, Scripture Text, or Citation'];
//   const result = search.match(regexV2);
//   const doc = (result && result.length && getCanonicalDocId(result[0])) || null;
//   const chap = (result && result.length > 1 && `${facetNamesByCanonicalDocId[doc][0]} ${removeDot(result[1])}`) || null;
//   const art = (result && result.length > 2 && `${facetNamesByCanonicalDocId[doc][1]} ${removeDot(result[2])}`) || null;
//   if (doc && chap && art) {
//     const subTitle = getSubTitleFromConfession(
//       queryWithoutFacetFilters,
//       parentIdByAbbreviation[doc],
//       removeDot(result[1]),
//       removeDot(result[2]),
//     );
//     return [`${confessionCitationByIndex[doc][0]} ${startCase(chap.toLowerCase())} ${startCase(art.toLowerCase())}`, subTitle];
//   }
//   if (doc && chap) {
//     const subTitle = getSubTitleFromConfession(
//       queryWithoutFacetFilters,
//       parentIdByAbbreviation[doc],
//       removeDot(result[1]),
//     );
//     return [`${confessionCitationByIndex[doc][0]} ${startCase(chap.toLowerCase())}`, subTitle];
//   }
//   if (doc) {
//     return [`${confessionCitationByIndex[doc][0]}`, queryWithoutFacetFilters];
//   }
//   if (keyWords.test(search)) {
//     return [`The ${startCase(search.match(keyWords)[0].toLowerCase())}`, queryWithoutFacetFilters];
//   }
//   if (bibleRegex.test(search)) {
//     return [
//       search.match(bibleRegex).map((s) => capitalize(s)).join(' '),
//       queryWithoutFacetFilters,
//     ];
//   }
//   return ['', queryWithoutFacetFilters];
// };

// export const getDocumentId = (id: string) => id.split('-')[0];

// export const isDocumentId = (id: string) => !id.includes('-');

// export const groupContentByChapter = (content) => groupBy(content, (obj) => {
//   if (isDocumentId(obj.parent)) return obj.id;
//   if (getDocumentId(obj.id) === 'CoD') {
//     return `CoD-${obj.parent.split('-')[1]}`;
//   }
//   return obj.parent;
// });

// export const isChapter = (confessionId, contentById) => (
//   // parent would then be the document
//   confessionId.split('-').length === 2
//     && contentById[confessionId].isParent
//     && !DOCUMENTS_WITHOUT_ARTICLES.includes(confessionId)
// );

// export const sliceConfessionId = (str, fragmentNumber) => {
//   const idAsArr = str.split('-');
//   return idAsArr.slice(0, fragmentNumber).join('-');
// };
