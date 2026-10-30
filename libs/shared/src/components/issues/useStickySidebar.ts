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

import { cssVar } from '@sonarsource/echoes-react';
import { type RefObject, useLayoutEffect, useState } from 'react';
import { useResizeObserver } from '../../helpers/useResizeObserver';

interface StickySidebarPosition {
  /** Whether the sidebar's natural position plus its own height still fits in the viewport. */
  isSticky: boolean;
  /** Pixel offset to use as the sidebar's `top` when sticky */
  top: number;
}

/** Resolves a CSS length (possibly `calc()` / `var()`) to pixels by measuring a hidden probe. */
function resolveCssLength(length: string): number {
  const probe = document.createElement('div');
  probe.style.cssText = `position: absolute; visibility: hidden; height: ${length};`;
  document.body.appendChild(probe);
  const pixels = probe.getBoundingClientRect().height;
  probe.remove();

  return pixels;
}

const SIDEBAR_TOP_PADDING = resolveCssLength(`calc(${cssVar('dimension-space-200')})`);
const PAGE_HEADER_COLLAPSED_HEIGHT = resolveCssLength(
  `calc(${cssVar('layout-page-header-sizes-height-collapsed')})`,
);

/**
 * Keeps a sidebar sticky below a dynamically sized header, but only while the sidebar
 * (at its natural, unscrolled position) is short enough to fully fit in the viewport.
 * A sidebar taller than the remaining viewport would get stuck with its bottom cut off,
 * so it is left in normal flow instead.
 */
export function useStickySidebar(
  headerRef: RefObject<HTMLElement | null>,
  sidebarRef: RefObject<HTMLElement | null>,
): StickySidebarPosition {
  const [, headerHeight = 0] = useResizeObserver(headerRef);
  const [, sidebarHeight = 0] = useResizeObserver(sidebarRef);
  const [fitsViewport, setFitsViewport] = useState(true);
  const [top, setTop] = useState<number>(0);

  useLayoutEffect(() => {
    const updateFit = () => {
      if (!sidebarRef.current) {
        return;
      }

      // On short viewports the header's `scrollBehavior` switches to `collapse` (see
      // Echoes' `PageHeader`): once stuck, it shrinks to its collapsed target height instead
      const isHeaderCollapsed = headerRef.current?.dataset.scrollBehavior === 'collapse';
      const stuckHeaderHeight = isHeaderCollapsed
        ? PAGE_HEADER_COLLAPSED_HEIGHT
        : (headerRef.current?.getBoundingClientRect().height ?? 0);

      // Calculate the top offset for the stuck sidebar, including top padding to align with the tab content
      const stuckTop = SIDEBAR_TOP_PADDING + stuckHeaderHeight;
      setTop(stuckTop);

      // The header's viewport offset is the height of whatever sits above it (e.g. the global
      // navigation), which also eats into the viewport once the sidebar is stuck
      const heightAboveHeader = headerRef.current?.getBoundingClientRect().top ?? 0;

      // once stuck, the sidebar must fit entirely in the viewport below its stuck offset
      setFitsViewport(heightAboveHeader + stuckTop + sidebarHeight <= window.innerHeight);
    };

    updateFit();
    window.addEventListener('resize', updateFit);

    return () => {
      window.removeEventListener('resize', updateFit);
    };
  }, [headerRef, sidebarRef, sidebarHeight, headerHeight]);

  return { isSticky: fitsViewport, top };
}
