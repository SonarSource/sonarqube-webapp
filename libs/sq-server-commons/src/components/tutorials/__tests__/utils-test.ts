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
  mockAlmSettingsInstance,
  mockProjectBitbucketCloudBindingResponse,
  mockProjectGithubBindingResponse,
} from '../../../helpers/mocks/alm-settings';
import { mockUserToken } from '../../../helpers/mocks/token';
import { UserToken } from '../../../types/token';
import { BuildTools, OSs } from '../types';
import {
  buildBitbucketCloudLink,
  buildGithubLink,
  getUniqueTokenName,
  shouldShowArchSelector,
  shouldShowOsSelector,
} from '../utils';

describe('getUniqueTokenName', () => {
  const initialTokenName = 'Analyze "lightsaber"';

  it('should return the given name when the user has no token', () => {
    const userTokens: UserToken[] = [];

    expect(getUniqueTokenName(userTokens, initialTokenName)).toBe(initialTokenName);
  });

  it('should generate a token with the given name', () => {
    expect(
      getUniqueTokenName([mockUserToken({ name: initialTokenName })], 'Analyze "project"'),
    ).toBe('Analyze "project"');
  });

  it('should generate a unique token when the name already exists', () => {
    const userTokens = [
      mockUserToken({ name: initialTokenName }),
      mockUserToken({ name: `${initialTokenName} 1` }),
    ];

    expect(getUniqueTokenName(userTokens, initialTokenName)).toBe('Analyze "lightsaber" 2');
  });
});

describe('buildGithubLink', () => {
  const projectBinding = mockProjectGithubBindingResponse({
    repository: 'owner/reponame',
  });

  it('should work for GitHub Enterprise', () => {
    expect(
      buildGithubLink(
        mockAlmSettingsInstance({ url: 'https://github.company.com/api/v3' }),
        projectBinding,
      ),
    ).toBe('https://github.company.com/owner/reponame');
  });

  it('should work for github.com', () => {
    expect(
      buildGithubLink(mockAlmSettingsInstance({ url: 'http://api.github.com/' }), projectBinding),
    ).toBe('https://github.com/owner/reponame');
  });

  it('should return null if there is no url defined', () => {
    expect(buildGithubLink(mockAlmSettingsInstance({ url: undefined }), projectBinding)).toBeNull();
  });
});

describe('buildBitbucketCloudLink', () => {
  const projectBinding = mockProjectBitbucketCloudBindingResponse({
    repository: 'reponame',
  });

  it('should work', () => {
    expect(
      buildBitbucketCloudLink(
        mockAlmSettingsInstance({ url: 'http://bitbucket.org/workspace/' }),
        projectBinding,
      ),
    ).toBe('http://bitbucket.org/workspace/reponame');
  });

  it('should return null if there is no url defined', () => {
    expect(
      buildBitbucketCloudLink(mockAlmSettingsInstance({ url: undefined }), projectBinding),
    ).toBeNull();
    expect(
      buildBitbucketCloudLink(
        mockAlmSettingsInstance(),
        mockProjectBitbucketCloudBindingResponse({ repository: undefined }),
      ),
    ).toBeNull();
  });
});

describe('platform selectors with scanner automatic configuration', () => {
  it('needs the platform of the scanner even when the build tool does not', () => {
    expect(shouldShowOsSelector({ buildTool: BuildTools.Maven }, true)).toBe(false);
    expect(shouldShowOsSelector({ buildTool: BuildTools.Maven }, true, true)).toBe(true);
  });

  it('only needs the architecture of the scanner when the CI downloads it', () => {
    const config = { buildTool: BuildTools.Maven };

    expect(shouldShowArchSelector(OSs.Linux, config, true)).toBe(false);
    expect(shouldShowArchSelector(OSs.Linux, config, true, true)).toBe(true);
    expect(shouldShowArchSelector(OSs.MacOS, config, true, true)).toBe(true);
    expect(shouldShowArchSelector(OSs.Windows, config, true, true)).toBe(false);
  });

  it('does not need the architecture of the scanner on the local computer', () => {
    const config = { buildTool: BuildTools.Maven };

    expect(shouldShowArchSelector(OSs.Linux, config, false, true)).toBe(false);
    expect(shouldShowArchSelector(OSs.MacOS, config, false, true)).toBe(false);
    expect(shouldShowArchSelector(OSs.Windows, config, false, true)).toBe(false);
  });
});
