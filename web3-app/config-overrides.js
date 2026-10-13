// Polyfill các module Node cho web3.js khi dùng react-scripts v5 (webpack 5)
// Tham khảo: https://github.com/ChainSafe/web3.js#troubleshooting-and-known-issues
const webpack = require('webpack')

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
  })
  config.resolve.fallback = fallback
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ])
  // Ẩn cảnh báo "Failed to parse source map" của các thư viện web3
  config.ignoreWarnings = [/Failed to parse source map/]
  return config
}
