module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['plugin:css-modules/recommended'],
  plugins: ['css-modules', '@typescript-eslint'],
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
    // Disable some TypeScript rules that might be too strict for this project
    '@typescript-eslint/no-unused-vars': 'off',
  },
  ignorePatterns: ['dist/**', 'webpack.config.js'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
    },
  ],
};
