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

  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },

  rules: {
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
  },
};
