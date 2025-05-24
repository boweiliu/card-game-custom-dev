module.exports = {
  extends: ['plugin:css-modules/recommended'],
  plugins: ['css-modules'],
  rules: {
    'css-modules/no-undef-class': [2, { camelCase: true }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['./*', '../*'],
            message:
              'Relative imports are not allowed. Use absolute imports with @/ prefix instead.',
          },
        ],
      },
    ],
  },
  ignorePatterns: ['dist/**', 'webpack.config.js'],
};
