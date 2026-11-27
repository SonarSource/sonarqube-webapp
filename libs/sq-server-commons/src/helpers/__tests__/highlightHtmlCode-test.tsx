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
import { HighlightedCode } from '~shared/components/code-snippet/HighlightedCode';
import { render } from '../../design-system/helpers/testUtils';
import { highlightHtmlCode } from '../highlightHtmlCode';

it('renders correctly with no code', () => {
  const { container } = render(
    <HighlightedCode
      htmlAsString={highlightHtmlCode(`
        <p>Hello there!</p>

        <p>There's no code here.</p>
      `)}
    />,
  );

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.getElementsByClassName('hljs-string')).toHaveLength(0);
});

it('renders correctly with code', () => {
  const { container } = render(
    <HighlightedCode
      htmlAsString={highlightHtmlCode(
        `
        <p>Hello there!</p>

        <p>There's some <code>"code"</code> here.</p>
     `,
        { language: 'typescript' },
      )}
    />,
  );

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.getElementsByClassName('hljs-string')).toHaveLength(1);
});

it('handles html code snippets', () => {
  const { container } = render(
    <HighlightedCode
      htmlAsString={highlightHtmlCode(
        '\u003ch4\u003eNoncompliant code example\u003c/h4\u003e\n\u003cpre data-diff-id\u003d"1" data-diff-type\u003d"noncompliant"\u003e\npublic void Method(MyObject myObject)\n{\n    if (myObject is null)\n    {\n        new MyObject(); // Noncompliant\n    }\n\n    if (myObject.IsCorrupted)\n    {\n        new ArgumentException($"{nameof(myObject)} is corrupted"); // Noncompliant\n    }\n\n    // ...\n}\n\u003c/pre\u003e\n\u003ch4\u003eCompliant solution\u003c/h4\u003e\n\u003cpre data-diff-id\u003d"1" data-diff-type\u003d"compliant"\u003e\npublic void Method(MyObject myObject)\n{\n    if (myObject is null)\n    {\n        myObject \u003d new MyObject(); // Compliant\n    }\n\n    if (myObject.IsCorrupted)\n    {\n        throw new ArgumentException($"{nameof(myObject)} is corrupted"); // Compliant\n    }\n\n    // ...\n}\n\u003c/pre\u003e',
      )}
    />,
  );

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.querySelectorAll('pre')).toHaveLength(2);
});

it('renders code as plain text when highlighting is disabled', () => {
  render(
    <HighlightedCode
      htmlAsString={highlightHtmlCode('<code>const answer = 42;</code>', {
        highlight: false,
        language: 'javascript',
      })}
    />,
  );

  expect(screen.getByText('const answer = 42;')).toBeInTheDocument();
});

it('preserves encoded source when DOM decoding is disabled', () => {
  render(
    <HighlightedCode
      htmlAsString={highlightHtmlCode('<code>&lt;div&gt;</code>', { escapeDom: false })}
    />,
  );

  expect(screen.getByText('&lt;div&gt;')).toBeInTheDocument();
});
