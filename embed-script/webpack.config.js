const path = require('path');

module.exports = {
  entry: './index.ts',
  output: {
    filename: 'webpush.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'WebPushInit',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }],
  },
};