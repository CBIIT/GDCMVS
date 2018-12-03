const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
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
              presets: ['es2015','stage-2'] 
            }
        },
      },

      // CSS
      { test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
          }]
        })
      },

      // HTML
      { test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname, '../client/static')}),
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