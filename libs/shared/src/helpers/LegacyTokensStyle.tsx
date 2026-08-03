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

/**
 * CSS custom properties for theme tokens that have no direct Echoes equivalent.
 * These are injected on :root so they can be consumed with var() wherever themeColor()
 * used to be called.
 *
 * Tokens covered here:
 *   - alm.*          — third-party brand colours (Azure, Bitbucket, GitHub, GitLab)
 *   - upgrade*       — upgrade/upsell marketing colours (pink, violet)
 *   - workSpaceViewerShadow — box-shadow colour with no Echoes shadow token
 *
 * ===========================================
 * ! DO NOT ADD TO IT !
 *
 * If you need themed variables, create a dedicated domain-oriented file,
 *  like libs/shared/src/components/code-viewer/CodeViewerStyle.tsx
 *
 */
export function LegacyTokensStyle() {
  return <Global styles={legacyTokensStyle()} />;
}

const legacyTokensStyle = () => css`
  :root {
    /* ALM brand colours — no Echoes equivalent, static across themes */
    --legacy-alm-azure: rgb(0, 120, 215);
    --legacy-alm-bitbucket: rgb(0, 82, 204);
    --legacy-alm-github: rgb(225, 228, 232);
    --legacy-alm-gitlab: rgb(41, 41, 97);

    /* Upgrade / upsell marketing colours */
    --legacy-upgrade-pink: rgb(212, 42, 161);
    --legacy-upgrade-background: rgb(251, 247, 255);
    --legacy-upgrade-border: rgba(147, 74, 211, 0.1);
    --legacy-upgrade-text-high: rgb(147, 74, 211);
    --legacy-upgrade-blend-zero: rgb(255, 255, 255);

    /* Upgrade gradient — used in background, no Echoes gradient token */
    --legacy-upgrade-gradient: linear-gradient(90deg, rgb(212, 42, 161), rgb(126, 96, 226));

    /* Workspace shadow — used in box-shadow, no Echoes shadow token */
    --legacy-workspace-viewer-shadow: rgba(29, 33, 47, 0.25);
  }

  html[data-echoes-theme='dark'] {
    --legacy-upgrade-gradient: linear-gradient(90deg, rgb(255, 132, 218), rgb(183, 166, 255));

    --legacy-upgrade-pink: rgb(255, 132, 218);
    --legacy-upgrade-background: rgb(28, 20, 37);
    --legacy-upgrade-border: rgba(211, 156, 255, 0.1);
    --legacy-upgrade-text-high: rgb(211, 156, 255);
    --legacy-upgrade-blend-zero: rgb(0, 0, 0);

    --legacy-workspace-viewer-shadow: rgba(8, 9, 12, 0.25);
  }
`;
