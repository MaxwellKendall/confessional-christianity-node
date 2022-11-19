import { capitalize, groupBy, startCase } from 'lodash';
import {
  confessionCitationByIndex,
  DOCUMENTS_WITHOUT_ARTICLES,
  excludedWordsInDocumentId,
  parentIdByAbbreviation,
  facetNamesByCanonicalDocId,
} from '../dataMapping';
import contentById from '../dataMapping/content-by-id.json';

// returns doc id excluding of/the, so not WCoF --> WCF. This is confusing tech debt.
export const getConciseDocId = (docTitle) => docTitle
  .toUpperCase()
  .split(' ')
  .filter((w) => !excludedWordsInDocumentId.includes(w))
  .reduce((acc, str) => `${acc}${str[0]}`, '');

export const getCanonicalDocId = (docTitleOrId) => {
  const arr = docTitleOrId.split(' ');
  if (arr.length === 1) {
    // we have some weird ID... get the doc name & derive ID from that.
    return getConciseDocId(confessionCitationByIndex[docTitleOrId.toUpperCase()][0]);
  }
  return getConciseDocId(docTitleOrId);
};

export const generateLink = (confessionId) => {
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
    // const articleOrRejection = idAsArr[2] === 'rejections'
    //   ? 'rejection'
    //   : 'article';
    return {
      pathname: '',
      query: {
        // arbitrarily always choosing articles for now rather than rejections...
        search: `${docId}.${chapterOrQuestion}.${idAsArr[3]}`,
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

export const documentFacetRegex = new RegExp(/document:(wcf|Westminster\sConfession\sof\sFaith|hc|Heidelberg\sCatechism|WSC|Westminster\sShorter\sCatechism|WLC|Westminster\sLarger\sCatechism|39A|Thirty Nine Articles|39 Articles|tar|bcf|bc|Belgic Confession of Faith|Belgic Confession|COD|CD|Canons of Dordt|95T|95 Theses|Ninety Five Theses|ML9T|all|\*)/i);
export const chapterFacetRegex = new RegExp(/chapter:([0-9]*)|lord's\sday:([0-9]*)|lords\sday:([0-9]*)|thesis:([0-9])/i);
export const articleFacetRegex = new RegExp(/article:([0-9]*)|rejection:([0-9]*)|question:([0-9]*)/i);
// export const wildCardFacetRegex = new RegExp(/document:(all|\*)/i);

const wildCardFacetRegex = new RegExp(/\*/);
const removeDot = (str) => str && str.replaceAll('.', '');
export const regexV2 = /(wcf|Westminster\sConfession\sof\sFaith|hc|Heidelberg\sCatechism|WSC|Westminster\sShorter\sCatechism|WLC|Westminster\sLarger\sCatechism|39A|Thirty Nine Articles|39 Articles|tar|bcf|bc|Belgic Confession of Faith|Belgic Confession|COD|CD|Canons of Dordt|95T|95 Theses|Ninety Five Theses|ML9T|\*)|(\1\.[0-9]{1,})|(\1\2\.[0-9]{1,})/ig;
export const keyWords = /(westminster\sstandards|three\sforms\sof\sunity|3\sforms\sof\sunity|six\sforms\sof\sunity|6\sforms\sof\sunity)/ig;
export const bibleRegex = /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|1\ssamuel|2\ssamuel|1\skings|2\skings|1\schronicles|2\schronicles|ezra|nehemiah|esther|job|psalms|psalm|proverbs|ecclesiastes|song\sof\ssolomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|testament|matthew|mark|luke|john|acts|romans|1\scorinthians|2\scorinthians|galatians|ephesians|philippians|colossians|1\sthessalonians|2\sthessalonians|1\stimothy|2\stimothy|titus|philemon|hebrews|james|1\speter|2\speter|1\sjohn|2\sjohn|3\sjohn|jude|revelation)|(\1\s[0-9]{1,}:[0-9]{1,})|(\1\s[0-9]{1,})/ig;
const documentPrefix = /question\s[0-9]{1,}:\s|chapter\s[0-9]{1,}:\s|article\s[0-9]{1,}:\s|rejection\s[0-9]{1,}:\s/ig;

export const isEmptyKeywordSearch = (search) => search.replace(regexV2, '') === '';
// 2d array is like an OR
export const parseFacets = (str) => {
  const result = str.match(regexV2);
  const doc = (result && result.length && result[0]) || null;
  const chap = (result && result.length > 1 && result[1]) || null;
  const art = (result && result.length > 2 && result[2]) || null;
  if (keyWords.test(str)) {
    const [doc] = str.match(keyWords);
    if (doc.toLowerCase().startsWith('west')) {
      return [
        [
          `document:${confessionCitationByIndex.WSC[0]}`,
          `document:${confessionCitationByIndex.WLC[0]}`,
          `document:${confessionCitationByIndex.WCF[0]}`,
        ],
      ];
    }
    if (doc.startsWith('3') || doc.toLowerCase().startsWith('three')) {
      return [
        [
          `document:${confessionCitationByIndex.HC[0]}`,
          `document:${confessionCitationByIndex.COD[0]}`,
          `document:${confessionCitationByIndex.BC[0]}`,
        ],
      ];
    }
    if (doc.startsWith('6') || doc.toLowerCase().startsWith('six')) {
      return [
        [
          `document:${confessionCitationByIndex.HC[0]}`,
          `document:${confessionCitationByIndex.COD[0]}`,
          `document:${confessionCitationByIndex.BC[0]}`,
          `document:${confessionCitationByIndex.WSC[0]}`,
          `document:${confessionCitationByIndex.WLC[0]}`,
          `document:${confessionCitationByIndex.WCF[0]}`,
        ],
      ];
    }
  }

  if (wildCardFacetRegex.test(str)) {
    return [
      Array
        .from(
          new Set(Object.values(parentIdByAbbreviation)),
        )
        .map((id) => `document:${confessionCitationByIndex[id.toUpperCase()][0]}`),
    ];
  }
  const document = doc
    ? doc
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

  const documentId = document ? getCanonicalDocId(document) : null;
  const chapter = chap && removeDot(chap);
  const article = art && removeDot(art);

  if ((documentId === 'CD') && chapter) {
    if (article && article.toLowerCase().includes('r')) {
      return [
        `id:${parentIdByAbbreviation[document]}-${chapter}-rejections-${article.split('').slice(1).join('')}`,
      ];
    }
    if (article && !article.toLowerCase().includes('r')) {
      return [
        `id:${parentIdByAbbreviation[document]}-${chapter}-articles-${article}`,
      ];
    }
    return [
      [
        `parent:${parentIdByAbbreviation[document]}-${chapter}-articles`,
        `parent:${parentIdByAbbreviation[document]}-${chapter}-rejections`,
      ],
    ];
  }
  if (chapter && DOCUMENTS_WITHOUT_ARTICLES.includes(documentId)) {
    return [`id:${parentIdByAbbreviation[document]}-${chapter}`];
  }
  if (document && chapter && article) return [`id:${parentIdByAbbreviation[document]}-${chapter}-${article}`];
  if (document && chapter) return [`parent:${parentIdByAbbreviation[document]}-${chapter}`];
  // new UX: when searching an entire confession, just return the first chapter
  // Users can iterate through the confession using the next/previous buttons
  if (document && isEmptyKeywordSearch(str)) {
    if (DOCUMENTS_WITHOUT_ARTICLES.includes(documentId)) return [`id:${parentIdByAbbreviation[document]}-1`];
    return [`parent:${parentIdByAbbreviation[document]}-1`];
  }
  if (document) return [`document:${confessionCitationByIndex[document][0]}`];
  return [];
};

export const isFacetLength = (search, length, delimitter = '.') => search.split(delimitter).length === length;

const removePrefix = (str) => str.replace(documentPrefix, '');

const getSubTitleFromConfession = (query, docId, chapterId, articleId) => {
  if (query) return query;
  const confessionId = `${docId}-${chapterId}`;
  if (confessionId.startsWith('HC') && chapterId && !articleId) {
    // title is just LORD's Day X
    return '';
  }
  if (confessionId.startsWith('HC') && chapterId && articleId) {
    // title is actually useful, return it
    return removePrefix(contentById[`${confessionId}-${articleId}`].title);
  }

  return removePrefix(contentById[confessionId].title);
};

export const usePgTitle = (search) => {
  let queryWithoutFacetFilters = (search && `${search.replace(regexV2, '').replace(keyWords, '')}`).replace(bibleRegex, '') || null;
  queryWithoutFacetFilters = queryWithoutFacetFilters ? `search results for "${startCase(queryWithoutFacetFilters)}"` : queryWithoutFacetFilters;
  if (!search) return ['Search the Confessions of Historic Protestantism', 'By Keyword, Scripture Text, or Citation'];
  const result = search.match(regexV2);
  const doc = (result && result.length && getCanonicalDocId(result[0])) || null;
  const chap = (result && result.length > 1 && `${facetNamesByCanonicalDocId[doc][0]} ${removeDot(result[1])}`) || null;
  const art = (result && result.length > 2 && `${facetNamesByCanonicalDocId[doc][1]} ${removeDot(result[2])}`) || null;
  if (doc && chap && art) {
    // const confessionId = `${parentIdByAbbreviation[doc]}-${removeDot(result[1])}`;
    const subTitle = getSubTitleFromConfession(
      queryWithoutFacetFilters,
      parentIdByAbbreviation[doc],
      removeDot(result[1]),
      removeDot(result[2]),
    );
    return [`${confessionCitationByIndex[doc][0]} ${startCase(chap.toLowerCase())} ${startCase(art.toLowerCase())}`, subTitle];
  }
  if (doc && chap) {
    // const confessionId = `${parentIdByAbbreviation[doc]}-${removeDot(result[1])}`;
    const subTitle = getSubTitleFromConfession(
      queryWithoutFacetFilters,
      parentIdByAbbreviation[doc],
      removeDot(result[1]),
    );
    return [`${confessionCitationByIndex[doc][0]} ${startCase(chap.toLowerCase())}`, subTitle];
  }
  if (doc) {
    return [`${confessionCitationByIndex[doc][0]}`, queryWithoutFacetFilters];
  }
  if (keyWords.test(search)) {
    return [`The ${startCase(search.match(keyWords)[0].toLowerCase())}`, queryWithoutFacetFilters];
  }
  if (bibleRegex.test(search)) {
    return [
      search.match(bibleRegex).map((s) => capitalize(s)).join(' '),
      queryWithoutFacetFilters,
    ];
  }
  return ['', queryWithoutFacetFilters];
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

export const isChapter = (confessionId, contentById) => (
  // parent would then be the document
  confessionId.split('-').length === 2
    && contentById[confessionId].isParent
    && !DOCUMENTS_WITHOUT_ARTICLES.includes(confessionId)
);

export const sliceConfessionId = (str, fragmentNumber) => {
  const idAsArr = str.split('-');
  return idAsArr.slice(0, fragmentNumber).join('-');
};

export const getContentByIdNotation = (str) => {
  const docId = str.split('.')[0];
  const other = str.split('.').slice(1).join('-');
  return other && other.length
    ? `${parentIdByAbbreviation[docId]}-${other}`
    : parentIdByAbbreviation[docId];
};

export const getFragmentsFromSearch = (str) => {
  const keyword = str.replace(regexV2, '');
  const [facet] = str.match(regexV2) || [null];
  return [facet, keyword];
};
