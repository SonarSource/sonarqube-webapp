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

import { fireEvent, render, screen } from '@testing-library/react';
import { getBaseUrl } from '~adapters/helpers/system';
import { Image, type ImageProps } from '../Image';

jest.mock('~adapters/helpers/system', () => ({
  getBaseUrl: jest.fn(() => ''),
}));

beforeEach(() => {
  jest.mocked(getBaseUrl).mockReturnValue('');
});

describe('Image', () => {
  it('renders a source', () => {
    setup({ src: 'foo.png' });

    expect(screen.getByRole('img').outerHTML).toEqual('<img src="foo.png">');
  });

  it('renders a source and alternative text', () => {
    setup({ alt: 'bar', src: 'foo.png' });

    expect(screen.getByRole('img').outerHTML).toEqual('<img alt="bar" src="foo.png">');
  });

  it('preserves a leading slash with an empty base URL', () => {
    setup({ src: '/foo.png' });

    expect(screen.getByRole('img').outerHTML).toEqual('<img src="/foo.png">');
  });

  it.each([
    ['foo.png', '/sonarqube/foo.png'],
    ['/foo.png', '/sonarqube/foo.png'],
    ['images//foo.png', '/sonarqube/images/foo.png'],
    ['/sonarqube/foo.png', '/sonarqube/foo.png'],
    ['https://example.com//foo.png', 'https://example.com//foo.png'],
    ['http://example.com/foo.png', 'http://example.com/foo.png'],
    ['data:image/png;base64,cG5n', 'data:image/png;base64,cG5n'],
  ])('resolves %s with a deployment context path', (src, expected) => {
    jest.mocked(getBaseUrl).mockReturnValue('/sonarqube');

    setup({ alt: 'Illustration', src });

    expect(screen.getByRole('img', { name: 'Illustration' })).toHaveAttribute('src', expected);
  });

  it('leaves an absent source unset with a deployment context path', () => {
    jest.mocked(getBaseUrl).mockReturnValue('/sonarqube');

    setup({ alt: 'Illustration' });

    expect(screen.getByRole('img', { name: 'Illustration' })).not.toHaveAttribute('src');
  });

  it('forwards native attributes and load events', () => {
    const onLoad = jest.fn();

    setup({
      alt: 'Illustration',
      className: 'illustration',
      height: 24,
      loading: 'lazy',
      onLoad,
      src: 'foo.png',
      width: 48,
    });

    const image = screen.getByRole('img', { name: 'Illustration' });

    expect(image).toHaveClass('illustration');
    expect(image).toHaveAttribute('height', '24');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width', '48');

    fireEvent.load(image);

    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});

function setup(props: Readonly<ImageProps>) {
  return render(<Image {...props} />);
}
