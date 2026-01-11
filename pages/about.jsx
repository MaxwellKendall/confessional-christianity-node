import React from 'react';
import Link from 'next/link';

import SEO from '../components/SEO';
import Footer from '../components/Footer';
import Header from '../components/Header';

const AboutPg = () => (
  <div className="flex flex-col w-full">
    <SEO title="Confessional Christianity | About Us" />
    <Header />
    <div className="p-8">
      <Link
        href={{
          pathname: '/',
          query: {
            search: '',
          },
        }}
      >
        <h1 className="cursor-pointer text-center text-4xl lg:text-5xl mx-auto max-w-2xl">
          Confessional Christianity
        </h1>
      </Link>
      <div className="about w-full lg:w-1/2 mt-12 mx-auto pt-10 pb-5 bg-white">
        <p>
          Our Ascended Lord has given precious gifts to his Church over the centuries in the shepherds and teachers of Holy Scripture. They are given so the Church would grow to{' '}
          <a href="https://biblehub.com/ephesians/4-13.htm" target="_blank" rel="noopener noreferrer">
            maturity; that is, to possess the knowledge of God's Son, to the measure of the stature of the fullness of Christ
          </a>
          . The confessions of the 16th and 17th centuries are properly understood as fruit of the Church's labor over the centuries to make mature disciples of Christ. These words have been shaped by Scripture into the doctrinal standard of Churches throughout the world. They are a faithful example of the{' '}
          <a href="https://biblehub.com/2_timothy/1-13.htm" target="_blank" rel="noopener noreferrer">
            "pattern of sound words"
          </a>{' '}
          which Paul exhorted Timothy to follow. The Church's calling is to confess Christ. These words have been used to this glorious end throughout the centuries. The intent of this project is a modest one -- to assist the Church as she continues to faithfully carry out this task in the 21st Century and beyond.
        </p>

        <h2>Our Main Features</h2>
        <p>
          The main functionality this application brings in distinction from other projects is searching by Scripture text or citation. For example, a search for{' '}
          <a href="/?search=John+3%3A16">"John 3:16"</a> or{' '}
          <a href="/?search=should+not+perish+but+have+eternal+life">"should not perish but have eternal life"</a>{' '}
          will show where this Scripture is referenced as a citation. You may also search by{' '}
          <a href="/?search=baptism">keywords or phrases across all documents</a>,{' '}
          <a href="/?search=document:WCF%20baptism">keywords or phrases filtered by a document</a>, or of course you can{' '}
          <a href="/?search=document:WCF%20chapter:3">read through a document bit by bit</a>.
        </p>

        <h2>Our Content</h2>
        <p>
          While we acknowledge the bounds of confessional christianity extends beyond the reformed tradition, it is for good reason that the age of the protestant reformation is considered{' '}
          <a href="https://www.britannica.com/place/Germany/The-confessional-age-1555-1648" target="_blank" rel="noopener noreferrer">
            the confessional age
          </a>
          . At this time, this site includes the following historic documents from this golden age of Church history:
        </p>
        <ul>
          <li><a href="/?search=document:WCF">The Westminster Confession of Faith</a></li>
          <li><a href="/?search=document:WSC">The Westminster Shorter Catechism</a></li>
          <li><a href="/?search=document:WLC">The Westminster Larger Catechism</a></li>
          <li><a href="/?search=document:BC">The Belgic Confession</a></li>
          <li><a href="/?search=document:HC">The Heidelberg Catechism</a></li>
          <li><a href="/?search=document:COD">The Canons of Dordt</a></li>
          <li><a href="/?search=document:TAR">The Thirty Nine Articles of Religion</a></li>
          <li><a href="/?search=document:ML9T">Martin Luther's 95 Theses</a></li>
        </ul>
        <p>There are many lesser known catechisms and confessions from this period which may be surfaced here in the future.</p>

        <h2>Acknowledgements</h2>
        <p>
          We would like to acknowledge the makers of{' '}
          <a href="https://reformedstandards.com/" target="_blank" rel="noopener noreferrer">Reformed Standards</a>{' '}
          for their excellent work. This website would not exist without being able to build on top of their{' '}
          <a href="https://github.com/reformed-standards/compendium" target="_blank" rel="noopener noreferrer">
            open source repository of machine readable content
          </a>
          .
        </p>
        <p>May God bless us richly as we seek to grow in the knowledge of his Son, and in doing so, begin to love him more as we ought.</p>

        <blockquote>
          <p>The grass withers and the flower fades but the Word of our God shall abide forever.</p>
          <footer>~ Isaiah 40:8</footer>
        </blockquote>
      </div>
      <Footer
          links={[{ link: "HOME", href: "/" }, { link: "BLOG", href: "https://blog.confessionalchristianity.com" }]}
          />
    </div>
  </div>
);

export default AboutPg;
