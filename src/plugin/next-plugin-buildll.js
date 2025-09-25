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
      try {
        // Check if Babel plugin exists
        const pluginPath = path.resolve(__dirname, './babel-plugin-buildll.js');
        if (!require('fs').existsSync(pluginPath)) {
          throw new Error('Babel plugin not found');
        }

        let pluginAdded = false;

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
                  pluginPath,
                  {
                    // Plugin options
                    enabled: true,
                    development: dev,
                  }
                ]);

                pluginAdded = true;
              }
            });
          }
        });

        if (pluginAdded) {
          console.log('✅ Buildll plugin initialized successfully');
        } else {
          console.warn('⚠️  Could not find Next.js Babel loader to inject plugin');
          console.warn('   Manual components available as fallback');
        }

      } catch (error) {
        console.warn('⚠️  Buildll plugin failed to initialize:', error.message);
        console.warn('   Falling back to manual components. Import EditableText/EditableImage from @buildll/sdk');
        console.warn('   Example: import { EditableText } from "@buildll/sdk"');
      }

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