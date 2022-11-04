/* eslint-disable react/prop-types */
import React from 'react';
import Head from 'next/head';

const desc = 'Confessional Christianity is a web app promoting the value of the historic creeds of the Protestant Tradition. Users can search through the confessions via key words, Scripture within an elegant user interface. Soli Deo Gloria. Luke 17:10';

const SEO = ({
  title = 'Confessional Christianity',
  subTitle,
  query = '',
}) => (
  <Head>
    <title>{title}</title>
    <meta property="og:title" content={title} key="title" />
    <meta property="og:description" content={desc} />
    <meta
      property="og:image"
      content={`https://confessionalchristianity.com/api/og?subTitle=${subTitle}&query=${query}`}
    />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:domain" value="confessionalchristianity.com" />
    <meta property="twitter:image" content={`https://confessionalchristianity.com/api/og?subTitle=${subTitle}&query=${query}`} />
    <link rel="shortcut icon" href="/favicon.ico" />
  </Head>
);

export default SEO;
