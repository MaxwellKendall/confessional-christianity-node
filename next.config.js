module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
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
