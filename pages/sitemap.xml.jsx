import { confessionPathByName } from '../dataMapping';
import { loadConfessionContent } from '../lib/confessionContent';
import { entryIdToPathSegments } from '../helpers';
import { SITE_URL } from '../components/SEO';

const STATIC_PATHS = ['', 'about'];

const buildUrlEntry = (path) => `  <url>\n    <loc>${SITE_URL}/${path}</loc>\n  </url>`;

export const getServerSideProps = async ({ res }) => {
  const slugs = Object.keys(confessionPathByName);

  const entryPaths = (await Promise.all(
    slugs.map(async (slug) => {
      const { contentById, documentId } = await loadConfessionContent(slug);
      return Object
        .values(contentById)
        .filter((item) => !item.isParent)
        .map((item) => `${slug}/${entryIdToPathSegments(item.id, documentId).join('/')}`);
    }),
  )).flat();

  const urls = [...STATIC_PATHS, ...slugs, ...entryPaths];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(buildUrlEntry).join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

const Sitemap = () => null;

export default Sitemap;
