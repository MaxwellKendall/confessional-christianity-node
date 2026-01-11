/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React from 'react';

import SEO from '../components/SEO';
import Footer from '../components/Footer';
import Header from '../components/Header';
import About from '../blog/About.mdx';

const AboutPg = () => (
  <div className="about flex flex-col w-full">
    <SEO title="Confessional Christianity | About Us" />
    <Header />
    <div className="p-8 mt-8">
      <div className="w-full lg:w-1/2 mt-12 mx-auto pt-10 pb-5 bg-white">
        <About />
      </div>
      <Footer
          links={[{ link: "HOME", href: "/" }, { link: "BLOG", href: "https://blog.confessionalchristianity.com" }]}
          />
    </div>
  </div>
);

export default AboutPg;
