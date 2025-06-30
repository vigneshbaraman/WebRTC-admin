const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    admin: './src/admin.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true // optional: clean dist folder on build
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      template: './src/admin.html',
      chunks: ['admin']
    })
  ],
  mode: 'development',
  target: 'web', // ✅ important: must be 'web' for frontend
  stats: {
    children: true
  }
};
