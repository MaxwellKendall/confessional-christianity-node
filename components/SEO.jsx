/* eslint-disable react/prop-types */
import React from 'react';
import Head from 'next/head';

export const SITE_URL = 'https://confessionalchristianity.com';

const defaultDescription = 'Confessional Christianity is a web app promoting the value of the historic creeds of the Protestant Tradition. Users can search through the confessions via key words, Scripture within an elegant user interface. Soli Deo Gloria. Luke 17:10';

const SEO = ({
  title = 'Confessional Christianity',
  subTitle,
  query = null,
  description = defaultDescription,
  canonicalUrl = null,
}) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} key="title" />
    <meta property="og:description" content={description} />
    <meta
      property="og:image"
      content={`${SITE_URL}/api/og?subTitle=${encodeURIComponent(subTitle || title)}${query ? `&query=${encodeURIComponent(query)}` : ''}`}
    />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:domain" value="confessionalchristianity.com" />
    <meta property="twitter:image" content={`${SITE_URL}/api/og?subTitle=${encodeURIComponent(subTitle || title)}${query ? `&query=${encodeURIComponent(query)}` : ''}`} />
    <link rel="shortcut icon" href="/favicon.ico" />
    {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
  </Head>
);

export default SEO;
