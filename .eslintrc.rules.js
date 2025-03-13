module.exports = {
  overrides: [
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',

      rules: {
        '@nx/dependency-checks': [
          'error',
          {
            ignoredFiles: [
              '{projectRoot}/eslint.config.{js,cjs,mjs}',
              '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            ],
          },
        ],
      },
    },
    {
      files: ['**/__tests__/*.ts*'],

      rules: {
        'react/jsx-no-constructed-context-values': 'off',
        'local-rules/no-jsx-literals': 'off',
      },
    },
    {
      extends: ['plugin:@typescript-eslint/eslint-recommended'],
      files: ['**/*.{ts,tsx}'],

      parser: '@typescript-eslint/parser',

      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },

      rules: {
        '@typescript-eslint/no-useless-constructor': 'error',
      },
    },
  ],

  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
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

        enforceBuildableLibDependency: true,
      },
    ],

    'block-scoped-var': 'error',
    camelcase: 'warn',
    'consistent-this': ['warn', 'that'],
    curly: 'error',
    'eol-last': 'error',
    eqeqeq: ['error', 'smart'],
    'func-name-matching': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'guard-for-in': 'error',
    'handle-callback-err': 'error',

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

    'import/extensions': [
      'error',
      'never',
      { config: 'always', css: 'always', json: 'always', md: 'always' },
    ],

    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-deprecated': 'error',
    'import/no-duplicates': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-default': 'error',
    'import/no-unresolved': 'off', // is 'error' in 'plugin:import/errors'
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],

    'jest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
    'jest/no-commented-out-tests': 'error', // is 'warn' in 'plugin:jest/recommended'
    'jest/no-conditional-in-test': 'warn',
    'jest/no-disabled-tests': 'error', // is 'warn' in 'plugin:jest/recommended'
    'jest/no-duplicate-hooks': 'error',
    'jest/no-jasmine-globals': 'warn', // is 'error' in 'plugin:jest/recommended'

    'jest/no-large-snapshots': [
      'warn',
      {
        maxSize: 250,
      },
    ],

    'jest/no-restricted-matchers': [
      'error',
      { toBeTruthy: 'Avoid `toBeTruthy`', toBeFalsy: 'Avoid `toBeFalsy`' },
    ],

    'jest/prefer-comparison-matcher': 'error',
    'jest/prefer-equality-matcher': 'error',
    'jest/prefer-mock-promise-shorthand': 'error',

    'jsx-a11y/anchor-is-valid': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/click-events-have-key-events': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'

    'jsx-a11y/control-has-associated-label': [
      'warn', // is 'off' in 'plugin:jsx-a11y/recommended'
      {
        ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
        ignoreRoles: [
          'grid',
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'row',
          'tablist',
          'toolbar',
          'tree',
          'treegrid',
        ],
        includeRoles: ['alert', 'dialog'],
      },
    ],

    'jsx-a11y/no-autofocus': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/no-noninteractive-element-interactions': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'

    'jsx-a11y/no-noninteractive-tabindex': [
      'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
      { tags: [], roles: ['tabpanel'], allowExpressionValues: true },
    ],

    'jsx-a11y/no-static-element-interactions': [
      'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
      {
        allowExpressionValues: true,
        handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      },
    ],

    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    'local-rules/convert-class-to-function-component': 'error',
    'local-rules/no-api-imports': 'warn',
    'local-rules/no-conditional-rendering-of-spinner': 'warn',
    'local-rules/no-implicit-coercion': 'warn',
    'local-rules/no-jsx-literals': 'warn',
    'local-rules/no-query-client-imports': 'warn',
    'local-rules/no-within': 'warn',
    'local-rules/use-await-expect-async-matcher': 'warn',
    'local-rules/use-componentqualifier-enum': 'warn',
    'local-rules/use-jest-mocked': 'warn',
    'local-rules/use-metrickey-enum': 'warn',
    'local-rules/use-metrictype-enum': 'warn',
    'local-rules/use-proper-query-name': 'warn',
    'local-rules/use-visibility-enum': 'warn',

    'max-depth': 'error',
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-await-in-loop': 'error',
    'no-caller': 'error',
    'no-console': 'error',
    'no-constructor-return': 'error',
    'no-continue': 'error',
    'no-control-regex': 'error',
    'no-delete-var': 'error',
    'no-div-regex': 'error',
    'no-duplicate-case': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-empty-character-class': 'error',
    'no-empty-pattern': 'error',
    'no-eval': 'error',
    'no-ex-assign': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-extra-semi': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-invalid-regexp': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-multi-assign': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-new': 'error',
    'no-octal': 'error',
    'no-promise-executor-return': 'error',
    'no-proto': 'error',
    'no-regex-spaces': 'error',

    'no-restricted-properties': [
      'warn',
      {
        object: 'Math',
        property: 'random',
        message:
          'Tests can fail when the same random number is used as a key for several React elements.',
      },
    ],

    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow-restricted-names': 'error',
    'no-sparse-arrays': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-underscore-dangle': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'error',
    'no-unused-labels': 'error',
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'object-shorthand': 'error',
    'one-var': ['warn', 'never'],
    'operator-assignment': 'error',

    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: ['class', 'function'] },
      { blankLine: 'always', prev: ['class', 'function'], next: '*' },
    ],

    'prefer-arrow-callback': 'error',
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'prefer-numeric-literals': 'error',

    'promise/always-return': 'off', // is 'error' in 'plugin:promise/recommended', but low ROI

    'promise/catch-or-return': [
      'warn', // is 'error' in 'plugin:promise/recommended'
      { allowThen: true, allowFinally: true },
    ],

    'promise/no-return-wrap': [
      'error',
      {
        allowReject: true, // is false in 'plugin:promise/recommended'
      },
    ],

    radix: 'error',

    'react/button-has-type': 'error',

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
      'error',
      {
        forbid: [
          {
            element: 'img',
            message: 'use <Image> from components/common instead',
          },
        ],
      },
    ],

    'react/function-component-definition': [
      'warn',
      { namedComponents: 'function-declaration', unnamedComponents: 'function-expression' },
    ],

    'react/hook-use-state': 'error',

    'react/jsx-boolean-value': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }],
    'react/jsx-curly-spacing': ['error', { when: 'never', allowMultiline: true }],
    'react/jsx-fragments': 'error',

    // this could be changed to 'error' once we have all functional components instead of classes
    'react/jsx-no-constructed-context-values': 'warn',
    //

    'react/jsx-no-script-url': 'error',
    'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],

    'react/jsx-pascal-case': [
      'error',
      {
        allowNamespace: true,
      },
    ],

    'react/jsx-sort-props': 'error',

    'react/no-access-state-in-setstate': 'error',
    'react/no-adjacent-inline-elements': 'error',
    'react/no-arrow-function-lifecycle': 'error',
    'react/no-danger': 'error',
    'react/no-namespace': 'error',
    'react/no-redundant-should-component-update': 'error',
    'react/no-this-in-sfc': 'error',
    'react/no-unsafe': 'error', // is 'off' in 'plugin:react/recommended'

    'react/no-unstable-nested-components': [
      'error',
      {
        allowAsProps: true,
      },
    ],

    'react/no-unused-prop-types': 'error',
    'react/no-unused-state': 'error',
    'react/no-will-update-set-state': 'error',
    'react/prop-types': 'off', // turn off prop types validation, better use ts ;) - is 'error' in 'plugin:react/recommended'
    'react/react-in-jsx-scope': 'off', // no longer needed
    'react/self-closing-comp': 'error',

    'react/sort-comp': [
      'error',
      {
        order: [
          'type-annotations',
          'instance-variables',
          'static-methods',
          'lifecycle',
          'everything-else',
          'rendering',
        ],
        groups: { rendering: ['/^render.+$/', 'render'] },
      },
    ],

    'react/sort-default-props': 'error',
    'react/style-prop-object': 'error',
    'react/void-dom-elements-no-children': 'error',

    'require-atomic-updates': 'error',
    'require-await': 'error',
    'require-yield': 'error',

    'testing-library/no-node-access': [
      'error',
      {
        allowContainerFirstChild: true,
      },
    ],

    'testing-library/render-result-naming-convention': 'off', // not useful

    'typescript-sort-keys/interface': 'error',

    'use-isnan': 'error',
    'valid-typeof': 'error',
    'wrap-iife': 'error',
    yoda: 'error',
  },
};
