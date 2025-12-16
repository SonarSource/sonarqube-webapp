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

import { ComponentProps } from 'react';
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { mockBranch } from '~sq-server-commons/helpers/mocks/branch-like';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import {
  mockLoggedInUser,
  mockMeasureEnhanced,
  mockMetric,
} from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { useProjectContainsAiCodeQuery } from '~sq-server-commons/queries/ai-code-assurance';
import { Feature } from '~sq-server-commons/types/features';
import MetaContentHeader from '../MetaContentHeader';

jest.mock('~sq-server-commons/queries/ai-code-assurance', () => ({
  useProjectContainsAiCodeQuery: jest.fn().mockReturnValue({ data: false }),
}));

jest.mock('~sq-server-commons/queries/devops-integration', () => ({
  useProjectBindingQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }),
}));

const ui = {
  aiCodeBadge: byRole('button', { name: /contains_ai_code/ }),
  nclocText: byText('1short_number_suffix.k metric.ncloc.name'),
  lastAnalysisText: byText('overview.last_analysis_x'),
  versionText: byText('version_x.1.0.0'),
  unboundBadge: byRole('button', { name: 'project_navigation.binding_status.not_bound' }),
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('should render basic project information', () => {
  renderMetaContentHeader(
    {
      branch: mockBranch({ analysisDate: '2023-01-15' }),
      component: mockComponent({ version: '1.0.0' }),
    },
    [Feature.BranchSupport],
  );

  expect(ui.nclocText.get()).toBeInTheDocument();
  expect(ui.versionText.get()).toBeInTheDocument();
  expect(ui.lastAnalysisText.get()).toBeInTheDocument();
  expect(ui.unboundBadge.get()).toBeInTheDocument();
});

it('should not render info that are not available', () => {
  renderMetaContentHeader(
    {
      branch: mockBranch({ analysisDate: undefined }),
      component: mockComponent({ version: undefined }),
      measures: [],
    },
    [Feature.AiCodeAssurance],
  );

  expect(ui.nclocText.query()).not.toBeInTheDocument();
  expect(ui.versionText.query()).not.toBeInTheDocument();
  expect(ui.lastAnalysisText.query()).not.toBeInTheDocument();
  expect(ui.aiCodeBadge.query()).not.toBeInTheDocument();
});

it('should render AI code badge when project contains AI code', () => {
  jest.mocked(useProjectContainsAiCodeQuery).mockReturnValueOnce({ data: true });

  renderMetaContentHeader({ component: mockComponent({ qualifier: ComponentQualifier.Project }) }, [
    Feature.AiCodeAssurance,
  ]);

  expect(ui.aiCodeBadge.get()).toBeInTheDocument();
});

it('should not render AI code badge when AI code assurance feature is not available', () => {
  const component = mockComponent({ qualifier: ComponentQualifier.Project });
  renderMetaContentHeader({ component }, []);

  expect(useProjectContainsAiCodeQuery).toHaveBeenCalledWith(
    { project: component },
    { enabled: false },
  );
});

function renderMetaContentHeader(
  overrides: Partial<ComponentProps<typeof MetaContentHeader>> = {},
  features: Feature[] = [],
) {
  return renderComponent(
    <MetaContentHeader
      component={mockComponent()}
      measures={[
        mockMeasureEnhanced({
          metric: mockMetric({ key: MetricKey.ncloc, type: MetricType.ShortInteger }),
          value: '1000',
        }),
      ]}
      {...overrides}
    />,
    '',
    { currentUser: mockLoggedInUser(), featureList: features },
  );
}
