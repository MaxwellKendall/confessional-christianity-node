/* eslint-disable react/prop-types */
import React from 'react';
import Head from 'next/head';
import { trim } from 'lodash';
import contentById from '../dataMapping/content-by-id.json';
import {
  getContentByIdNotation, getFragmentsFromSearch, isFacetLength,
} from '../helpers';

const desc = 'Confessional Christianity is a web app promoting the value of the historic creeds of the Protestant Tradition. Users can search through the confessions via key words, Scripture within an elegant user interface. Soli Deo Gloria. Luke 17:10';

const getDescription = (title, search) => {
  const [facet, keyWord] = getFragmentsFromSearch(search);
  debugger;
  if (facet) {
    let contentByIdNotation = getContentByIdNotation(facet);
    // so annoying, and dumb, but I Tell myself this makes it work.
    contentByIdNotation = contentByIdNotation === 'HC' ? 'HC-1-1' : contentByIdNotation;
    const data = isFacetLength(contentByIdNotation, 1, '-') ? contentById[`${contentByIdNotation}-1`] : contentById[contentByIdNotation];
    if (data && (data.title || data.text)) {
      const titleNotPageTitle = data.title && data.title.toLowerCase() !== title.toLowerCase();
      if (titleNotPageTitle && data.text) {
        return `${data.title}\n${data.text}`;
      }
      if (data.title) { return data.text; }
    }
  } else if (keyWord && facet) {
    return `Search results from ${title} on "${trim(keyWord)}".`;
  } else if (keyWord) {
    return `Search results on "${trim(keyWord)}" from the historic reformed confessions of faith.`;
  }
  return desc;
};

const SEO = ({
  title,
  keyword = null,
  searchTerm = null,
}) => {
  console.log('seo', title, keyword, searchTerm);
  // const newTitle = getTitleByQuery(query);
  // console.log('hey', newTitle);
  return (
    <Head>
      <title>{title}</title>
      <meta property="og:title" content={title} key="title" />
      <meta property="og:description" content={getDescription(title, searchTerm)} />
      <meta
        property="og:image"
        content={`https://confessionalchristianity.com/api/og?subTitle=${title}${keyword ? `&query=${keyword}` : ''}`}
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:domain" value="confessionalchristianity.com" />
      <meta property="twitter:image" content={`https://confessionalchristianity.com/api/og?subTitle=${title}&query=${keyword}`} />
      <link rel="shortcut icon" href="/favicon.ico" />
    </Head>
  );
};

export default SEO;
