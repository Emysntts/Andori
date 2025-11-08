const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@components': path.resolve(__dirname, 'components'),
      '@features': path.resolve(__dirname, 'features'),
      '@lib': path.resolve(__dirname, 'lib')
    }
    return config
  }
}

module.exports = nextConfig

