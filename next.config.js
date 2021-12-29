/** @type {import('next').NextConfig} */
const withSvgr = require('next-svgr')

module.exports = withSvgr({
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    config.experiments.asyncWebAssembly = true

    config.module.rules.push({
      test: /\.wgsl$/i,
      use: 'raw-loader',
    });
    return config
  },
})
