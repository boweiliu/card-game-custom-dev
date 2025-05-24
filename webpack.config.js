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
    liveReload: true,
    // watchFiles: ['src/frontend/**/*.less'],
    compress: true,
    port: process.env.PORT || 9000, // Use PORT from environment variables
    proxy: [
      {
        context: ['/api'],
        target: `http://localhost:${process.env.BE_PORT || 3000}`, // Use BE_PORT for the proxy target
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
        xfwd: true, // Add X-Forwarded-* headers
        secure: false, // Allow self-signed certificates
        timeout: 0, // No timeout for SSE connections
        proxyTimeout: 0, // No proxy timeout for SSE connections
        onProxyReq: (proxyReq, req, res) => {
          console.log(`[Webpack Proxy] Proxying ${req.method} ${req.url} to backend`);
        },
        onProxyRes: (proxyRes, req, res) => {
          // Special handling for SSE
          if (req.url.includes('/api/events') && proxyRes.headers['content-type']?.includes('text/event-stream')) {
            console.log('[Webpack Proxy] SSE response detected, configuring for streaming');
            
            // Ensure SSE headers are preserved
            proxyRes.headers['cache-control'] = 'no-cache';
            proxyRes.headers['connection'] = 'keep-alive';
            
            // Disable buffering for SSE
            res.flushHeaders();
            
            // Forward close events
            req.on('close', () => {
              console.log('[Webpack Proxy] Client closed SSE connection, destroying proxy response');
              if (proxyRes.readable) {
                proxyRes.destroy();
              }
            });
            
            req.on('aborted', () => {
              console.log('[Webpack Proxy] Client aborted SSE connection');
              if (proxyRes.readable) {
                proxyRes.destroy();
              }
            });
            
            // Handle proxy response errors
            proxyRes.on('error', (err) => {
              console.error('[Webpack Proxy] SSE proxy response error:', err);
            });
          }
        },
        onError: (err, req, res) => {
          console.error(`[Webpack Proxy] Error proxying ${req.url}:`, err.message);
        }
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.module\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
          },
          'less-loader',
        ],
      },
      {
        test: /(?<!\.module)\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
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
      '@': path.resolve(__dirname, 'src'),
    },
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
