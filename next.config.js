module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // sitemap.xml.jsx reads the normalized-data JSON files at request time via
    // getServerSideProps. The read path is built dynamically from
    // confessionPathByName, so Vercel's dependency tracer can't detect the
    // files and excludes them from the serverless bundle -> ENOENT -> 500.
    // Explicitly include them so the sitemap function can read them at runtime.
    outputFileTracingIncludes: {
      '/sitemap.xml': ['./normalized-data/**/*.json'],
    },
  },
  webpack: (config, options) => {
    // eslint-disable-next-line no-param-reassign
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.mdx$/,
        use: [
          options.defaultLoaders.babel,
          {
            loader: '@mdx-js/loader',
            options: {},
          },
        ],
      },
    ];
    return config;
  },
};
