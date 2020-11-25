const algoliasearch = require('algoliasearch');
const fetch = require('isomorphic-fetch');

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);

// Helpers:
const isItemInIndex = (index, id) => index.search(id)
  .then((data) => data.hits.length)
  .catch((e) => console.log('error from isItemInIndex', e));

const addRecordToIndex = async (index, record) => {
  const doesRecordExist = await isItemInIndex(index, record.objectID);
  if (!doesRecordExist) {
    return index
      .saveObject(record)
      .then(() => Promise.resolve())
      .catch((e) => {
        console.error('Error adding record to index', e);
      });
  }
  return Promise.resolve();
};

const testIndex = client.initIndex('bible verses');

addRecordToIndex(testIndex, { objectID: '1', test: true });
