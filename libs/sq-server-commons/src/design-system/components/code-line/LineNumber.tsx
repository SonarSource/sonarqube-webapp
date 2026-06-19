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
import { DropdownMenu, DropdownMenuSide, cssVar } from '@sonarsource/echoes-react';
import { memo } from 'react';
import tw from 'twin.macro';
import { BareButton } from '../../sonar-aligned/components/buttons/BareButton';
import { LineMeta } from './LineStyles';

interface Props {
  ariaLabel: string;
  displayOptions: boolean;
  firstLineNumber: number;
  lineNumber: number;
  popup: React.ReactNode;
}

const FILE_TOP_THRESHOLD = 10;

function LineNumberFunc({
  firstLineNumber,
  lineNumber,
  popup,
  displayOptions,
  ariaLabel,
}: Readonly<Props>) {
  const hasLineNumber = Boolean(lineNumber);
  const isFileTop = lineNumber - FILE_TOP_THRESHOLD < firstLineNumber;

  if (!hasLineNumber) {
    return <LineMeta className="sw-pl-2" />;
  }

  return (
    <LineMeta className="sw-pl-2" data-line-number={lineNumber}>
      {displayOptions ? (
        <DropdownMenu
          aria-label={ariaLabel}
          id={`line-number-dropdown-${lineNumber}`}
          items={popup}
          side={isFileTop ? DropdownMenuSide.Bottom : DropdownMenuSide.Top}
        >
          <LineNumberStyled>{lineNumber}</LineNumberStyled>
        </DropdownMenu>
      ) : (
        lineNumber
      )}
    </LineMeta>
  );
}

export const LineNumber = memo(LineNumberFunc);

const LineNumberStyled = styled(BareButton)`
  ${tw`sw-px-1`}
  min-width: 24px;
  min-height: 24px;

  &:hover {
    color: ${cssVar('color-text-strong')};
  }
`;
