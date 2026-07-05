/* eslint-disable react/prop-types */
import React from 'react';
import Link from 'next/link';

import { slugByDocumentId, confessionCitationByIndex } from '../dataMapping';
import { entryIdToPathSegments } from '../helpers';
import { loadConfessionContent } from '../lib/confessionContent';
import { listCommentaryIds, loadCommentary } from '../lib/commentary';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO, { SITE_URL } from '../components/SEO';

export const getStaticProps = async () => {
  const ids = await listCommentaryIds();
  const contentCache = {};
  const posts = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const id of ids) {
    const documentId = id.split('-')[0];
    const slug = slugByDocumentId[documentId];
    if (!slug) continue; // ids we can't map to a per-entry page (skip)

    // eslint-disable-next-line no-await-in-loop
    const commentary = await loadCommentary(id);
    if (!contentCache[slug]) {
      // eslint-disable-next-line no-await-in-loop
      contentCache[slug] = (await loadConfessionContent(slug)).contentById;
    }
    const entry = contentCache[slug][id];

    posts.push({
      id,
      href: `/${slug}/${entryIdToPathSegments(id, documentId).join('/')}`,
      title: commentary.title || (entry ? entry.title : id),
      subtitle: commentary.subtitle,
      date: commentary.date,
      documentTitle: (confessionCitationByIndex[documentId.toUpperCase()] || [])[0] || slug,
      entryTitle: entry ? entry.title : null,
    });
  }

  // newest first; posts without a date sort last
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return { props: { posts } };
};

const Study = ({ posts }) => (
  <div className="home flex flex-col w-full">
    <SEO
      title="Study | Confessional Christianity"
      description="Reflections and commentary on the historic creeds, confessions, and catechisms of the Protestant tradition."
      canonicalUrl={`${SITE_URL}/study`}
    />
    <Header />
    <div className="p-8">
      <Link href={{ pathname: '/', query: { search: '' } }}>
        <h1 className="cursor-pointer text-center text-4xl lg:text-5xl mx-auto max-w-2xl">
          Confessional Christianity
        </h1>
      </Link>
      <h2 className="text-3xl lg:text-4xl text-center my-16">Study</h2>
      <ul className="results w-full lg:w-1/2 mx-auto">
        {posts.length === 0 && (
          <li className="text-center text-gray-500">No posts yet.</li>
        )}
        {posts.map((post) => (
          <li key={post.id} className="mb-12 pb-12 border-b">
            <Link href={post.href}>
              <div className="cursor-pointer">
                <h3 className="text-2xl lg:text-3xl mb-1">{post.title}</h3>
                {post.subtitle && (
                  <p className="text-lg text-gray-600 mb-2">{post.subtitle}</p>
                )}
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {[post.documentTitle, post.entryTitle].filter(Boolean).join(' · ')}
                  {post.date ? ` · ${post.date}` : ''}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  </div>
);

export default Study;
