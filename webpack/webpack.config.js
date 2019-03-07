const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            ignoreCustomFragments: [/\{\{.*?}}/],
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname, '../client/static')})
  ]
}