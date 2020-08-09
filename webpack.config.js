const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './main.js'
  },
  mode: "development",
  optimization: {
    minimize: false
  },
  devServer: {
    contentBase: ['./static'],
    port: 8082,
    compress: true,
    overlay: {
      warnings: true,
      errors: true,
    },
    hot: true,
    open: true,
    disableHostCheck: true,
    quiet: true,
    clientLogLevel: 'warning',
    host: '0.0.0.0',
    historyApiFallback: true,
    // Only output when errors or new compilation happen
    // stats: 'minimal',
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ["@babel/plugin-transform-react-jsx", { pragma: "ToyReact.createElement" }]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 启用热更新第三步

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'main.html',
      inject: true,
    }),
  ]
}