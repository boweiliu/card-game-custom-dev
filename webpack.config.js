const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/frontend/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/frontend'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true, // Ensure dist is cleaned before each build
  },
  devServer: {
    static: './dist/frontend',
    hot: true,
    watchFiles: ['src/frontend/**/*.less'],
    compress: true,
    port: process.env.PORT || 9000, // Use PORT from environment variables
    proxy: [
      {
        context: ['/api'],
        target: `http://localhost:${process.env.BE_PORT || 3000}`, // Use BE_PORT for the proxy target
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};
