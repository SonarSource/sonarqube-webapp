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

import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

/**
 * Whether `scrollWidth` exceeds `clientWidth` for an observed element (ellipsis truncation active).
 * Recomputes when `contentKey` changes and on resize via `ResizeObserver`.
 */
export function useObserveElementTruncation(
  elementRef: RefObject<HTMLElement | null>,
  contentKey: string,
): boolean {
  const [isTruncated, setIsTruncated] = useState(false);

  const recomputeTruncation = useCallback(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }
    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [elementRef]);

  useLayoutEffect(() => {
    recomputeTruncation();
  }, [contentKey, recomputeTruncation]);

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(recomputeTruncation);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [elementRef, recomputeTruncation]);

  return isTruncated;
}
