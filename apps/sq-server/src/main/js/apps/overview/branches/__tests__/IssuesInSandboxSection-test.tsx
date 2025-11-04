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

import { ComponentContext } from '~adapters/helpers/test-utils';
import {
  BranchesServiceDefaultDataset,
  BranchesServiceMock,
} from '~shared/api/mocks/services/BranchesServiceMock';
import { byRole, byText } from '~shared/helpers/testSelector';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import IssuesServiceMock from '~sq-server-commons/api/mocks/IssuesServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import { SOFTWARE_QUALITIES } from '~sq-server-commons/helpers/constants';
import { getIssueTypeBySoftwareQuality } from '~sq-server-commons/helpers/issues';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import {
  mockMeasureEnhanced,
  mockMetric,
  mockRawIssue,
} from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { ComponentPropsType } from '~sq-server-commons/helpers/testUtils';
import { IssueSeverity, IssueStatus, IssueType } from '~sq-server-commons/types/issues';
import { Mode } from '~sq-server-commons/types/mode';
import { Component } from '~sq-server-commons/types/types';
import { IssuesInSandboxSection } from '../issues-sandbox/IssuesInSandboxSection';

const ui = {
  sandboxSectionTitle: () => byText('metric.issues_in_sandbox.short_name'),
  sandboxDescription: () => byText('metric.issues_in_sandbox.description'),
  learnMoreLink: () => byRole('link', { name: /learn_more_in_doc/ }),
  blockerBadge: () => byText('issue.sandbox.includes_blockers'),
  qualityMeasureLink: (quality: SoftwareQuality | IssueType, count = '0') =>
    byRole('link', {
      name: SOFTWARE_QUALITIES.includes(quality as SoftwareQuality)
        ? `issue.sandbox.see_x_sandboxed_issues.${count}.software_quality.${quality}.true`
        : `issue.sandbox.see_x_sandboxed_issues.${count}.issue.type.${quality}.plural.true`,
    }),
  qualityMeasureText: (quality: string) => byText(quality),
};

const modeHandler = new ModeServiceMock();
const branchesHandler = new BranchesServiceMock(BranchesServiceDefaultDataset);
const issuesHandler = new IssuesServiceMock();

beforeEach(() => {
  modeHandler.setMode(Mode.MQR);

  // Setup sandbox issues
  const sandboxIssues = [
    {
      issue: mockRawIssue(false, {
        key: 'sandbox-issue-1',
        component: 'foo',
        status: IssueStatus.InSandbox,
        impacts: [
          { softwareQuality: SoftwareQuality.Reliability, severity: SoftwareImpactSeverity.High },
        ],
        type: IssueType.Bug,
        severity: IssueSeverity.Major,
      }),
      snippets: {},
    },
    {
      issue: mockRawIssue(false, {
        key: 'sandbox-issue-2',
        component: 'foo',
        status: IssueStatus.InSandbox,
        impacts: [
          { softwareQuality: SoftwareQuality.Security, severity: SoftwareImpactSeverity.Blocker },
        ],
        type: IssueType.Vulnerability,
        severity: IssueSeverity.Blocker,
      }),
      snippets: {},
    },
    {
      issue: mockRawIssue(false, {
        key: 'sandbox-issue-3',
        component: 'foo',
        status: IssueStatus.InSandbox,
        impacts: [
          {
            softwareQuality: SoftwareQuality.Maintainability,
            severity: SoftwareImpactSeverity.Medium,
          },
        ],
        type: IssueType.CodeSmell,
        severity: IssueSeverity.Minor,
      }),
      snippets: {},
    },
    {
      issue: mockRawIssue(false, {
        key: 'sandbox-issue-4',
        component: 'foo',
        status: IssueStatus.InSandbox,
        impacts: [
          { softwareQuality: SoftwareQuality.Reliability, severity: SoftwareImpactSeverity.Medium },
        ],
        type: IssueType.Bug,
        severity: IssueSeverity.Major,
      }),
      snippets: {},
    },
  ];
  issuesHandler.setIssueList(sandboxIssues);
});

afterEach(() => {
  modeHandler.reset();
  issuesHandler.reset();
  branchesHandler.reset();
});

it.each([true, false])('should not render when there is no measure', (inNewCodePeriod) => {
  renderIssuesInSandboxSection({
    measures: [],
    inNewCodePeriod,
  });

  expect(ui.sandboxSectionTitle().query()).not.toBeInTheDocument();
});

it('should not render when there are no issues in sandbox', () => {
  renderIssuesInSandboxSection({
    measures: [
      mockMeasureEnhanced({
        metric: mockMetric({ key: MetricKey.issues_in_sandbox }),
        value: '0',
      }),
    ],
  });

  expect(ui.sandboxSectionTitle().query()).not.toBeInTheDocument();
});

it('should not render when component needs issue sync', () => {
  renderIssuesInSandboxSection(
    {
      measures: DEFAULT_MEASURES,
    },
    mockComponent({
      key: 'foo',
      name: 'Foo',
      needIssueSync: true,
    }),
  );

  expect(ui.sandboxSectionTitle().query()).not.toBeInTheDocument();
});

it('should render correctly for overall code', async () => {
  renderIssuesInSandboxSection();
  expect(await ui.sandboxSectionTitle().find()).toBeInTheDocument();
  expect(ui.sandboxDescription().get()).toBeInTheDocument();
  expect(ui.learnMoreLink().get()).toBeInTheDocument();

  await assertLinks(false, false);
});

it('should render correctly for new code', async () => {
  renderIssuesInSandboxSection({
    measures: DEFAULT_MEASURES,
    inNewCodePeriod: true,
  });
  expect(await ui.sandboxSectionTitle().find()).toBeInTheDocument();

  await assertLinks(false, true);
});

it('should render correctly in Standard experience mode', async () => {
  modeHandler.setMode(Mode.Standard);

  renderIssuesInSandboxSection();
  expect(await ui.sandboxSectionTitle().find()).toBeInTheDocument();

  await assertLinks(true, false);
});

it('should render correctly with blocker issues', async () => {
  renderIssuesInSandboxSection();

  expect(await ui.sandboxSectionTitle().find()).toBeInTheDocument();
  expect(await ui.blockerBadge().find()).toBeInTheDocument();
});

function renderIssuesInSandboxSection(
  props: Partial<ComponentPropsType<typeof IssuesInSandboxSection>> = {},
  component: Component = mockComponent({
    key: 'foo',
    name: 'Foo',
    version: 'version-1.0',
  }),
) {
  return renderComponent(
    <ComponentContext.Provider
      value={{ component, fetchComponent: jest.fn(), onComponentChange: jest.fn() }}
    >
      <IssuesInSandboxSection measures={DEFAULT_MEASURES} {...props} />
    </ComponentContext.Provider>,
    '/',
  );
}

async function assertLinks(isStandardMode = false, isNewCode = false) {
  const typeFilter = isStandardMode ? 'types' : 'impactSoftwareQualities';
  const getType = (quality: SoftwareQuality) =>
    isStandardMode ? getIssueTypeBySoftwareQuality(quality) : quality;

  const securityLink = await ui.qualityMeasureLink(getType(SoftwareQuality.Security), '1').find();
  // Service mock does not support smart facets, hard mocked to 1 instead of 2
  const reliabilityLink = ui.qualityMeasureLink(getType(SoftwareQuality.Reliability), '1').get();
  const maintainabilityLink = ui
    .qualityMeasureLink(getType(SoftwareQuality.Maintainability), '1')
    .get();

  expect(securityLink).toBeInTheDocument();
  expect(reliabilityLink).toBeInTheDocument();
  expect(maintainabilityLink).toBeInTheDocument();

  expect(securityLink).toHaveAttribute(
    'href',
    `/project/issues?${typeFilter}=${getType(SoftwareQuality.Security)}&inNewCodePeriod=${isNewCode}&issueStatuses=IN_SANDBOX&id=foo`,
  );
  expect(reliabilityLink).toHaveAttribute(
    'href',
    `/project/issues?${typeFilter}=${getType(SoftwareQuality.Reliability)}&inNewCodePeriod=${isNewCode}&issueStatuses=IN_SANDBOX&id=foo`,
  );
  expect(maintainabilityLink).toHaveAttribute(
    'href',
    `/project/issues?${typeFilter}=${getType(SoftwareQuality.Maintainability)}&inNewCodePeriod=${isNewCode}&issueStatuses=IN_SANDBOX&id=foo`,
  );
}

const DEFAULT_MEASURES = [
  mockMeasureEnhanced({
    metric: mockMetric({ key: MetricKey.issues_in_sandbox }),
    value: '4',
  }),
  mockMeasureEnhanced({
    metric: mockMetric({ key: MetricKey.new_issues_in_sandbox }),
    period: { value: '2', index: 0 },
  }),
];
