const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
                use: ['css-loader']
            })
          }
        ]
      },
      plugins: [
        new ExtractTextPlugin("styles.css"),
      ],
      mode: 'development',
      devtool: 'source-map'
}