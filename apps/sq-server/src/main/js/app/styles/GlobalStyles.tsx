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

import { Global, css, useTheme } from '@emotion/react';
import twDefaultTheme from 'tailwindcss/defaultTheme';
import { themeColor } from '~design-system';

export function GlobalStyles() {
  const theme = useTheme();

  return (
    <Global
      styles={css`
        body {
          font-family: Inter, ${twDefaultTheme.fontFamily.sans.join(', ')};
          font-size: 0.875rem;
          line-height: 1.25rem;
          font-weight: 400;
          background:
            radial-gradient(circle at top left, rgba(217, 38, 37, 0.08), transparent 24%),
            linear-gradient(180deg, rgba(255, 247, 246, 0.9), rgba(255, 255, 255, 1) 22%);

          color: ${themeColor('pageContent')({ theme })};
        }

        a {
          outline: none;
          text-decoration: none;
          color: ${themeColor('pageContent')({ theme })};
        }

        ol,
        ul {
          padding-left: 0;
          list-style: none;
        }

        :root {
          --topsec-primary: rgb(217, 38, 37);
          --topsec-primary-dark: rgb(155, 25, 27);
          --topsec-primary-soft: rgba(217, 38, 37, 0.12);
          --topsec-border-soft: rgba(217, 38, 37, 0.2);
        }

        .topsec-brand-logo {
          min-width: 2.5rem;
          min-height: 2.5rem;
          padding: 0.375rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 242, 241, 1));
          box-shadow:
            0 10px 30px rgba(217, 38, 37, 0.12),
            inset 0 0 0 1px rgba(217, 38, 37, 0.12);
        }

        #it__global-navbar-menu {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .topsec-global-nav-item {
          border: 1px solid var(--topsec-border-soft);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
          color: rgb(127, 29, 29);
          transition:
            background-color 160ms ease,
            border-color 160ms ease,
            color 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .topsec-global-nav-item:hover,
        .topsec-global-nav-item:focus-visible {
          background: var(--topsec-primary-soft);
          border-color: rgba(217, 38, 37, 0.36);
          color: var(--topsec-primary-dark);
          transform: translateY(-1px);
        }

        .topsec-global-nav-item[aria-current='page'],
        .topsec-global-nav-item[data-active='true'] {
          background: linear-gradient(135deg, rgb(217, 38, 37), rgb(188, 28, 28));
          border-color: rgb(188, 28, 28);
          box-shadow: 0 10px 24px rgba(217, 38, 37, 0.24);
          color: rgb(255, 255, 255);
        }
      `}
    />
  );
}
