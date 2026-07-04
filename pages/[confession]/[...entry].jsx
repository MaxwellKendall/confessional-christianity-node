import React, { useEffect, useState } from 'react';
import { capitalize } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { confessionPathByName, confessionCitationByIndex } from '../../dataMapping';
import { loadConfessionContent } from '../../lib/confessionContent';
import { compareEntryIds, entryIdToPathSegments, truncateForMeta } from '../../helpers';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DocumentResultGroup from '../../components/DocumentResultGroup';
import SEO, { SITE_URL } from '../../components/SEO';
import { track, EVENTS } from '../../lib/analytics';

export const getStaticPaths = async () => {
  const paths = (await Promise.all(
    Object.keys(confessionPathByName).map(async (slug) => {
      const { contentById, documentId } = await loadConfessionContent(slug);
      return Object
        .values(contentById)
        .filter((item) => !item.isParent)
        .map((item) => ({
          params: {
            confession: slug,
            entry: entryIdToPathSegments(item.id, documentId),
          },
        }));
    }),
  )).flat();

  return { paths, fallback: false };
};

export const getStaticProps = async (context) => {
  const { confession: slug, entry } = context.params;
  const { contentById, documentId } = await loadConfessionContent(slug);
  const id = `${documentId}-${entry.join('-')}`;
  const item = contentById[id];

  if (!item) return { notFound: true };

  const slugTitle = capitalize(slug.split('-').join(' '));
  // full canonical title (e.g. "Westminster Shorter Catechism") - matches
  // the same string DocumentResultGroup/Algolia results key off of.
  const documentTitle = confessionCitationByIndex[documentId.toUpperCase()][0];

  // A real, crawlable link to the adjacent entry in document order - not
  // just the search-query-string nav ConfessionTextResult renders - so
  // crawlers (and readers) have an actual path between every entry page.
  const leafIds = Object
    .values(contentById)
    .filter((v) => !v.isParent)
    .map((v) => v.id)
    .sort(compareEntryIds);
  const currentIndex = leafIds.indexOf(id);
  const prevId = currentIndex > 0 ? leafIds[currentIndex - 1] : null;
  const nextId = currentIndex < leafIds.length - 1 ? leafIds[currentIndex + 1] : null;
  const toEntryLink = (entryId) => ({
    href: `/${slug}/${entryIdToPathSegments(entryId, documentId).join('/')}`,
    title: contentById[entryId].title,
  });

  return {
    props: {
      slug,
      slugTitle,
      documentTitle,
      contentById,
      item,
      canonicalUrl: `${SITE_URL}/${slug}/${entry.join('/')}`,
      description: truncateForMeta(item.text),
      prevEntry: prevId ? toEntryLink(prevId) : null,
      nextEntry: nextId ? toEntryLink(nextId) : null,
    },
  };
};

const ConfessionEntry = ({
  slug,
  slugTitle,
  documentTitle,
  contentById,
  item,
  canonicalUrl,
  description,
  prevEntry,
  nextEntry,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    track(EVENTS.CONFESSION_VIEWED, {
      confession_id: documentTitle,
      confession_title: slugTitle,
      entry_id: item.id,
      entry_title: item.title,
    });
  }, [documentTitle, slugTitle, item.id, item.title]);

  const submitSearch = () => {
    track(EVENTS.SEARCH_PERFORMED, {
      search_term: searchTerm,
      term_length: searchTerm?.length || 0,
    });
    router.push({ pathname: '/', query: { search: searchTerm } });
  };

  const handleKeyDown = (e) => {
    e.persist();
    if (e.keyCode === 13) submitSearch();
  };

  const handleSearchInput = (e) => {
    e.persist();
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = (e) => {
    e.preventDefault();
    setSearchTerm('');
  };

  return (
    <div className="home flex flex-col w-full">
      <SEO
        title={`${item.title} | ${slugTitle}`}
        description={description}
        canonicalUrl={canonicalUrl}
        subTitle={item.title}
        query={slugTitle}
      />
      <Header />
      <div className="p-8">
        <Link href={{ pathname: '/', query: { search: '' } }}>
          <h1 className="cursor-pointer text-center text-4xl lg:text-5xl mx-auto max-w-2xl">
            Confessional Christianity
          </h1>
        </Link>
        <div className="w-full lg:w-1/2 mt-24 mx-auto sticky top-0 pt-10 pb-5 z-10 bg-white">
          <input
            type="text"
            className="home-pg-search border border-gray-500 rounded-full leading-10 outline-none w-full pl-12 pr-12 py-2 relative"
            value={searchTerm}
            onChange={handleSearchInput}
            onKeyDown={handleKeyDown}
          />
          <button className="absolute home-pg-search-btn" onClick={submitSearch} type="submit" tabIndex={-1} />
          <FontAwesomeIcon icon={faTimes} onClick={handleClearSearch} className="home-pg-clear-search absolute" tabIndex={-1} />
        </div>
        <span className="block w-full text-center mb-24">
          SHOWING 1 of 1 TOTAL MATCHES
        </span>
        <ul className="results w-full lg:w-1/2 mx-auto">
          <DocumentResultGroup
            documentTitle={documentTitle}
            results={[item]}
            contentById={contentById}
            showArticleNav
            showChapterNav
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </ul>
        {(prevEntry || nextEntry) && (
          <nav className="flex justify-between w-full lg:w-1/2 mx-auto mb-24">
            {prevEntry ? (
              <Link href={prevEntry.href}>
                <span className="cursor-pointer text-sm">
                  {`← ${prevEntry.title}`}
                </span>
              </Link>
            ) : <span />}
            {nextEntry ? (
              <Link href={nextEntry.href}>
                <span className="cursor-pointer text-sm">
                  {`${nextEntry.title} →`}
                </span>
              </Link>
            ) : <span />}
          </nav>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default ConfessionEntry;
