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

import { lightTheme } from '../../theme';
import * as ThemeHelper from '../theme';

const props = {
  color: 'rgb(0,0,0)',
};

describe('getProp', () => {
  it('should work', () => {
    expect(ThemeHelper.getProp('color')(props)).toEqual('rgb(0,0,0)');
  });
});

describe('themeShadow', () => {
  it('should work for light theme', () => {
    expect(ThemeHelper.themeShadow('xs')({ theme: lightTheme })).toEqual(
      '0px 1px 2px 0px rgba(29,33,47,0.05)',
    );
  });
  it('should allow to override the color of the shadow', () => {
    expect(ThemeHelper.themeShadow('xs', 'backgroundPrimary')({ theme: lightTheme })).toEqual(
      '0px 1px 2px 0px rgba(252,252,253,0.05)',
    );
    expect(ThemeHelper.themeShadow('xs', 'transparent')({ theme: lightTheme })).toEqual(
      '0px 1px 2px 0px transparent',
    );
  });
  it('should allow to override the opacity of the shadow', () => {
    expect(ThemeHelper.themeShadow('xs', 'backgroundPrimary', 0.8)({ theme: lightTheme })).toEqual(
      '0px 1px 2px 0px rgba(252,252,253,0.8)',
    );
  });
  it('should allow to pass a CSS prop as color name', () => {
    expect(ThemeHelper.themeShadow('xs', 'var(--shadowColor)')({ theme: lightTheme })).toEqual(
      '0px 1px 2px 0px var(--shadowColor)',
    );
  });
});
