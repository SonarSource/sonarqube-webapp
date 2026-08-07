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

import { css, Global } from '@emotion/react';
import { cssVar, Theme } from '@sonarsource/echoes-react';
import tw from 'twin.macro';
import { useCurrentTheme } from '../helpers/css';

export default function ScrollbarStyle() {
  const theme = useCurrentTheme();

  return <Global styles={scrollbarStyle({ theme })} />;
}

/*
 * OS             - Engine    - Status
 * Windows        - Webkit    - Working styling
 * Windows        - Firefox   - Working styling
 * MacOS          - Webkit    - Working styling
 * MacOS          - Firefox   - Working styling
 * Ubuntu Gnome   - Webkit    - Working styling
 * Ubuntu Gnome   - Firefox   - Working styling
 *
 * Fallback to browser color-scheme if scrollbar-color and webkit-scrollbar are not supported
 */

export const scrollbarStyle = (props: { theme: `${Theme}` }) => css`
  :root {
    color-scheme: ${props.theme};
    scrollbar-color: ${cssVar('color-background-neutral-bolder-default')}
      ${cssVar('color-surface-default')};
  }

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-thumb {
    ${tw`sw-rounded-pill`};
    background: ${cssVar('color-background-neutral-bolder-default')};
    background-clip: content-box;
    border: 3px solid transparent;
  }

  ::-webkit-scrollbar-track-piece {
    background: ${cssVar('color-surface-default')};
  }
`;
