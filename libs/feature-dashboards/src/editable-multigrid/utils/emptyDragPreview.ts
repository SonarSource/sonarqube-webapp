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

/**
 * CSP-safe alternative to `getEmptyImage()` from `react-dnd-html5-backend`.
 *
 * The original `getEmptyImage()` uses a `data:` URI which is blocked by
 * Content-Security-Policy directives that don't include `data:` in `img-src`.
 * This utility creates an identical 1x1 transparent GIF using a `blob:` URL instead,
 * which is allowed by CSP policies that include `blob:` in `img-src`.
 */

export const TRANSPARENT_GIF_BASE64 = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// 1x1 transparent GIF bytes (same image as react-dnd-html5-backend's getEmptyImage)
const TRANSPARENT_GIF_BYTES = Uint8Array.from(
  atob(TRANSPARENT_GIF_BASE64),
  (c) => c.codePointAt(0) ?? 0,
);

let emptyImage: HTMLImageElement | null = null;

export function getCspSafeEmptyImage(): HTMLImageElement {
  if (!emptyImage) {
    emptyImage = new Image();

    if (typeof URL.createObjectURL === 'function') {
      const blob = new Blob([TRANSPARENT_GIF_BYTES], { type: 'image/gif' });
      emptyImage.src = URL.createObjectURL(blob);
    } else {
      // Fallback for environments without createObjectURL (e.g. jsdom in tests)
      emptyImage.src = `data:image/gif;base64,${TRANSPARENT_GIF_BASE64}`;
    }
  }
  return emptyImage;
}
