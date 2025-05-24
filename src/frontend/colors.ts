// TypeScript color constants that match colors.less
// Use these in TypeScript files instead of hardcoded color values

export const colors = {
  // Primary Brand Colors
  primaryBlue: '#007acc',
  primaryBlueDark: '#005a9e',
  primaryBlueDarker: '#048',
  primaryBlueLight: '#06a',

  // Neutral Colors
  white: '#ffffff',
  grayLightest: '#f8f9fa',
  grayLighter: '#f3f3f3',
  grayLight: '#f0f0f0',
  gray: '#ccc',
  grayMedium: '#aaa',
  grayDark: '#888',
  grayDarker: '#333',
  black: '#000000',

  // Semantic Colors
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',

  // Background Colors
  bgCream: '#fffacd',
  bgBlueLight: '#e8f4f8',
  bgPinkLight: '#f8e8f4',
  bgWhiteTransparent: 'rgba(255, 255, 255, 0.7)',

  // Button Colors
  buttonDefault: '#ddd',
  buttonDefaultHover: '#ccc',
  buttonDefaultBorder: '#aaa',
  buttonDefaultBorderHover: '#888',

  // Spinner Colors
  spinnerTrack: '#f3f3f3',
  spinnerActive: '#3498db',

  // Shadow Colors
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',

  // Text Colors
  textPrimary: '#333',
  textWhite: '#ffffff',
  textError: '#dc3545',
} as const;

// Type for color keys
export type ColorKey = keyof typeof colors;
