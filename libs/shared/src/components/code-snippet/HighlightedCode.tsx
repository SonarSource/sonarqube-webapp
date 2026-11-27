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
import classNames from 'classnames';
import { SafeHTMLInjection, SanitizeLevel } from '../../helpers/sanitize';
import { syntaxHighlightingStyles } from './syntax-highlighting-styles';

export interface HighlightedCodeProps {
  className?: string;
  htmlAsString: string;
  isSimpleOneLine?: boolean;
  sanitizeLevel?: SanitizeLevel;
  wrap?: boolean | 'words';
}

export function HighlightedCode({
  className,
  htmlAsString,
  isSimpleOneLine = false,
  sanitizeLevel = SanitizeLevel.FORBID_STYLE,
  wrap,
}: Readonly<HighlightedCodeProps>) {
  const StyledContainer = isSimpleOneLine ? StyledSpan : StyledDiv;

  return (
    <SafeHTMLInjection htmlAsString={htmlAsString} sanitizeLevel={sanitizeLevel}>
      <StyledContainer
        className={classNames(`hljs ${className ?? ''}`, {
          'code-wrap': wrap,
          'simple-one-line': isSimpleOneLine,
          'wrap-words': wrap === 'words',
        })}
      />
    </SafeHTMLInjection>
  );
}

const StyledDiv = styled.div`
  ${syntaxHighlightingStyles};
`;

const StyledSpan = StyledDiv.withComponent('span');
