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

import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { escape as lodashEscape } from 'lodash';
import { ClipboardButton } from '~shared/components/clipboard';
import { isDefined } from '~shared/helpers/types';
import { CodeSyntaxHighlighter } from './CodeSyntaxHighlighter';

interface Props {
  className?: string;
  copyAriaLabel?: string;
  isOneLine?: boolean;
  join?: string;
  language?: string;
  noCopy?: boolean;
  render?: string;
  snippet: string | Array<string | undefined>;
  wrap?: boolean | 'words';
}

// keep this "useless" concatenation for the readability reason
// eslint-disable-next-line no-useless-concat
const s = ' \\' + '\n  ';

export function CodeSnippet(props: Readonly<Props>) {
  const {
    copyAriaLabel,
    className,
    isOneLine,
    join = s,
    language,
    noCopy,
    render,
    snippet,
    wrap = false,
  } = props;
  const snippetArray = Array.isArray(snippet) ? snippet.filter(isDefined) : [snippet];
  const finalSnippet = isOneLine ? snippetArray.join(' ') : snippetArray.join(join);

  const isSimpleOneLine = isOneLine && noCopy;

  const copyButton = isOneLine ? (
    <StyledSingleLineClipboardButton ariaLabel={copyAriaLabel} copyValue={finalSnippet} />
  ) : (
    <StyledClipboardButton ariaLabel={copyAriaLabel} copyValue={finalSnippet} />
  );

  const renderSnippet =
    render ??
    (wrap || isOneLine
      ? `<code>${lodashEscape(finalSnippet)}</code>`
      : `<pre>${lodashEscape(finalSnippet)}</pre>`);

  return (
    <Wrapper
      as={isSimpleOneLine ? 'span' : undefined}
      className={classNames(
        'sw-code',
        {
          'sw-py-6': isOneLine && !noCopy,
          'code-snippet-highlighted-oneline': isOneLine,
          'code-snippet-simple-oneline': isSimpleOneLine,
        },
        className,
        'fs-mask',
      )}
    >
      {!noCopy && copyButton}
      <CodeSyntaxHighlighter
        className={classNames('sw-overflow-auto', {
          'sw-pr-24': !noCopy,
          'sw-flex': !noCopy,
        })}
        htmlAsString={renderSnippet}
        language={language}
        wrap={wrap}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background-color: ${cssVar('color-code-background-default')};
  border: ${cssVar('border-width-default')} solid ${cssVar('color-code-border-default')};

  border-radius: ${cssVar('border-radius-400', '0.5rem')};
  position: relative;
  margin-top: ${cssVar('dimension-space-100', '0.5rem')};
  margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};

  &.code-snippet-simple-oneline {
    margin-top: 0;
    margin-bottom: 0;
    border-radius: ${cssVar('border-radius-200', '0.25rem')};
  }
`;

const StyledClipboardButton = styled(ClipboardButton)`
  user-select: none;
  font: ${cssVar('typography-text-default-regular')};
  right: ${cssVar('dimension-space-300', '1.5rem')};
  top: ${cssVar('dimension-space-300', '1.5rem')};
  position: absolute;

  .code-snippet-highlighted-oneline & {
    bottom: ${cssVar('dimension-space-100', '0.5rem')};
  }
`;

const StyledSingleLineClipboardButton = styled(StyledClipboardButton)`
  bottom: ${cssVar('dimension-space-200', '1rem')};
  top: ${cssVar('dimension-space-200', '1rem')};
`;
