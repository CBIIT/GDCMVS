const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  entry: {
    main: ['./client/src/index.js', './client/src/style.scss'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client/static/dist')
  },
  module: {
    rules: [

      // JS 
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: [
              ['env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                },
                modules: false
              }]
            ]
          }
        },
        exclude: /node_modules/
      },

      // CSS
      { test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader'
          ]
        })
      }
    ]
  },

  //plugings
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new FileManagerPlugin({
      onEnd: [{
          copy: [
            { source: './client/views/body.html', destination: path.resolve(__dirname, 'gdc-docs/docs/Data_Dictionary/gdcmvs.md') },
            { source: './client/static/dist/*', destination: path.resolve(__dirname, 'gdc-docs/theme/apps/gdcmvs/dist') },
            { source: './client/static/lib/*', destination: path.resolve(__dirname, 'gdc-docs/theme/apps/gdcmvs/lib') }
          ]
        }]
    })
  ]
};