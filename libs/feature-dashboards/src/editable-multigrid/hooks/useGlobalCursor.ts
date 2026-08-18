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

import { useEffect, useRef } from 'react';

/**
 * Sets a global cursor that overrides ALL element cursors while `isActive` is true.
 * Uses a dynamic style element with `!important` to ensure child element cursors don't override.
 * Properly cleans up when `isActive` becomes false.
 *
 * Note: This works well for resize operations but cannot override HTML5 drag and drop cursors.
 *
 * @param isActive - Whether the cursor should be active
 * @param cursor - The CSS cursor value to set (e.g., 'grabbing', 'nwse-resize')
 */
export function useGlobalCursor(isActive: boolean, cursor: string): void {
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    // Create a style element that forces the cursor on ALL elements
    // Using !important ensures it overrides inline styles and specificity battles
    const styleElement = document.createElement('style');
    styleElement.dataset.globalCursor = 'true';
    styleElement.textContent = `*, *::before, *::after { cursor: ${cursor} !important; }`;
    document.head.appendChild(styleElement);
    styleElementRef.current = styleElement;

    // Clean up on unmount or when isActive becomes false
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [isActive, cursor]);
}
