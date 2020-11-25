const withSass = require('@zeit/next-sass');

module.exports = {
  webpack: (config, options) => {
    const sassRules = withSass({}).webpack(config, options).module.rules;
    // eslint-disable-next-line no-param-reassign
    config.module.rules = [
      ...config.module.rules,
      sassRules[sassRules.length - 1],
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
