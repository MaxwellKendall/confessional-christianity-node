import algoliasearch from 'algoliasearch';
import React, { useState } from 'react';

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_SECRET_KEY);
const aggIndex = client.initIndex('aggregate');
const facets = ['document:Heidelberg Catechism'];
const defaultQuery = 'Question 1: What is thy only comfort';

const HomePage = ({
  hits,
  query
}) => {
  console.log('hits', hits)
  const [searchTerm, setSearchTerm] = useState(query);
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="home flex flex-col p-8 w-full my-24">
      <h1 className="text-center text-5xl mx-auto max-w-2xl">Confessional Christianity</h1>
      <input type="text" className="home-pg-search border border-gray-500 rounded-full leading-10 w-full lg:w-1/2 my-24 mx-auto outline-none pl-12" value={searchTerm} onChange={handleSearchInput} />
      <ul className="results w-full lg:w-1/2 mx-auto">
        {hits
          .map((obj) => {
            return (
              <li className="w-full flex flex-col justify-center">
                <h2 className="text-4xl w-full text-center mt-24">{`The ${obj.document}`}</h2>
                <p className="text-2xl py-10">{obj.title}</p>
                <p className="text-2xl">{obj.text}</p>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

export async function getStaticProps(context) {
  // will be passed to the page component as props
  const resp = await aggIndex.search(defaultQuery, {
    facetFilters: facets,
  });
  console.log('resp', resp);
  return {
    props: {
      ...resp,
      query: defaultQuery,
    },
  };
}

export default HomePage;
