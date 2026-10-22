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

import { cssVar, Theme } from '@sonarsource/echoes-react';
import { renderWithContext } from '../../helpers/test-utils';
import ScrollbarStyle, { scrollbarStyle } from '../ScrollbarStyle';

it('should not render and have correct styles', () => {
  const { container } = setup();
  expect(container).toBeEmptyDOMElement();

  const result = scrollbarStyle({ theme: Theme.light });
  expect(result.styles).toContain('color-scheme:light');
  expect(result.styles).toContain(
    `scrollbar-color:${cssVar('color-background-neutral-bolder-default')} ${cssVar('color-surface-default')}`,
  );
  expect(result.styles).toContain('::-webkit-scrollbar{width:12px;}');
  expect(result.styles).toContain(`border-radius:${cssVar('border-radius-full', '625rem')}`);
  expect(result.styles).toContain(
    `background:${cssVar('color-background-neutral-bolder-default')}`,
  );
  expect(result.styles).toContain('background-clip:content-box');
  expect(result.styles).toContain('border:3px solid transparent');
  expect(result.styles).toContain(
    `::-webkit-scrollbar-track-piece{background:${cssVar('color-surface-default')};}`,
  );
});

function setup() {
  return renderWithContext(<ScrollbarStyle />);
}
