const path = require('path');

/**
 * Next.js Plugin for Buildll
 *
 * Automatically transforms JSX to be Buildll-enabled
 * Zero configuration, zero boilerplate needed
 */
function withBuildll(nextConfig = {}) {
  return {
    ...nextConfig,

    // Extend webpack configuration
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Add Babel plugin to transform JSX
      config.module.rules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(useItem => {
            if (
              useItem.loader &&
              useItem.loader.includes('next-babel-loader')
            ) {
              const babelOptions = useItem.options || {};
              babelOptions.plugins = babelOptions.plugins || [];

              // Add our Buildll transformation plugin
              babelOptions.plugins.push([
                path.resolve(__dirname, './babel-plugin-buildll.js'),
                {
                  // Plugin options
                  enabled: true,
                  development: dev,
                }
              ]);
            }
          });
        }
      });

      // Call the original webpack config if it exists
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, { buildId, dev, isServer, defaultLoaders, webpack });
      }

      return config;
    },

    // Extend experimental features if needed
    experimental: {
      ...nextConfig.experimental,
      // Add any experimental features needed for Buildll
    },

    // Add environment variables for Buildll
    env: {
      ...nextConfig.env,
      BUILDLL_ENABLED: 'true',
    },
  };
}

module.exports = withBuildll;