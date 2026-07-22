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

export default function CodeViewerStyle() {
  return <Global styles={codeViewerStyle()} />;
}

const codeViewerStyle = () => css`
  :root {
    --code-viewer-line-background: rgb(255, 255, 255);
    --code-viewer-line-background-hover: rgb(239, 242, 249);
    --code-viewer-line-border: rgb(221, 221, 221);
    --code-viewer-line-highlighted: rgb(225, 230, 243);

    --code-viewer-new-code-underline-background: rgba(159, 169, 237, 0.15);
    --code-viewer-new-code-underline-text: rgb(93, 108, 208);
    --code-viewer-covered-underline-background: rgba(18, 183, 106, 0.15);
    --code-viewer-covered-underline-text: rgb(2, 122, 72);
    --code-viewer-uncovered-underline-background: rgba(240, 68, 56, 0.15);
    --code-viewer-uncovered-underline-text: rgb(180, 35, 24);
    --code-viewer-partially-covered-underline-background: rgb(252, 245, 228);
    --code-viewer-partially-covered-underline-text: rgb(140, 94, 30);

    --code-viewer-duplication-marker-background: rgb(197, 205, 223);

    --code-viewer-location-highlighted-background: rgba(197, 205, 223, 0.6);
    --code-viewer-location-marker-background: rgb(254, 205, 202);
    --code-viewer-location-marker-background-selected: rgb(253, 162, 155);
    --code-viewer-location-marker-text: rgb(93, 29, 19);
    --code-viewer-location-selected-background: rgb(225, 230, 243);
    --code-viewer-legacy-issue-location-highlighted-background: rgb(225, 225, 242);
    --code-viewer-legacy-issue-location-selected-background: rgb(244, 177, 176);

    --code-viewer-ellipsis-background: rgb(255, 255, 255);
    --code-viewer-ellipsis-background-hover: rgb(239, 242, 249);

    --code-viewer-issue-location-background: rgba(253, 162, 155, 0.15);
    --code-viewer-issue-location-background-selected: rgba(253, 162, 155, 0.5);
    --code-viewer-issue-squiggle: rgb(253, 162, 155);
    --code-viewer-issue-pointer-border: rgb(255, 255, 255);
    --code-viewer-issue-message-tooltip-background: rgb(106, 117, 144);
    --code-viewer-issue-message-tooltip-text: rgb(252, 252, 253);
    --code-viewer-tooltip-highlight-text: rgb(197, 205, 223);
  }

  html[data-echoes-theme='dark'] {
    --code-viewer-line-background: rgb(42, 47, 64);
    --code-viewer-line-background-hover: rgb(29, 33, 47);
    --code-viewer-line-border: rgb(62, 67, 87);
    --code-viewer-line-highlighted: rgb(18, 20, 29);

    --code-viewer-new-code-underline-background: rgba(159, 169, 237, 0.1);
    --code-viewer-new-code-underline-text: rgb(189, 198, 255);
    --code-viewer-covered-underline-background: rgba(18, 183, 106, 0.15);
    --code-viewer-covered-underline-text: rgb(209, 250, 223);
    --code-viewer-uncovered-underline-background: rgba(240, 68, 56, 0.15);
    --code-viewer-uncovered-underline-text: rgb(254, 205, 202);
    --code-viewer-partially-covered-underline-background: rgba(250, 220, 121, 0.3);
    --code-viewer-partially-covered-underline-text: rgb(254, 245, 208);

    --code-viewer-duplication-marker-background: rgb(166, 173, 194);

    --code-viewer-location-highlighted-background: rgba(8, 9, 12, 0.6);
    --code-viewer-location-marker-background: rgb(254, 228, 226);
    --code-viewer-location-marker-background-selected: rgb(254, 205, 202);
    --code-viewer-location-marker-text: rgb(128, 27, 20);
    --code-viewer-location-selected-background: rgb(42, 47, 64);
    --code-viewer-legacy-issue-location-highlighted-background: rgb(225, 225, 242);
    --code-viewer-legacy-issue-location-selected-background: rgb(244, 177, 176);

    --code-viewer-ellipsis-background: rgb(42, 47, 64);
    --code-viewer-ellipsis-background-hover: rgb(62, 67, 87);

    --code-viewer-issue-location-background: rgba(253, 162, 155, 0.15);
    --code-viewer-issue-location-background-selected: rgba(253, 162, 155, 0.3);
    --code-viewer-issue-squiggle: rgb(253, 162, 155);
    --code-viewer-issue-pointer-border: rgb(42, 47, 64);
    --code-viewer-issue-message-tooltip-background: rgb(18, 20, 29);
    --code-viewer-issue-message-tooltip-text: rgb(252, 252, 253);
    --code-viewer-tooltip-highlight-text: rgb(62, 67, 87);
  }
`;
