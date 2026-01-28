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

import { isObject, some } from 'lodash';
import { createElement, Fragment, ReactNode } from 'react';
import { type MessageDescriptor } from 'react-intl';

const formatMessageMock = jest
  .fn()
  .mockImplementation(
    (
      { id }: MessageDescriptor,
      values: Record<string, string | ((text: string) => ReactNode)> = {},
    ) => {
      if (some(values, isObject)) {
        return (
          <>
            {id}{' '}
            {Object.entries(values).map(([key, value]) => (
              <Fragment key={key}>
                {typeof value === 'function' ? value(`${id}_${key}`) : value}
              </Fragment>
            ))}
          </>
        );
      }
      return [
        id,
        ...Object.values(values).filter((v) => v !== undefined && v !== null && v !== ''),
      ].join('.');
    },
  );

const reactIntl = jest.requireActual<typeof import('react-intl')>('react-intl');

module.exports = {
  ...reactIntl,
  createIntl: (...args: Parameters<typeof reactIntl.createIntl>) => ({
    ...reactIntl.createIntl(...args),
    formatMessage: formatMessageMock,
  }),
  useIntl: () => ({
    formatMessage: formatMessageMock,
    formatDate: jest.fn().mockImplementation((v: string) => {
      const formatter = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return formatter.format(new Date(v));
    }),
  }),
  FormattedMessage: ({
    id,
    tagName,
    values,
  }: {
    id: string;
    tagName?: string;
    values?: Record<string, string | ((text: string) => ReactNode)>;
  }) => {
    const content = formatMessageMock({ id }, values);

    return tagName ? createElement(tagName, {}, content) : content;
  },
};
