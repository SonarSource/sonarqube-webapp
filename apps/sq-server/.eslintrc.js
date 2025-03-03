module.exports = {
  extends: ['../../.eslintrc.js'],

  ignorePatterns: [
    '!**/*',
    '.eslintrc.js',
    'babel.config.js',
    'jest.config.js',
    'vite.config.mjs',
    'tailwind*.js',
    'script/**/*',
    'config/**/*',
    'eslint-local-rules/**/*',
  ],

  // Configure @typescript-eslint/parser
  parserOptions: {
    // This setting is required to use rules which require type information.
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  rules: {
    // this is needed because deps are installed at the root level
    'import/no-extraneous-dependencies': ['error', { packageDir: ['../..', '.'] }],
    //

    'promise/no-return-wrap': 'warn',

    'react/jsx-curly-brace-presence': 'warn',

    'local-rules/use-componentqualifier-enum': 'warn',
    'local-rules/use-metrickey-enum': 'warn',
    'local-rules/use-metrictype-enum': 'warn',
    'local-rules/use-visibility-enum': 'warn',
    'local-rules/convert-class-to-function-component': 'warn',
    'local-rules/no-conditional-rendering-of-spinner': 'warn',
    'local-rules/use-jest-mocked': 'warn',
    'local-rules/use-await-expect-async-matcher': 'warn',
    'local-rules/no-implicit-coercion': 'warn',
    'local-rules/no-api-imports': 'warn',
    'local-rules/no-within': 'warn',
    'local-rules/use-proper-query-name': 'warn',

    'no-restricted-properties': [
      'warn',
      {
        object: 'Math',
        property: 'random',
        message:
          'Tests can fail when the same random number is used as a key for several React elements.',
      },
    ],
  },
};
