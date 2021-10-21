/** @type {import('next').NextConfig} */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.wgsl$/i,
      use: 'raw-loader',
    });

    config.plugins.push(
      new MonacoWebpackPlugin()
    );
    return config
  },
}
