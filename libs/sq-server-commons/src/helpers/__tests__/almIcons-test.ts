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

import { Theme } from '@sonarsource/echoes-react';
import { AlmKeys } from '../../types/alm-settings';
import { almIconUrl, almKeyToIconKey, identityProviderIconUrl } from '../almIcons';
import { getBaseUrl } from '../system';

jest.mock('../system');

describe('almIconUrl', () => {
  it('should return the expected URL', () => {
    jest.mocked(getBaseUrl).mockReturnValueOnce('base');

    expect(almIconUrl(Theme.light, 'bitbucket')).toBe('base/images/alm/light/bitbucket.svg');
  });
});

describe('almKeyToIconKey', () => {
  it('should return the right icon key', () => {
    expect(almKeyToIconKey(AlmKeys.Azure)).toBe(AlmKeys.Azure.toString());
  });

  it('should map bitbucketcloud to bitbucket', () => {
    expect(almKeyToIconKey(AlmKeys.BitbucketCloud)).toBe(AlmKeys.BitbucketServer.toString());
    expect(almKeyToIconKey(AlmKeys.BitbucketServer)).toBe(AlmKeys.BitbucketServer.toString());
  });
});

describe('identityProviderIconUrl', () => {
  it.each([
    [Theme.light, 'github'],
    [Theme.dark, 'github'],
    [Theme.light, 'gitlab'],
    [Theme.dark, 'gitlab'],
    [Theme.light, 'bitbucket'],
    [Theme.dark, 'bitbucket'],
  ])('should return the %s icon of the %s provider', (theme, key) => {
    jest.mocked(getBaseUrl).mockReturnValueOnce('base');

    expect(identityProviderIconUrl(theme, { iconPath: `/images/alm/${key}.svg`, key })).toBe(
      `base/images/alm/${theme}/${key}.svg`,
    );
  });

  it('should prefix the base URL to the icon path of any other provider', () => {
    jest.mocked(getBaseUrl).mockReturnValueOnce('base');

    expect(identityProviderIconUrl(Theme.dark, { iconPath: '/images/saml.png', key: 'saml' })).toBe(
      'base/images/saml.png',
    );
  });

  it('should keep the absolute icon URL of any other provider', () => {
    expect(
      identityProviderIconUrl(Theme.dark, {
        iconPath: 'https://example.com/icon.png',
        key: 'custom',
      }),
    ).toBe('https://example.com/icon.png');
  });
});
