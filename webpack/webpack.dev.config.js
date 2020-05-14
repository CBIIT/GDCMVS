const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: './client/src/index.js'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../client/static/dist')
  },
  module: {
    rules: [
      // eslint
      // {
      //   test: /\.js$/,
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader'
      // },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },

      // CSS
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
              // localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'styles.css' })
  ]
};
