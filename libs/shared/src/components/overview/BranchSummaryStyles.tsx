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

/**
 * Used to wrap StyleMeasuresCards.
 */
export const GridContainer = styled.div`
  --column-grids-gaps: ${cssVar('dimension-space-600')};
  --row-grids-gaps: ${cssVar('dimension-space-800')};
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  row-gap: var(--row-grids-gaps);
  column-gap: var(--column-grids-gaps);
`;

/**
 * Used for cards not at the bottom of the
 * card list. They provide an unbroken bottom
 * border, as well as a right border if they are not
 * the last card in a row.
 */
export const StyleMeasuresCard = styled.div`
  box-sizing: border-box;
  position: relative;

  &:not(:last-child):before {
    content: '';
    position: absolute;
    top: 0;
    right: calc(var(--column-grids-gaps) / -2);
    height: 100%;
    width: 1px;
    background: ${cssVar('color-border-weak')};
  }

  &:not(:last-child):after {
    content: '';
    position: absolute;
    bottom: calc(var(--row-grids-gaps) / -2);
    right: 0;
    left: 0px;
    height: 1px;
    width: 100vw;
    background: ${cssVar('color-border-weak')};
  }
`;

/**
 * Used for cards at the bottom of the card list.
 * These will not have a bottom border, only a right
 * border if they are not the last card in the row.
 */
export const StyleMeasuresCardRightBorder = styled.div`
  box-sizing: border-box;
  position: relative;

  &:not(:last-child):before {
    content: '';
    position: absolute;
    top: 0;
    right: calc(var(--column-grids-gaps) / -2);
    height: 100%;
    width: 1px;
    background: ${cssVar('color-border-weak')};
  }
`;

export const StyledConditionsCard = styled.div`
  box-sizing: border-box;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: calc(var(--column-grids-gaps) / -2);
    height: 100%;
    width: 1px;
    background: ${cssVar('color-border-weak')};
  }
`;
