import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const bibleIndex = client.initIndex('bible verses');
const bibleIndexV2 = client.initIndex('citations');
const searchStr = '';

// get a single record by id
// bibleIndex
//   .getObject('1376')
//   .then((resp) => {
//     console.log('resp', resp);
//   })
//   .catch((e) => console.error('Some error: ', e));

/**
 * v1:
 * {
 *   citedBy: string[],
 *   bibleText: string,
 *   citation: string,
 *   id: string
 * }
 * v2:
 * {
 *   citedBy: string[],
 *   bibleText: string,
 *   citation: string,
 *   book: string,
 *   startChapter: number,
 *   endChapter: number,
 *   startVerse: number,
 *   endVerse: number,
 *   id: string
 * }
 */

const migrateRectord = (record) => {
  const { id } = record;
  console.log(id);
  const range = id.split('-');
  if (range.length > 1) {
    const [start, end] = range;
    const [book, startChapter, startVerse] = start.split('.');
    const [_, endChapter, endVerse] = end.split('.');
    const rtrn = {
      ...record,
      book,
      startChapter,
      startVerse,
      endChapter,
      endVerse
    };
    return rtrn;
  }
  const [book, startChapter, startVerse] = id.split('.');
  return {
    ...record,
    book,
    startChapter,
    endChapter: startChapter,
    startVerse,
    endVerse: startVerse
  }
}

bibleIndex
  .search(searchStr, { hitsPerPage: 10 })
  .then((resp) => {
    resp.hits.forEach(h => migrateRectord(h));
  })
  .catch((e) => console.error('Some error: ', e));
