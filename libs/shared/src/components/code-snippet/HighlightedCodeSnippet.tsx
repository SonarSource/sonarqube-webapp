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

import classNames from 'classnames';
import { CodeSnippetCopyButton, CodeSnippetFrame } from './code-snippet-styles';
import type { CodeSnippetPresentationProps } from './CodeSnippetProps';
import { HighlightedCode } from './HighlightedCode';

export interface HighlightedCodeSnippetProps extends CodeSnippetPresentationProps {
  copyValue: string;
  htmlAsString: string;
}

export function HighlightedCodeSnippet({
  className,
  copyAriaLabel,
  copyValue,
  htmlAsString,
  isOneLine,
  noCopy,
  wrap,
}: Readonly<HighlightedCodeSnippetProps>) {
  const isSimpleOneLine = isOneLine && noCopy;
  const copyButton = <CodeSnippetCopyButton ariaLabel={copyAriaLabel} copyValue={copyValue} />;

  return (
    <CodeSnippetFrame
      as={isSimpleOneLine ? 'span' : undefined}
      className={classNames(
        'sw:code',
        {
          'code-snippet-highlighted-oneline': isOneLine,
          'code-snippet-simple-oneline': isSimpleOneLine,
          'code-snippet-with-copy': !noCopy,
        },
        className,
        'fs-mask',
      )}
    >
      {!noCopy && copyButton}

      <HighlightedCode
        className="sw:overflow-auto"
        htmlAsString={htmlAsString}
        isSimpleOneLine={isSimpleOneLine}
        wrap={wrap}
      />
    </CodeSnippetFrame>
  );
}
