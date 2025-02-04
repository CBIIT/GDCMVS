const path = require('path');
const { rspack } = require('@rspack/core');

module.exports = {
  entry: {
    main: ['./client/src/index.js', './client/src/style.css']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../client/static/dist')
  },
  module: {
    rules: [
      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader'
        },
        type: 'javascript/auto'
      },
      // CSS
      {
        test: /\.css$/,
        use: [rspack.CssExtractRspackPlugin.loader, 'css-loader'],
        type: 'javascript/auto'
      }
    ]
  },
  plugins: [new rspack.CssExtractRspackPlugin({ filename: 'styles.css' })]
};
