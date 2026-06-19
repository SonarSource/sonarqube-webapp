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

const { RuleTester } = require('eslint');
const validL10nMessageKey = require('../valid-l10n-message-key');

const testKeys = ['known.only'];
const opts = [{ knownKeys: testKeys }];

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('valid-l10n-message-key', validL10nMessageKey, {
  valid: [
    {
      code: `
        import { FormattedMessage } from 'react-intl';
        export const X = () => <FormattedMessage id="known.only" />;
      `,
      options: opts,
    },
    {
      code: `
        import { FormattedMessage } from 'react-intl';
        export const X = () => <FormattedMessage id={notStatic} />;
      `,
      options: opts,
    },
    {
      code: `
        import { useIntl } from 'react-intl';
        const k = 'dynamic';
        export const X = () => {
          useIntl().formatMessage({ id: k });
          return null;
        };
      `,
      options: opts,
    },
    {
      code: `
        import { useIntl } from 'react-intl';
        export const X = () => {
          useIntl().formatMessage({ descriptor: {} });
          return null;
        };
      `,
      options: opts,
    },
    {
      code: `
        import { useIntl } from 'react-intl';
        export const X = () => {
          const { formatMessage: fm } = useIntl();
          fm({ id: 'known.only' });
          return null;
        };
      `,
      options: opts,
    },
    {
      code: `
        import { useIntl } from 'react-intl';
        export const X = () => {
          const intl = useIntl();
          intl.formatMessage({ id: 'known.only' });
          return null;
        };
      `,
      options: opts,
    },
    {
      code: `
        import { FormattedMessage } from 'react-intl';
        export const X = () => <FormattedMessage id={\`prefix.\${suffix}.suffix\`} />;
      `,
      options: opts,
    },
    {
      code: `
        import { FormattedMessage } from 'react-intl';
        const part = 'x';
        export const X = () => <FormattedMessage id={'abc.' + part + '.def'} />;
      `,
      options: opts,
    },
  ],
  invalid: [
    {
      code: `
        import { FormattedMessage } from 'react-intl';
        export const X = () => <FormattedMessage id="missing.key" />;
      `,
      options: opts,
      errors: [{ messageId: 'unknownKeyCloud', data: { key: 'missing.key' } }],
    },
    {
      code: `
        import { useIntl } from 'react-intl';
        export const X = () => {
          useIntl().formatMessage({ id: 'missing.fm' });
          return null;
        };
      `,
      options: opts,
      errors: [{ messageId: 'unknownKeyCloud', data: { key: 'missing.fm' } }],
    },
    {
      code: `
        import { FormattedMessage } from 'react-intl';
        export const X = () => <FormattedMessage id="missing.server" />;
      `,
      options: [{ knownKeys: testKeys, platform: 'server' }],
      errors: [{ messageId: 'unknownKeyServer', data: { key: 'missing.server' } }],
    },
  ],
});
