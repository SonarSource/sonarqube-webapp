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

  rules: {
    // this is needed because deps are installed at the root level
    'import/no-extraneous-dependencies': ['error', { packageDir: ['../..', '.'] }],
    //
  },
};
