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

import {
  TRANSPARENT_GIF_BASE64,
  type getCspSafeEmptyImage as GetCspSafeEmptyImageFn,
} from '../emptyDragPreview';

type EmptyDragPreviewModule = { getCspSafeEmptyImage: typeof GetCspSafeEmptyImageFn };

function importFreshModule(): EmptyDragPreviewModule {
  let mod!: EmptyDragPreviewModule;
  jest.isolateModules(() => {
    mod = jest.requireActual<EmptyDragPreviewModule>('../emptyDragPreview');
  });
  return mod;
}

describe('getCspSafeEmptyImage', () => {
  afterEach(() => {
    // URL.createObjectURL doesn't exist in jsdom by default; clean up any mock
    Reflect.deleteProperty(URL, 'createObjectURL');
  });

  it('should create an image with a blob URL when createObjectURL is available', () => {
    const fakeUrl = 'blob:http://localhost/fake-blob-url';
    const mockCreateObjectURL = jest.fn().mockReturnValue(fakeUrl);
    URL.createObjectURL = mockCreateObjectURL;

    const { getCspSafeEmptyImage } = importFreshModule();
    const image = getCspSafeEmptyImage();

    expect(image).toBeInstanceOf(HTMLImageElement);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(image.src).toBe(fakeUrl);
  });

  it('should fall back to a data URI when createObjectURL is not available', () => {
    const { getCspSafeEmptyImage } = importFreshModule();
    const image = getCspSafeEmptyImage();

    expect(image).toBeInstanceOf(HTMLImageElement);
    expect(image.src).toBe(`data:image/gif;base64,${TRANSPARENT_GIF_BASE64}`);
  });

  it('should return the same cached image on subsequent calls', () => {
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/fake');
    URL.createObjectURL = mockCreateObjectURL;

    const { getCspSafeEmptyImage } = importFreshModule();
    const first = getCspSafeEmptyImage();
    const second = getCspSafeEmptyImage();

    expect(first).toBe(second);
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
  });
});
