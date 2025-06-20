/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { screen } from '@testing-library/react';
import { searchRules } from '~sq-server-commons/api/rules';

import { mockLanguage, mockPaging, mockQualityProfile } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { SearchRulesResponse } from '~sq-server-commons/types/coding-rules';
import { MetaQualityProfiles } from '../MetaQualityProfiles';

jest.mock('~sq-server-commons/api/rules', () => {
  return {
    searchRules: jest.fn().mockResolvedValue({
      total: 10,
    }),
  };
});
jest.mock('~shared/api/languages', () => ({
  getLanguages: jest.fn().mockResolvedValue({
    languages: {
      css: mockLanguage(),
    },
  }),
}));

it('should render correctly', async () => {
  const totals: Record<string, number> = {
    js: 0,
    ts: 10,
    css: 0,
  };
  jest
    .mocked(searchRules)
    .mockImplementation(({ qprofile }: { qprofile: string }): Promise<SearchRulesResponse> => {
      return Promise.resolve({
        rules: [],
        paging: mockPaging({
          total: totals[qprofile],
        }),
      });
    });

  renderMetaQualityprofiles();

  await expect(await screen.findByText('javascript')).toHaveATooltipWithContent(
    'overview.deleted_profile.javascript',
  );
  await expect(await screen.findByText('deprecated')).toHaveATooltipWithContent(
    'overview.deprecated_profile.10',
  );
});

function renderMetaQualityprofiles(
  overrides: Partial<Parameters<typeof MetaQualityProfiles>[0]> = {},
) {
  return renderComponent(
    <MetaQualityProfiles
      profiles={[
        { ...mockQualityProfile({ key: 'js', name: 'javascript' }), deleted: true },
        { ...mockQualityProfile({ key: 'ts', name: 'typescript' }), deleted: false },
        {
          ...mockQualityProfile({
            key: 'css',
            name: 'style',
            language: 'css',
            languageName: 'CSS',
          }),
          deleted: false,
        },
      ]}
      {...overrides}
    />,
  );
}
