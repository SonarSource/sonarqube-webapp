module.exports = {
  extends: ['../../.eslintrc.json'],
  plugins: ['header', 'typescript-sort-keys', 'eslint-plugin-local-rules'],
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
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    camelcase: 'off',
    'promise/no-return-wrap': 'warn',
    'header/header': [
      'error',
      'block',
      [
        '',
        ' * SonarQube',
        ' * Copyright (C) 2009-2025 SonarSource SA',
        ' * mailto:info AT sonarsource DOT com',
        ' *',
        ' * This program is free software; you can redistribute it and/or',
        ' * modify it under the terms of the GNU Lesser General Public',
        ' * License as published by the Free Software Foundation; either',
        ' * version 3 of the License, or (at your option) any later version.',
        ' *',
        ' * This program is distributed in the hope that it will be useful,',
        ' * but WITHOUT ANY WARRANTY; without even the implied warranty of',
        ' * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU',
        ' * Lesser General Public License for more details.',
        ' *',
        ' * You should have received a copy of the GNU Lesser General Public License',
        ' * along with this program; if not, write to the Free Software Foundation,',
        ' * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.',
        ' ',
      ],
      2,
    ],
    'react/forbid-component-props': [
      'error',
      {
        forbid: [
          {
            propName: 'dangerouslySetInnerHTML',
            message:
              "Use the SafeHTMLInjection component instead of 'dangerouslySetInnerHTML', to prevent CSS injection along other XSS attacks",
          },
        ],
      },
    ],
    'react/forbid-dom-props': [
      'error',
      {
        forbid: [
          {
            propName: 'dangerouslySetInnerHTML',
            message:
              "Use the SafeHTMLInjection component instead of 'dangerouslySetInnerHTML', to prevent CSS injection along other XSS attacks",
          },
        ],
      },
    ],
    'react/forbid-elements': [
      'warn',
      {
        forbid: [
          {
            element: 'img',
            message: 'use <Image> from components/common instead',
          },
        ],
      },
    ],
    'react/jsx-curly-brace-presence': 'warn',
    'react/react-in-jsx-scope': 'off',
    'testing-library/render-result-naming-convention': 'off',
    'typescript-sort-keys/interface': 'error',
    /* Local rules, defined in ./eslint-local-rules/ */
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
