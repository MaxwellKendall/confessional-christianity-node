/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import SEO from '../components/SEO';
import Footer from '../components/Footer';
import Privacy from '../blog/Privacy.mdx';

const PrivacyPg = () => (
  <div className="privacy flex flex-col p-8 w-full mt-24">
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel&family=Cinzel+Decorative&family=Marcellus&display=swap" rel="stylesheet" />
    </Head>
    <SEO title="Confessional Christianity | Privacy Policy" />
    <Link href="/">
      <h1 className="text-center cursor-pointer text-4xl lg:text-5xl mx-auto max-w-2xl">
        Confessional Christianity
      </h1>
    </Link>
    <div className="w-full lg:w-1/2 mt-24 mx-auto pt-10 pb-5 bg-white">
      <Privacy />
    </div>
    <Footer
        links={[{ link: "HOME", href: "/" }, { link: "BLOG", href: "https://blog.confessionalchristianity.com" }]}
        />
  </div>
);

export default PrivacyPg;
