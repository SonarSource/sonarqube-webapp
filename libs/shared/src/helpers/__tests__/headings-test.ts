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

import { enforceMinHeadingLevel } from '../headings';

function setup(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

function levels(container: Element) {
  return Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6'), (h) =>
    h.getAttribute('aria-level'),
  );
}

it('shifts headings so the shallowest one reaches the minimum level, keeping relative depth', () => {
  const container = setup('<h3>a</h3><h4>b</h4><h3>c</h3>');

  enforceMinHeadingLevel(container, 4);

  expect(levels(container)).toEqual(['4', '5', '4']);
});

it('clamps at h6 and keeps the heading elements untouched', () => {
  const container = setup('<h2>a</h2><h3>b</h3><h4>c</h4>');

  enforceMinHeadingLevel(container, 5);

  expect(levels(container)).toEqual(['5', '6', '6']);
  expect(container.querySelectorAll('h2,h3,h4')).toHaveLength(3);
});

it('is idempotent', () => {
  const container = setup('<h3>a</h3><h4>b</h4>');

  enforceMinHeadingLevel(container, 4);
  enforceMinHeadingLevel(container, 4);

  expect(levels(container)).toEqual(['4', '5']);
});

it('does nothing when headings are already deep enough, without headings, or without a level', () => {
  const deep = setup('<h5>a</h5>');
  enforceMinHeadingLevel(deep, 4);
  const empty = setup('<p>text</p>');
  enforceMinHeadingLevel(empty, 4);
  const noLevel = setup('<h2>a</h2>');
  enforceMinHeadingLevel(noLevel, undefined);
  enforceMinHeadingLevel(null, 4);

  expect(levels(deep)).toEqual([null]);
  expect(levels(noLevel)).toEqual([null]);
});
