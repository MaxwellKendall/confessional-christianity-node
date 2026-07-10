import path from 'path';
import { promises as fs } from 'fs';
import matter from 'gray-matter';

const COMMENTARY_DIR = path.join(process.cwd(), 'content', 'commentary');

const toDateString = (d) => {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
};

// Loads the optional long-form commentary / blog post for a single entry id
// (e.g. "WSC-1", "WCoF-1-2"). Returns null when no post exists for that entry,
// so entries without commentary render exactly as before. Read at build time
// via getStaticProps, so there are no serverless file-tracing concerns.
/** @param {string} entryId @returns {Promise<Commentary|null>} */
export const loadCommentary = async (entryId) => {
  try {
    const raw = await fs.readFile(path.join(COMMENTARY_DIR, `${entryId}.md`), 'utf8');
    const { data, content } = matter(raw);
    return {
      title: data.title || null,
      subtitle: data.subtitle || null,
      author: data.author || null,
      date: toDateString(data.date),
      body: content,
    };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
};

// Returns the list of entry ids that have a commentary post, for building an
// index/listing and (eventually) the sitemap.
export const listCommentaryIds = async () => {
  try {
    const files = await fs.readdir(COMMENTARY_DIR);
    return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
};
