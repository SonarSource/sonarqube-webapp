module.exports = {
  root: true,

  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:@nx/react',
    'plugin:import/errors',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:promise/recommended',
    'plugin:react/recommended',
    'plugin:testing-library/react',
    '.eslintrc.rules.js',
  ],

  env: {
    browser: true,
    es2020: true,
    jest: true,
    node: true,
  },

  ignorePatterns: ['**/*'],

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',

    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
  },

  plugins: [
    '@nx',
    '@typescript-eslint',
    'header',
    'import',
    'jest',
    'jest-dom',
    'jsx-a11y',
    'local-rules',
    'promise',
    'react',
    'react-hooks',
    'testing-library',
    'typescript-sort-keys',
  ],

  settings: {
    'import/ignore': ['node_modules'],

    react: {
      version: '18.3.1',
    },
  },
};
