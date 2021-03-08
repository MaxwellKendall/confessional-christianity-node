/* eslint-disable react/prop-types */
import React from 'react';
import Head from 'next/head';

const SEO = ({
  title,
}) => (
  <Head>
    <title>{title}</title>
    <meta property="og:title" content={title} key="title" />
    <meta property="og:image" content="https://confessionalchristianity.com/preview-img.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:domain" value="confessionalchristianity.com" />
    <meta property="twitter:image" content="https://confessionalchristianity.com/preview-img.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
  </Head>
);

export default SEO;
