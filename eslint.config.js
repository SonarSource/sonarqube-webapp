/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

// @ts-check

const js = require('@eslint/js');
const globals = require('globals');
const nxPlugin = require('@nx/eslint-plugin');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const headerPlugin = require('@tony.ganchev/eslint-plugin-header');
const importPlugin = require('eslint-plugin-import');
const jestPlugin = require('eslint-plugin-jest');
const jestDomPlugin = require('eslint-plugin-jest-dom');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const localRulesPlugin = require('eslint-plugin-local-rules');
const promisePlugin = require('eslint-plugin-promise');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const testingLibraryPlugin = require('eslint-plugin-testing-library');
const jsoncParser = require('jsonc-eslint-parser');
const prettier = require('eslint-config-prettier');

// ─── NX flat configs ───────────────────────────────────────────────────────────
const nxReact = nxPlugin.configs['flat/react'];

// ─── @typescript-eslint flat configs ───────────────────────────────────────────
const tsEslintRecommended = tsPlugin.configs['flat/eslint-recommended'];
const tsRecommendedTypeChecked = tsPlugin.configs['flat/recommended-type-checked'];
const tsStrict = tsPlugin.configs['flat/strict'];
const tsStylisticTypeChecked = tsPlugin.configs['flat/stylistic-type-checked'];

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // ─── Global ignores (replaces .eslintignore + root ignorePatterns: ['**/*']) ─
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      '**/build/**',
      '**/.nx/**',

      // Project-specific build artifacts
      'private/libs/feature-architecture/src/types/proto/generated/**',

      // Tool configs that were previously in ignorePatterns of individual .eslintrc.js files
      'apps/sq-server/babel.config.js',
      'apps/sq-server/jest.config.js',
      'apps/sq-server/vite.config.mjs',
      'apps/sq-server/tailwind*.js',
      'apps/sq-server/script/**',
      'apps/sq-server/config/**',
      'private/apps/sq-cloud/babel.config.js',
      'private/apps/sq-cloud/jest.config.js',
      'private/apps/sq-cloud/vite.config.mjs',
      'private/apps/sq-cloud/tailwind*.js',
      'private/apps/sq-cloud/script/**',
      'private/apps/sq-cloud/config/**',

      // NX automation template files should never be linted
      'tools/nx-automation/**/*.template',
    ],
  },

  // ─── JSON files: @nx/dependency-checks ────────────────────────────────────
  {
    files: ['**/*.json'],
    ignores: ['**/package.json'],
    plugins: { '@nx': nxPlugin },
    languageOptions: { parser: jsoncParser },
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

  // ─── Base JS config (all JS/TS/TSX files) ────────────────────────────
  {
    files: ['**/*.{js,ts,tsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.jest,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true, modules: true },
      },
    },
    settings: {
      'import/ignore': ['node_modules'],
      react: { version: '19.2.4' },
    },
    plugins: {
      '@nx': nxPlugin,
      header: headerPlugin,
      import: importPlugin,
      jest: jestPlugin,
      'jest-dom': jestDomPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'local-rules': localRulesPlugin,
      promise: promisePlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'testing-library': testingLibraryPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,

      // ── ESLint 10: new eslint:recommended rules
      // These rules are newly enabled in eslint:recommended in v10.
      // They are explicitly lowered to `warn` here to avoid breaking changes on upgrade.
      // 'no-unassigned-vars': 'warn',
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn',

      // ── NX module boundaries ──────────────────────────────────────────────
      '@nx/enforce-module-boundaries': [
        'error',
        {
          // The rule ignores the aliases defined in the local tsconfig.json and only reads the ones
          // defined in the root tsconfig.base.json. Making it raise false positives issues for sq-cloud.
          // Using allow basically disables the rule for the ~adapters alias. Which is OK since adapters are
          // supposed to be usable by all modules.
          allow: ['adapters'],

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
          // We have circular dependencies between shared and sq-cloud/sq-server-commons because of the adapters systems that are stored there
          ignoredCircularDependencies: [
            ['shared', 'sq-cloud'],
            ['shared', 'sq-server-commons'],
          ],
          enforceBuildableLibDependency: true,
        },
      ],

      // ── NX react rules (from flat/react) ─────────────────────────────────
      ...nxReact.rules,

      // ── General JS rules ─────────────────────────────────────────────────
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

      // ── Header ───────────────────────────────────────────────────────────
      'header/header': [
        'error',
        'block',
        [
          '',
          ' * SonarQube',
          ' * Copyright (C) 2009-2025 SonarSource Sàrl',
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

      // ── Import ───────────────────────────────────────────────────────────
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
      'import/no-unresolved': 'off',
      'import/no-useless-path-segments': ['error', { noUselessIndex: true }],

      // ── Jest ─────────────────────────────────────────────────────────────
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
      'jest/no-commented-out-tests': 'error',
      'jest/no-conditional-in-test': 'warn',
      'jest/no-disabled-tests': 'error',
      'jest/no-duplicate-hooks': 'error',
      'jest/no-jasmine-globals': 'warn',
      'jest/no-large-snapshots': ['warn', { maxSize: 250 }],
      'jest/no-restricted-matchers': [
        'error',
        { toBeTruthy: 'Avoid `toBeTruthy`', toBeFalsy: 'Avoid `toBeFalsy`' },
      ],
      'jest/prefer-comparison-matcher': 'error',
      'jest/prefer-equality-matcher': 'error',
      'jest/prefer-mock-promise-shorthand': 'error',

      // ── Jest DOM ─────────────────────────────────────────────────────────
      ...jestDomPlugin.configs['flat/recommended'].rules,

      // ── JSX A11Y ─────────────────────────────────────────────────────────
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/control-has-associated-label': [
        'warn',
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
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': [
        'warn',
        { tags: [], roles: ['tabpanel'], allowExpressionValues: true },
      ],
      'jsx-a11y/no-static-element-interactions': [
        'warn',
        {
          allowExpressionValues: true,
          handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        },
      ],

      // ── Misc ─────────────────────────────────────────────────────────────
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

      // ── Local rules ──────────────────────────────────────────────────────
      'local-rules/convert-class-to-function-component': 'error',
      'local-rules/enforce-staletime-enum': 'warn',
      'local-rules/no-api-imports': 'warn',
      'local-rules/no-conditional-rendering-of-spinner': 'warn',
      'local-rules/no-default-props': 'error',
      'local-rules/no-direct-axios-import': 'error',
      'local-rules/no-direct-echoes-design-tokens': 'warn',
      'local-rules/no-implicit-coercion': 'off',
      'local-rules/no-jsx-literals': 'warn',
      'local-rules/no-launch-darkly-direct-import-in-shared-code': 'error',
      'local-rules/no-query-client-imports': 'warn',
      'local-rules/no-within': 'warn',
      'local-rules/use-await-expect-async-matcher': 'warn',
      'local-rules/use-componentqualifier-enum': 'warn',
      'local-rules/use-jest-mocked': 'warn',
      'local-rules/use-metrickey-enum': 'warn',
      'local-rules/use-metrictype-enum': 'warn',
      'local-rules/use-proper-query-name': 'warn',
      'local-rules/use-visibility-enum': 'warn',
      'local-rules/no-direct-analytics-sdk-calls': 'error',
      'local-rules/no-explicit-undefined-enabled-in-react-query': 'error',
      'local-rules/valid-l10n-message-key': ['error', { platform: 'auto' }],

      // ── No-* rules ───────────────────────────────────────────────────────
      'max-depth': 'error',
      'no-alert': 'error',
      'no-array-constructor': 'error',
      'no-await-in-loop': 'error',
      'no-caller': 'error',
      'no-console': 'error',
      'no-constructor-return': 'error',
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
      'no-implicit-coercion': 'off',
      'no-implied-eval': 'error',
      'no-invalid-regexp': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-lonely-if': 'error',
      'no-loop-func': 'error',
      'no-mixed-spaces-and-tabs': 'error',
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
      // ESLint 10: reportGlobalThis now defaults to true; keep existing behavior explicitly
      'no-shadow-restricted-names': ['error', { reportGlobalThis: false }],
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
      'no-void': ['error', { allowAsStatement: true }],
      'no-with': 'error',

      // ── Object / misc style ──────────────────────────────────────────────
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

      // ── Promise ──────────────────────────────────────────────────────────
      ...promisePlugin.configs['flat/recommended'].rules,
      'promise/always-return': 'off',
      'promise/catch-or-return': ['warn', { allowThen: true, allowFinally: true }],
      'promise/no-return-wrap': ['error', { allowReject: true }],

      radix: 'error',

      // ── React ────────────────────────────────────────────────────────────
      ...reactPlugin.configs.flat.recommended.rules,
      // Only enable the two rules that were in react-hooks v4 recommended.
      // The v7 recommended config adds many new strict rules (refs, set-state-in-effect, etc.)
      // that require large-scale code changes and are not enabled here intentionally.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/button-has-type': 'error',
      'react/forbid-component-props': [
        'error',
        {
          forbid: [
            {
              message:
                "Use the SafeHTMLInjection component instead of 'dangerouslySetInnerHTML', to prevent CSS injection along other XSS attacks",
              propName: 'dangerouslySetInnerHTML',
            },
            {
              disallowedFor: ['FormattedMessage'],
              message:
                "Don't use the 'defaultMessage' prop as it won't work. Only use the 'id' prop and the translation key without translate().",
              propName: 'defaultMessage',
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
      'react/jsx-no-constructed-context-values': 'warn',
      'react/jsx-no-script-url': 'error',
      'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
      'react/jsx-pascal-case': ['error', { allowNamespace: true }],
      'react/jsx-sort-props': 'error',
      'react/no-access-state-in-setstate': 'error',
      'react/no-adjacent-inline-elements': 'error',
      'react/no-arrow-function-lifecycle': 'error',
      'react/no-danger': 'error',
      'react/no-namespace': 'error',
      'react/no-redundant-should-component-update': 'error',
      'react/no-this-in-sfc': 'error',
      'react/no-unsafe': 'error',
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react/no-unused-prop-types': 'error',
      'react/no-unused-state': 'error',
      'react/no-will-update-set-state': 'error',
      'react/prop-types': 'off',
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

      // ── Require / misc ───────────────────────────────────────────────────
      'require-atomic-updates': 'error',
      'require-await': 'error',
      'require-yield': 'error',

      // ── Testing Library ──────────────────────────────────────────────────
      ...testingLibraryPlugin.configs['flat/react'].rules,
      'testing-library/no-node-access': ['error', { allowContainerFirstChild: true }],
      'testing-library/render-result-naming-convention': 'off',

      // ── Misc ─────────────────────────────────────────────────────────────
      'use-isnan': 'error',
      'valid-typeof': 'error',
      'wrap-iife': 'error',
      yoda: 'error',
    },
  },

  // ─── TypeScript files ─────────────────────────────────────────────────────
  // Spread the flat typescript-eslint configs then apply our overrides
  ...[tsEslintRecommended, ...tsRecommendedTypeChecked, ...tsStrict, ...tsStylisticTypeChecked].map(
    (config) => ({
      ...config,
      files: ['**/*.{ts,tsx}'],
    }),
  ),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/default-param-last': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/no-dynamic-delete': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-extraneous-class': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-invalid-this': 'warn',
      '@typescript-eslint/no-invalid-void-type': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'warn',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
    },
  },

  // ─── TypeScript project roots: per-project tsconfigRootDir ───────────────
  // Each project needs its own tsconfigRootDir so the TS parser finds its tsconfig.json
  {
    files: ['apps/sq-server/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/apps/sq-server` },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: [__dirname, `${__dirname}/apps/sq-server`] },
      ],
    },
  },
  {
    files: ['private/apps/sq-cloud/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/apps/sq-cloud` },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: [__dirname, `${__dirname}/private/apps/sq-cloud`] },
      ],
      'no-restricted-globals': 'warn',
      'react/forbid-elements': 'warn',
    },
    settings: {
      'testing-library/utils-module': '~helpers/testUtils',
    },
  },
  {
    files: ['libs/shared/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/libs/shared` },
    },
  },
  {
    files: ['libs/sq-server-commons/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/libs/sq-server-commons` },
    },
  },
  {
    files: ['libs/feature-rules/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/libs/feature-rules` },
    },
  },
  {
    files: ['libs/feature-onboarding-dashboard/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/libs/feature-onboarding-dashboard` },
    },
  },
  {
    files: ['private/libs/shared/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/libs/shared` },
    },
  },
  {
    files: ['private/libs/feature-architecture/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/libs/feature-architecture` },
    },
    rules: {
      // Allow protobuf-generated field names (snake_case)
      camelcase: ['warn', { allow: ['file_graph', 'namespace_graph', 'to_id'] }],
    },
  },
  {
    files: ['private/libs/feature-jira/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/libs/feature-jira` },
    },
  },
  {
    files: ['private/libs/feature-sca/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/libs/feature-sca` },
    },
  },
  {
    files: ['private/libs/sq-server-features/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/libs/sq-server-features` },
    },
  },
  {
    files: ['private/libs/feature-dashboards/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/private/libs/feature-dashboards` },
    },
  },
  {
    files: ['tools/nx-automation/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { tsconfigRootDir: `${__dirname}/tools/nx-automation` },
    },
    rules: {
      'local-rules/use-metrickey-enum': 'off',
      'local-rules/use-visibility-enum': 'off',
    },
  },

  // ─── sq-cloud-metrics ──
  {
    files: ['private/sq-cloud-metrics/**/*.{js,ts}'],
    rules: {
      'import/extensions': 'off',
      'no-console': 'off',
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
      'local-rules/no-direct-axios-import': 'off',
    },
  },

  // ─── e2e tests ────────────────────────────────────────────────────────────
  {
    files: ['private/sq-cloud-e2e-tests/**/*.{ts,tsx,js}'],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: [__dirname, `${__dirname}/private/sq-cloud-e2e-tests`] },
      ],
      'testing-library/prefer-screen-queries': 'off',
      'no-await-in-loop': 'off',
    },
  },

  // ─── Test files: relax some rules ────────────────────────────────────────
  {
    files: ['**/__tests__/*.ts*', '**/*-tests/**/*.ts*', '**/*.spec.ts*', '**/*Mock.ts*'],
    rules: {
      'local-rules/no-jsx-literals': 'off',
      'react/jsx-no-constructed-context-values': 'off',
    },
  },

  // ─── Query files: no floating promises (too many react-query FPs) ─────────
  {
    files: ['**/src/queries/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  // ─── Private apps/libs: override with SonarSource Sàrl copyright ─────────
  {
    files: ['private/**/*.{js,ts,tsx}'],
    rules: {
      'header/header': [
        'error',
        'block',
        [
          '',
          ' * Copyright (C) 2009-2025 SonarSource Sàrl',
          ' * All rights reserved',
          ' * mailto:info AT sonarsource DOT com',
          ' ',
        ],
        2,
      ],
    },
  },

  // ─── Prettier (must be last — disables formatting rules) ─────────────────
  prettier,
];
