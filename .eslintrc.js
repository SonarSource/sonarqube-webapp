module.exports = {
  root: true,

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:import/errors',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:promise/recommended',
    'plugin:testing-library/react',
    'plugin:react/recommended',
    '.eslintrc.rules.js',
  ],

  ignorePatterns: ['**/*'],

  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 6,
    'sourceType:': 'module',

    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
  },

  parser: '@typescript-eslint/parser',

  plugins: [
    '@nx',
    '@typescript-eslint',
    'import',
    'jest',
    'jsx-a11y',
    'promise',
    'react',
    'react-hooks',
  ],

  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],

      rules: {
        'react/react-in-jsx-scope': 'off',
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              // Visibility restricts public modules from directly accessing private modules
              {
                sourceTag: 'visibility:public',
                onlyDependOnLibsWithTags: ['visibility:public'],
              },
              // Scope separates SQ Cloud from SQ Server modules
              {
                sourceTag: 'scope:cloud',
                onlyDependOnLibsWithTags: ['scope:cloud', 'scope:shared'],
              },
              {
                sourceTag: 'scope:server',
                onlyDependOnLibsWithTags: ['scope:server', 'scope:shared'],
              },
              {
                sourceTag: 'scope:shared',
                onlyDependOnLibsWithTags: ['scope:shared'],
              },
              // Type handles the module hierarchy
              {
                sourceTag: 'type:app',
                onlyDependOnLibsWithTags: ['type:feature', 'type:util', 'type:bridge'],
              },
              {
                sourceTag: 'type:bridge',
                onlyDependOnLibsWithTags: ['type:feature'],
              },
              {
                sourceTag: 'type:feature',
                onlyDependOnLibsWithTags: ['type:util'],
              },
              {
                sourceTag: 'type:util',
                onlyDependOnLibsWithTags: ['type:util'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@nx/typescript'],
      rules: {},
    },
  ],

  settings: {
    'import/ignore': ['node_modules'],
    react: {
      version: '18.3.1',
    },
  },
};
