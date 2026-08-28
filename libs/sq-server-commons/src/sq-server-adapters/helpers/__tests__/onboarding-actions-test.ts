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

import { OnboardingAlm, OnboardingDevopsPlatform } from '~shared/types/onboarding';
import { getDevopsPlatformWebUrl, getImportRepositoriesUrl } from '../onboarding-actions';

describe('getImportRepositoriesUrl', () => {
  it.each([
    [OnboardingDevopsPlatform.AzureDevops, 'azure'],
    [OnboardingDevopsPlatform.Bitbucket, 'bitbucket'],
    [OnboardingDevopsPlatform.BitbucketCloud, 'bitbucketcloud'],
    [OnboardingDevopsPlatform.Github, 'github'],
    [OnboardingDevopsPlatform.Gitlab, 'gitlab'],
  ])(
    'sends %s to the creation flow under the mode name that page expects',
    (alm: OnboardingAlm, mode: string) => {
      // The creation page keys platforms by `CreateProjectModes`, which is not the `OnboardingAlm`
      // value — `azure_devops` and `bitbucket_cloud` would both land on an unknown mode.
      expect(getImportRepositoriesUrl(alm, 'setting-1')).toEqual({
        pathname: '/projects/create',
        search: '?dopSetting=setting-1&mode=' + mode,
      });
    },
  );
});

describe('getDevopsPlatformWebUrl', () => {
  it.each([
    ['github.com', OnboardingDevopsPlatform.Github, 'https://api.github.com', 'https://github.com'],
    [
      'GitHub Enterprise',
      OnboardingDevopsPlatform.Github,
      'https://ghe.acme.com/api/v3',
      'https://ghe.acme.com',
    ],
    ['GitLab', OnboardingDevopsPlatform.Gitlab, 'https://gitlab.com/api/v4', 'https://gitlab.com'],
    [
      'a trailing slash',
      OnboardingDevopsPlatform.Gitlab,
      'https://gitlab.acme.com/',
      'https://gitlab.acme.com',
    ],
    [
      'an address that is already a web one',
      OnboardingDevopsPlatform.AzureDevops,
      'https://dev.azure.com/acme',
      'https://dev.azure.com/acme',
    ],
  ])('derives the web address of %s', (_, alm: OnboardingAlm, url: string, expected: string) => {
    expect(getDevopsPlatformWebUrl(alm, url)).toBe(expected);
  });

  it('leaves a self-hosted instance that genuinely lives on an api host alone', () => {
    // Only GitHub fronts its API on an `api.` subdomain, so the prefix is not stripped elsewhere.
    expect(getDevopsPlatformWebUrl(OnboardingDevopsPlatform.Gitlab, 'https://api.acme.com')).toBe(
      'https://api.acme.com',
    );
  });

  it.each([
    ['nothing is reported', undefined],
    ['the value is empty', ''],
    ['the value is not a web address', 'not a url'],
  ])('offers no destination when %s', (_, url) => {
    expect(getDevopsPlatformWebUrl(OnboardingDevopsPlatform.BitbucketCloud, url)).toBeUndefined();
  });
});
