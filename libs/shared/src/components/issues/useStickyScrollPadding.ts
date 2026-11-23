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

import { useLayoutEffect, useState } from 'react';

/** Custom properties summed by `ProjectPageGrid` into the page's `scroll-padding-top`. */
export const STICKY_PAGE_HEADER_HEIGHT_VAR = '--sw-sticky-page-header-height';
export const STICKY_FILE_HEADER_HEIGHT_VAR = '--sw-sticky-file-header-height';

/**
 * Declares the height (in px) of a sticky element that covers the top of the page's scroll
 * container, so that keyboard focus scrolls elements below it instead of behind it (WCAG 2.4.11).
 *
 * `scroll-padding-top` can only be set on the scroll container, which is not part of the issue
 * components. The value is published as a custom property on the root element, which the
 * container's styles consume, and removed again when the sticky element goes away.
 */
export function useStickyScrollPadding(property: string, height: number) {
  useLayoutEffect(() => {
    document.documentElement.style.setProperty(property, `${height}px`);

    return () => {
      document.documentElement.style.removeProperty(property);
    };
  }, [property, height]);
}

/** Same as `useStickyScrollPadding` for an element that may mount late, and whose height may change. */
export function useStickyElementScrollPadding(property: string, element: HTMLElement | null) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      setHeight(element.offsetHeight);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  useStickyScrollPadding(property, element ? height : 0);
}
