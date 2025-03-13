module.exports = {
  extends: ['../../../.eslintrc.js'],

  ignorePatterns: [
    '!**/*',
    '.eslintrc.js',
    'babel.config.js',
    'jest.config.js',
    'vite.config.ts',
    'tailwind*.js',
    'script/**/*',
    'config/**/*',
  ],

  // WARNING: the section below is not strictly needed for ESLint to work - it's a duplicate of what
  // is already in .eslintrc.rules.js, and the eslint command works fine without it - but not
  // replicating it here confuses the VS Code eslint plugin, so please don't remove it!
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],

      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  ],
  //
};
