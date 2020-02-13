const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

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
          { loader: "style-loader" },
          MiniCssExtractPlugin.loader,
          { loader: "css-loader" },
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: "styles.css"}),
    new OptimizeCssAssetsPlugin(),
    new CleanWebpackPlugin(),
    new FileManagerPlugin({
    onEnd: [{
        copy: [
            { source: './client/views/body.html', destination: path.resolve(__dirname, '../gdc-docs/docs/Data_Dictionary/gdcmvs.md') },
            { source: './client/static/dist/*.{js,css}', destination: path.resolve(__dirname, '../gdc-docs/theme/apps/gdcmvs/dist') },
            { source: './client/static/lib/**/*', destination: path.resolve(__dirname, '../gdc-docs/theme/apps/gdcmvs/lib') }
        ]
        }]
    })
  ]
}