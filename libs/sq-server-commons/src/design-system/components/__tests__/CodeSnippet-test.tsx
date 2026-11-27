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

import { screen } from '@testing-library/react';
import { copy } from 'clipboard';
import { HelmetProvider } from 'react-helmet-async';
import { FCProps } from '../../../types/misc';
import { renderWithContext } from '../../helpers/testUtils';
import { CodeSnippet } from '../CodeSnippet';

jest.mock('clipboard', () => ({
  copy: jest.fn((value: string) => value),
}));

it('copies a multiline snippet', async () => {
  const { container, user } = setupWithProps();
  expect(container).toMatchSnapshot();

  await user.click(screen.getByRole('button', { name: 'copy' }));

  expect(copy).toHaveBeenCalledWith('foo\nbar');
});

it('copies a single-line snippet', async () => {
  const { container, user } = setupWithProps({ isOneLine: true, snippet: 'foobar' });
  expect(container).toMatchSnapshot();

  await user.click(screen.getByRole('button', { name: 'copy' }));

  expect(copy).toHaveBeenCalledWith('foobar');
});

it.each([
  ['A & B', 'A & B'],
  ['A &amp; B', 'A &amp; B'],
  ['&lt;div&gt;', '&lt;div&gt;'],
])('preserves display and copying for %s', async (snippet, displayed) => {
  const { user } = setupWithProps({ snippet });

  expect(screen.getByText(displayed)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'copy' }));

  expect(copy).toHaveBeenLastCalledWith(snippet);
});

it('preserves nested entities in displayed and copied source', async () => {
  // The nested entities are intentional: displaying source must not decode them
  const snippet = '&amp;lt;div&amp;gt;';
  const { user } = setupWithProps({ snippet });

  expect(screen.getByText(snippet)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'copy' }));

  expect(copy).toHaveBeenLastCalledWith(snippet);
});

it('should highlight code content correctly', () => {
  const { container } = setupWithProps({ snippet: '<prop>foobar<prop>' });
  expect(container).toMatchSnapshot();
});

it.each([
  { isOneLine: false, tagName: 'PRE', wrap: false },
  { isOneLine: false, tagName: 'CODE', wrap: true },
  { isOneLine: false, tagName: 'CODE', wrap: 'words' },
  { isOneLine: true, tagName: 'CODE', wrap: false },
] as const)(
  'wraps rendered content in $tagName when isOneLine=$isOneLine and wrap=$wrap',
  ({ isOneLine, tagName, wrap }) => {
    setupWithProps({
      isOneLine,
      render: 'rendered command',
      snippet: 'original command',
      wrap,
    });

    expect(screen.getByText('rendered command').tagName).toBe(tagName);
    expect(screen.queryByText('original command')).not.toBeInTheDocument();
  },
);

it('highlights snippets by default', () => {
  setupWithProps({ language: 'javascript', snippet: 'const answer = 42;' });

  expect(screen.getByText('const')).toHaveClass('hljs-keyword');
});

it('renders snippets as plain text when highlighting is disabled', () => {
  setupWithProps({ highlight: false, language: 'javascript', snippet: 'const answer = 42;' });

  expect(screen.getByText('const answer = 42;')).toBeInTheDocument();
});

function setupWithProps(props: Partial<FCProps<typeof CodeSnippet>> = {}) {
  return renderWithContext(
    <HelmetProvider>
      <CodeSnippet snippet={'foo\nbar'} {...props} />
    </HelmetProvider>,
  );
}
