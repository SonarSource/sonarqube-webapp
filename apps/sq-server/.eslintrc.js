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
  },
};
