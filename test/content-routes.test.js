import { loadConfessionContent } from '../lib/confessionContent';
import {
  getStaticPaths as getEntryStaticPaths,
  getStaticProps as getEntryStaticProps,
} from '../pages/[confession]/[...entry].jsx';
import { getStaticProps as getConfessionStaticProps } from '../pages/[confession].jsx';
import { getServerSideProps as getSitemapProps } from '../pages/sitemap.xml.jsx';
import { defineCases } from './support/defineCases';

const createResponseStub = () => {
  const response = {
    body: '',
    statusCode: 200,
    headers: {},
    ended: false,
  };

  response.setHeader = (name, value) => {
    response.headers[name] = value;
  };
  response.write = (chunk) => {
    response.body += chunk;
  };
  response.end = () => {
    response.ended = true;
  };

  return response;
};

describe('loadConfessionContent', () => {
  const cases = {
    'known slugs return normalized content keyed by id': {
      actual: async () => loadConfessionContent('westminster-confession-of-faith'),
      assert: (result) => {
        expect(result.documentId).toBe('WCoF');
        expect(result.contentById['WCoF-1']).toMatchObject({
          id: 'WCoF-1',
          isParent: true,
        });
        expect(result.contentById['WCoF-1-1']).toMatchObject({
          id: 'WCoF-1-1',
          parent: 'WCoF-1',
        });
      },
    },
    'unknown slugs return null': {
      actual: async () => loadConfessionContent('not-a-real-confession'),
      assert: (result) => {
        expect(result).toBeNull();
      },
    },
  };

  defineCases(cases, async ({ actual, assert }) => {
    await assert(await actual());
  });
});

describe('confession routes', () => {
  const cases = {
    'confession getStaticProps returns canonical metadata and keyed content': {
      actual: async () => getConfessionStaticProps({
        params: { confession: 'westminster-confession-of-faith' },
      }),
      assert: ({ props }) => {
        expect(props.documentId).toBe('WCoF');
        expect(props.canonicalUrl).toBe('https://confessionalchristianity.com/westminster-confession-of-faith');
        expect(props.description).toContain('Although the light of nature');
        expect(props.contentById['WCoF-1-2']).toMatchObject({
          id: 'WCoF-1-2',
          parent: 'WCoF-1',
        });
      },
    },
    'entry getStaticProps returns the leaf entry and adjacent links': {
      actual: async () => getEntryStaticProps({
        params: {
          confession: 'westminster-confession-of-faith',
          entry: ['1', '2'],
        },
      }),
      assert: ({ props }) => {
        expect(props.item.id).toBe('WCoF-1-2');
        expect(props.documentTitle).toBe('Westminster Confession of Faith');
        expect(props.prevEntry).toEqual({
          href: '/westminster-confession-of-faith/1/1',
          title: 'Article 1',
        });
        expect(props.nextEntry).toEqual({
          href: '/westminster-confession-of-faith/1/3',
          title: 'Article 3',
        });
      },
    },
    'entry getStaticProps returns notFound for invalid entry paths': {
      actual: async () => getEntryStaticProps({
        params: {
          confession: 'westminster-confession-of-faith',
          entry: ['999'],
        },
      }),
      assert: (result) => {
        expect(result).toEqual({ notFound: true });
      },
    },
    'entry getStaticPaths includes both standard and canons entry formats': {
      actual: async () => getEntryStaticPaths(),
      assert: ({ paths, fallback }) => {
        expect(fallback).toBe(false);
        expect(paths).toEqual(expect.arrayContaining([
          { params: { confession: 'westminster-confession-of-faith', entry: ['1', '1'] } },
          { params: { confession: 'canons-of-dort', entry: ['1', 'articles', '1'] } },
        ]));
      },
    },
    'sitemap generation includes static, confession, and entry routes': {
      actual: async () => {
        const res = createResponseStub();
        const result = await getSitemapProps({ res });
        return { res, result };
      },
      assert: ({ res, result }) => {
        expect(result).toEqual({ props: {} });
        expect(res.headers['Content-Type']).toBe('text/xml');
        expect(res.ended).toBe(true);
        expect(res.body).toContain('<loc>https://confessionalchristianity.com/about</loc>');
        expect(res.body).toContain('<loc>https://confessionalchristianity.com/westminster-confession-of-faith</loc>');
        expect(res.body).toContain('<loc>https://confessionalchristianity.com/westminster-confession-of-faith/1/1</loc>');
      },
    },
  };

  defineCases(cases, async ({ actual, assert }) => {
    await assert(await actual());
  });
});
