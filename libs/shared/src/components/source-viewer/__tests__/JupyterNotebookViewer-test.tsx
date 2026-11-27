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

import type { IDisplayData } from '@jupyterlab/nbformat';
import { CodeSnippet } from '~adapters/components/CodeSnippet';
import { JupyterCodeCell } from '~adapters/components/source-viewer/JupyterNotebookViewer';
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole } from '../../../helpers/testSelector';
import displayOutput from './fixtures/display-output.json';

const PNG_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lLsAAAAASUVORK5CYII=';

const outputImage = byRole('img', { name: 'source_viewer.jupyter.output.image' });

describe('JupyterCodeCell source', () => {
  it.each([
    '',
    'print("hello")',
    'A & B',
    'A &amp; B',
    '&lt;div&gt;',
    '&amp;lt;div&amp;gt;',
    '<mark>marked</mark>',
    '  leading\nspaces',
    'before </pre> after',
  ])('preserves existing snippet rendering for %p', (snippet) => {
    const { unmount } = renderWithContext(
      <CodeSnippet language="python" noCopy snippet={snippet} wrap />,
    );

    const expectedHtml = byRole('code').get().innerHTML;
    unmount();

    renderWithContext(<JupyterCodeCell source={[snippet.slice(0, 3), snippet.slice(3)]} />);

    expect(byRole('code').get().innerHTML).toBe(expectedHtml);
  });
});

describe('JupyterCodeCell PNG output', () => {
  it('renders a base64 string', () => {
    setup(PNG_DATA);

    expect(outputImage.get()).toHaveAttribute('src', `data:image/png;base64,${PNG_DATA}`);
  });

  it('joins base64 string chunks without separators', () => {
    setup([PNG_DATA.slice(0, 32), PNG_DATA.slice(32)]);

    expect(outputImage.get()).toHaveAttribute('src', `data:image/png;base64,${PNG_DATA}`);
  });

  it('does not render an image for an object value', () => {
    setup({ unexpected: 'object' });

    expect(outputImage.query()).not.toBeInTheDocument();
  });
});

function setup(png: IDisplayData['data'][string]) {
  const output = {
    ...displayOutput,
    data: { 'image/png': png },
  };

  return renderWithContext(<JupyterCodeCell outputs={[output]} source={['print("hello")']} />);
}
