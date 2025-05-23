module.exports = {
  extends: ['plugin:css-modules/recommended'],
  plugins: ['css-modules'],
  rules: {
    'css-modules/no-undef-class': [2, { camelCase: true }],
  },
  ignorePatterns: ['dist/**', 'webpack.config.js'],
};
