import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const bibleIndex = client.initIndex('bible verses');
const searchStr = '';

// get a single record by id
// bibleIndex
//   .getObject('1376')
//   .then((resp) => {
//     console.log('resp', resp);
//   })
//   .catch((e) => console.error('Some error: ', e));

bibleIndex
  .search(searchStr, { hitsPerPage: 1000 })
  .then((resp) => console.log('resp', resp))
  .catch((e) => console.error('Some error: ', e));
