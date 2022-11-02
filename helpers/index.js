import { groupBy } from 'lodash';
import {
  confessionCitationByIndex,
  DOCUMENTS_WITHOUT_ARTICLES,
  excludedWordsInDocumentId,
  parentIdByAbbreviation,
  KEYWORDS
} from '../dataMapping';

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
export const regexV2 = /(wcf|Westminster\sConfession\sof\sFaith|hc|Heidelberg\sCatechism|WSC|Westminster\sShorter\sCatechism|WLC|Westminster\sLarger\sCatechism|39A|Thirty Nine Articles|39 Articles|tar|bcf|bc|Belgic Confession of Faith|Belgic Confession|COD|CD|Canons of Dordt|95T|95 Theses|Ninety Five Theses|ML9T|all|\*)|(\1\.[0-9]{1,})|(\1\2\.[0-9]{1,})/ig;
export const keyWords = /(westminster|westminster\sstandards|three\sforms|3\sforms|six\sforms|6\sforms)/ig;

// 2d array is like an OR
export const parseFacets = (str) => {
  const result = str.match(regexV2); 
  const doc = result && result.length && result[0] || null;
  const chap = result && result.length > 1 && result[1] || null;
  const art = result && result.length > 2 && result[2] || null;
  if (keyWords.test(str)) {
    const [doc] = str.match(keyWords);
    if (doc.startsWith('west')) return [
      [
        `document:${confessionCitationByIndex['WSC'][0]}`,
        `document:${confessionCitationByIndex['WLC'][0]}`,
        `document:${confessionCitationByIndex['WCF'][0]}`,
      ]
    ]
    if (doc.startsWith('3') || doc.startsWith('three')) return [
      [
        `document:${confessionCitationByIndex['HC'][0]}`,
        `document:${confessionCitationByIndex['COD'][0]}`,
        `document:${confessionCitationByIndex['BC'][0]}`,
      ]
    ]
    if (doc.startsWith('6') || doc.startsWith('six')) return [
      [
        `document:${confessionCitationByIndex['HC'][0]}`,
        `document:${confessionCitationByIndex['COD'][0]}`,
        `document:${confessionCitationByIndex['BC'][0]}`,
        `document:${confessionCitationByIndex['WSC'][0]}`,
        `document:${confessionCitationByIndex['WLC'][0]}`,
        `document:${confessionCitationByIndex['WCF'][0]}`
      ]
    ]
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
