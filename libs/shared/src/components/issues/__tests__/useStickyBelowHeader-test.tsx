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

import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useStickyBelowHeader } from '../useStickyBelowHeader';

function mockHeight(element: HTMLElement, height: number, top = 0) {
  jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ height, top } as DOMRect);
}

function Example({
  header,
  noSticky = false,
  topPadding,
}: Readonly<{ header: HTMLElement; noSticky?: boolean; topPadding?: number }>) {
  const headerRef = useRef<HTMLElement>(header);
  const stickyRef = useRef<HTMLDivElement>(null);
  const { top, isSticky } = useStickyBelowHeader(
    headerRef,
    noSticky ? undefined : stickyRef,
    topPadding,
  );

  return (
    <div ref={stickyRef}>
      <span>top: {top}</span>
      <span>sticky: {String(isSticky)}</span>
    </div>
  );
}

it('should offset the stuck element by the header height only by default', () => {
  const header = document.createElement('header');
  mockHeight(header, 60);

  render(<Example header={header} />);

  expect(screen.getByText('top: 60')).toBeInTheDocument();
  expect(screen.getByText('sticky: true')).toBeInTheDocument();
});

it('should add the top padding to the header height', () => {
  const header = document.createElement('header');
  mockHeight(header, 60);

  render(<Example header={header} topPadding={8} />);

  expect(screen.getByText('top: 68')).toBeInTheDocument();
});

it('should not be sticky when the element does not fit in the viewport', () => {
  const header = document.createElement('header');
  mockHeight(header, window.innerHeight);

  render(<Example header={header} />);

  expect(screen.getByText('sticky: false')).toBeInTheDocument();
});

it('should always be sticky when no sticky element is given', () => {
  const header = document.createElement('header');
  mockHeight(header, window.innerHeight);

  render(<Example header={header} noSticky />);

  expect(screen.getByText('top: ' + window.innerHeight)).toBeInTheDocument();
  expect(screen.getByText('sticky: true')).toBeInTheDocument();
});
