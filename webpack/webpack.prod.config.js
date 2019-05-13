const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: ['./client/src/index.js', './client/src/style.css'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../client/static/dist')
  },
  module: {
    rules: [

      // JS 
      { test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { 
              presets: ['@babel/preset-env']
            }
        },
      },

      // CSS
      { test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader" },
        ]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: "styles.css"}),
    new OptimizeCssAssetsPlugin(),
    new CleanWebpackPlugin(),
  ]
}