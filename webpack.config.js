const path = require('path');

module.exports = {
  entry: './src/frontend/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
    },
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
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
