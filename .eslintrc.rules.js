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

    '@typescript-eslint/no-useless-constructor': 'error',

    'block-scoped-var': 'error',
    camelcase: 'warn',
    'consistent-this': ['warn', 'that'],
    curly: 'error',
    'eol-last': 'warn',
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

    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-amd': 'error',
    'import/no-deprecated': 'error',
    'import/no-duplicates': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-default': 'error',
    'import/no-unresolved': 'off', // is 'error' in 'plugin:import/errors'
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
    'import/no-webpack-loader-syntax': 'error',

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

    'jsx-a11y/accessible-emoji': 'off',
    'jsx-a11y/anchor-has-content': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/anchor-is-valid': 'off', // is 'error' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/click-events-have-key-events': 'off', // is 'error' in 'plugin:jsx-a11y/recommended'

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

    'jsx-a11y/label-has-associated-control': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/label-has-for': 'off', // has FPs - is also 'off' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/no-autofocus': 'off', // is 'error' in 'plugin:jsx-a11y/recommended'
    'jsx-a11y/no-noninteractive-element-interactions': 'off', // is 'error' in 'plugin:jsx-a11y/recommended'

    'jsx-a11y/no-noninteractive-element-to-interactive-role': [
      'error',
      {
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
        fieldset: ['radiogroup', 'presentation'],
      },
    ],

    'jsx-a11y/no-noninteractive-tabindex': [
      'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
      { tags: [], roles: ['tabpanel'], allowExpressionValues: true },
    ],

    'jsx-a11y/no-redundant-roles': 'warn', // is 'error' in 'plugin:jsx-a11y/recommended'

    'jsx-a11y/no-static-element-interactions': [
      'warn', // is 'error' in 'plugin:jsx-a11y/recommended'
      {
        allowExpressionValues: true,
        handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      },
    ],

    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'max-depth': 'warn',
    'no-alert': 'error',
    'no-array-constructor': 'off',
    'no-await-in-loop': 'error',
    'no-caller': 'error',
    'no-console': 'error',
    'no-constructor-return': 'error',
    'no-continue': 'error',
    'no-div-regex': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'warn',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-extra-semi': 'off', // is 'error' in 'eslint:recommended'
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-multi-assign': 'warn',
    'no-new-func': 'error',
    'no-new-object': 'warn',
    'no-new-wrappers': 'error',
    'no-new': 'error',
    'no-promise-executor-return': 'error',
    'no-proto': 'error',
    'no-restricted-properties': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-underscore-dangle': 'warn',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'warn',
    'no-unused-expressions': 'error',
    'no-unused-vars': 'off', // is 'error' in 'eslint:recommended'
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'off',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'object-shorthand': 'error',
    'one-var': ['warn', 'never'],
    'operator-assignment': 'warn',

    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: ['class', 'function'] },
      { blankLine: 'always', prev: ['class', 'function'], next: '*' },
    ],

    'prefer-arrow-callback': 'error',
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'prefer-numeric-literals': 'warn',
    'prefer-rest-params': 'warn', // is 'error' in 'plugin:@typescript-eslint/eslint-recommended'
    'prefer-spread': 'warn', // is 'error' in 'plugin:@typescript-eslint/eslint-recommended'

    'promise/always-return': 'off', // is 'error' in 'plugin:promise/recommended'

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

    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',

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
    'react/jsx-handler-names': 'off',
    'react/jsx-no-leaked-render': 'off', // too many false positives right now
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],

    'react/jsx-pascal-case': [
      'error',
      {
        allowNamespace: true,
      },
    ],

    'react/no-access-state-in-setstate': 'error',
    'react/no-adjacent-inline-elements': 'error',
    'react/no-arrow-function-lifecycle': 'error',
    'react/no-danger': 'warn',
    'react/no-namespace': 'error',
    'react/no-redundant-should-component-update': 'error',
    'react/no-this-in-sfc': 'error',
    'react/no-typos': 'error',
    'react/no-unsafe': 'error', // is 'off' in 'plugin:react/recommended'
    'react/no-unused-prop-types': 'error',
    'react/no-unused-state': 'error',
    'react/no-will-update-set-state': 'error',
    'react/prop-types': 'off', // turn off prop types validation, better use ts ;) - is 'error' in 'plugin:react/recommended'
    'react/react-in-jsx-scope': 'off',
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

    'testing-library/render-result-naming-convention': 'off',

    'typescript-sort-keys/interface': 'error',

    'wrap-iife': 'error',
    yoda: 'error',
  },
};
