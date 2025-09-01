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

import { screen, waitFor } from '@testing-library/react';
import { byRole } from '~shared/helpers/testSelector';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { QGStatus } from '~shared/types/common';
import { MetricKey, MetricType } from '~shared/types/metrics';
import IssuesServiceMock from '~sq-server-commons/api/mocks/IssuesServiceMock';
import CurrentUserContextProvider from '~sq-server-commons/context/current-user/CurrentUserContextProvider';
import {
  mockQualityGate,
  mockQualityGateStatus,
  mockQualityGateStatusConditionEnhanced,
} from '~sq-server-commons/helpers/mocks/quality-gates';
import { mockLoggedInUser, mockRawIssue } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { IssueType } from '~sq-server-commons/types/issues';
import { QualityGateStatusConditionEnhanced } from '~sq-server-commons/types/quality-gates';
import { CaycStatus } from '~sq-server-commons/types/types';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';
import QualityGatePanelSection, { QualityGatePanelSectionProps } from '../QualityGatePanelSection';

let issuesHandler: IssuesServiceMock;

beforeAll(() => {
  issuesHandler = new IssuesServiceMock();
});

beforeEach(() => {
  issuesHandler.reset();
});

const mockCondition = (
  metric: MetricKey,
  type = MetricType.Rating,
  domain = 'Issues',
  overrides: Partial<QualityGateStatusConditionEnhanced> = {},
) =>
  mockQualityGateStatusConditionEnhanced({
    level: 'ERROR',
    metric,
    measure: {
      metric: { id: metric, key: metric, name: metric, type, domain },
    },
    ...overrides,
  });

const mockNewCodeCondition = (...args: Parameters<typeof mockCondition>) => {
  args[3] = { ...args[3], period: 1 };
  return mockCondition(...args);
};

const failedConditions = [
  mockCondition(MetricKey.new_coverage),
  mockCondition(MetricKey.security_hotspots),
  mockCondition(MetricKey.new_violations),
];

const qgStatus = mockQualityGateStatus({
  caycStatus: CaycStatus.Compliant,
  failedConditions,
  key: 'qgStatusKey',
  name: 'qgStatusName',
  status: 'ERROR' as QGStatus,
});

it('should render correctly for a project with 1 new code condition', () => {
  renderQualityGatePanelSection({
    isApplication: false,
    qgStatus: { ...qgStatus, failedConditions: [failedConditions[0]] },
  });

  expect(screen.queryByText('quality_gates.conditions.new_code_1')).not.toBeInTheDocument();
  expect(screen.queryByText('quality_gates.conditions.overall_code_1')).not.toBeInTheDocument();
});

it('should render correctly 0 New issues onboarding', async () => {
  renderQualityGatePanelSection({
    isApplication: false,
    qgStatus: { ...qgStatus, failedConditions: [failedConditions[2]] },
    qualityGate: mockQualityGate({ isBuiltIn: true }),
  });

  expect(await byRole('alertdialog').find()).toBeInTheDocument();
});

it('should not render 0 New issues onboarding for user who dismissed it', () => {
  renderQualityGatePanelSection(
    {
      isApplication: false,
      qgStatus: { ...qgStatus, failedConditions: [failedConditions[2]] },
      qualityGate: mockQualityGate({ isBuiltIn: true }),
    },
    mockLoggedInUser({
      dismissedNotices: { [NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION]: true },
    }),
  );

  expect(screen.queryByText('quality_gates.conditions.new_code_1')).not.toBeInTheDocument();
  expect(byRole('alertdialog').query()).not.toBeInTheDocument();
});

it('should render correct links for ratings with "overall code" failed conditions', () => {
  renderQualityGatePanelSection(
    {
      isApplication: false,
      isNewCode: false,
      qgStatus: {
        ...qgStatus,
        failedConditions: [
          mockCondition(MetricKey.sqale_rating),
          mockCondition(MetricKey.reliability_rating),
          mockCondition(MetricKey.security_rating),
          mockCondition(MetricKey.software_quality_security_rating),
          mockCondition(MetricKey.software_quality_reliability_rating),
          mockCondition(MetricKey.software_quality_maintainability_rating),
        ],
      },
      qualityGate: mockQualityGate({ isBuiltIn: true }),
    },
    mockLoggedInUser({
      dismissedNotices: { [NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION]: true },
    }),
  );

  expect(byRole('link', { name: /sqale_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=CODE_SMELL&id=qgStatusKey',
  );
  expect(byRole('link', { name: /reliability_rating/ }).getAt(0)).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=BUG&id=qgStatusKey',
  );
  expect(byRole('link', { name: /security_rating/ }).getAt(0)).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=VULNERABILITY&id=qgStatusKey',
  );
  expect(byRole('link', { name: /software_quality_security_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=SECURITY&id=qgStatusKey',
  );
  expect(byRole('link', { name: /software_quality_reliability_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=RELIABILITY&id=qgStatusKey',
  );
  expect(byRole('link', { name: /software_quality_maintainability_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=MAINTAINABILITY&id=qgStatusKey',
  );
});

it('should render correct links for ratings with "new code" failed conditions', () => {
  renderQualityGatePanelSection(
    {
      isApplication: false,
      qgStatus: {
        ...qgStatus,
        failedConditions: [
          mockCondition(MetricKey.new_maintainability_rating),
          mockCondition(MetricKey.new_security_rating),
          mockCondition(MetricKey.new_reliability_rating),
          mockCondition(MetricKey.new_software_quality_security_rating),
          mockCondition(MetricKey.new_software_quality_reliability_rating),
          mockCondition(MetricKey.new_software_quality_maintainability_rating),
        ],
      },
      qualityGate: mockQualityGate({ isBuiltIn: true }),
    },
    mockLoggedInUser({
      dismissedNotices: { [NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION]: true },
    }),
  );

  expect(byRole('link', { name: /new_maintainability_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=CODE_SMELL&inNewCodePeriod=true&id=qgStatusKey',
  );
  expect(byRole('link', { name: /new_security_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=VULNERABILITY&inNewCodePeriod=true&id=qgStatusKey',
  );
  expect(byRole('link', { name: /new_reliability_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=BUG&inNewCodePeriod=true&id=qgStatusKey',
  );
  expect(byRole('link', { name: /new_software_quality_security_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=SECURITY&inNewCodePeriod=true&id=qgStatusKey',
  );
  expect(byRole('link', { name: /new_software_quality_reliability_rating/ }).get()).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=RELIABILITY&inNewCodePeriod=true&id=qgStatusKey',
  );
  expect(
    byRole('link', { name: /new_software_quality_maintainability_rating/ }).get(),
  ).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=MAINTAINABILITY&inNewCodePeriod=true&id=qgStatusKey',
  );
});

describe('Issues from SonarQube update', () => {
  beforeEach(() => {
    // Setup: 2 issues with fromSonarQubeUpdate=true, 1 regular issue
    issuesHandler.list = [
      {
        issue: mockRawIssue(false, {
          type: IssueType.Vulnerability,
          severity: 'CRITICAL',
          impacts: [
            {
              softwareQuality: SoftwareQuality.Security,
              severity: SoftwareImpactSeverity.High,
            },
          ],
          fromSonarQubeUpdate: true,
        }),
        snippets: {},
      },
      {
        issue: mockRawIssue(false, {
          type: IssueType.CodeSmell,
          impacts: [
            {
              softwareQuality: SoftwareQuality.Maintainability,
              severity: SoftwareImpactSeverity.Medium,
            },
          ],
          fromSonarQubeUpdate: true,
        }),
        snippets: {},
      },
      {
        issue: mockRawIssue(false, {
          type: IssueType.CodeSmell,
          impacts: [
            {
              softwareQuality: SoftwareQuality.Maintainability,
              severity: SoftwareImpactSeverity.Medium,
            },
          ],
        }),
        snippets: {},
      },
    ];
  });

  it('should render issues caused by SonarQube update links for failed conditions in new code', async () => {
    renderQualityGatePanelSection(
      {
        isApplication: false,
        qgStatus: {
          ...qgStatus,
          failedConditions: [
            mockNewCodeCondition(MetricKey.new_violations, MetricType.Integer, 'Issues'),
            mockNewCodeCondition(
              MetricKey.new_maintainability_rating,
              MetricType.Rating,
              'Maintainability',
            ),
            mockNewCodeCondition(
              MetricKey.new_reliability_rating,
              MetricType.Rating,
              'Reliability',
            ),
            mockNewCodeCondition(MetricKey.new_security_rating, MetricType.Rating, 'Security', {
              error: '2',
            }),
            mockNewCodeCondition(MetricKey.new_critical_violations, MetricType.Integer, 'Issues'),
            mockNewCodeCondition(MetricKey.new_blocker_violations, MetricType.Integer, 'Issues'),
            mockNewCodeCondition(MetricKey.new_major_violations, MetricType.Integer, 'Issues'),
            mockNewCodeCondition(
              MetricKey.new_sqale_debt_ratio,
              MetricType.Integer,
              'Maintainability',
            ),
            mockNewCodeCondition(
              MetricKey.new_security_remediation_effort,
              MetricType.Integer,
              'Security',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_security_rating,
              MetricType.Rating,
              'Security',
              { error: '2' },
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_reliability_rating,
              MetricType.Rating,
              'Reliability',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_maintainability_rating,
              MetricType.Rating,
              'Maintainability',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_high_issues,
              MetricType.Integer,
              'Issues',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_blocker_issues,
              MetricType.Integer,
              'Issues',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_medium_issues,
              MetricType.Integer,
              'Issues',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_maintainability_debt_ratio,
              MetricType.Integer,
              'Maintainability',
            ),
            mockNewCodeCondition(
              MetricKey.new_software_quality_security_remediation_effort,
              MetricType.Integer,
              'Security',
            ),
          ],
        },
        // Metric shows 2 issues from SonarQube update
        measures: [
          {
            metric: {
              id: MetricKey.from_sonarqube_update_issues,
              key: MetricKey.from_sonarqube_update_issues,
              name: 'Issues from SonarQube update',
              type: MetricType.Integer,
            },
            value: '2',
          },
        ],
        qualityGate: mockQualityGate({ isBuiltIn: true }),
      },
      mockLoggedInUser({
        dismissedNotices: { [NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION]: true },
      }),
    );

    await waitFor(() => {
      expect(
        screen.getAllByRole('link', { name: /overview.issues.issue_from_update/ }),
      ).toHaveLength(13);
    });

    // New issues condition - shows both issues
    expect(
      screen.getAllByRole('link', { name: 'overview.issues.issue_from_update.2' }),
    ).toHaveLength(1);
    // Other conditions just have 1 issue
    expect(
      screen.getAllByRole('link', { name: 'overview.issues.issue_from_update.1' }),
    ).toHaveLength(12);

    expect(
      screen.getAllByRole('link', { name: 'overview.issues.issue_from_update.2' })[0],
    ).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    const linksToSingleIssues = screen.getAllByRole('link', {
      name: 'overview.issues.issue_from_update.1',
    });
    expect(linksToSingleIssues[0]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&types=CODE_SMELL&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[1]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&types=VULNERABILITY&severities=BLOCKER%2CCRITICAL%2CMAJOR&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[2]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&severities=CRITICAL&inNewCodePeriod=true&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[3]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&severities=MAJOR&inNewCodePeriod=true&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[4]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&types=CODE_SMELL&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[5]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&types=VULNERABILITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[6]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&impactSeverities=BLOCKER%2CHIGH%2CMEDIUM&impactSoftwareQualities=SECURITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[7]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&impactSoftwareQualities=MAINTAINABILITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[8]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSeverities=HIGH&inNewCodePeriod=true&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[9]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSeverities=MEDIUM&inNewCodePeriod=true&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[10]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&impactSoftwareQualities=MAINTAINABILITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[11]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&inNewCodePeriod=true&impactSoftwareQualities=SECURITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
  });

  it('should render issues caused by SonarQube update links for failed conditions in overall code', async () => {
    renderQualityGatePanelSection(
      {
        isApplication: false,
        isNewCode: false,
        qgStatus: {
          ...qgStatus,
          failedConditions: [
            mockCondition(MetricKey.violations, MetricType.Integer, 'Issues'),
            mockCondition(MetricKey.maintainability_rating, MetricType.Rating, 'Maintainability'),
            mockCondition(MetricKey.reliability_rating, MetricType.Rating, 'Reliability'),
            mockCondition(MetricKey.security_rating, MetricType.Rating, 'Security', {
              error: '2',
            }),
            mockCondition(MetricKey.critical_violations, MetricType.Integer, 'Issues'),
            mockCondition(MetricKey.blocker_violations, MetricType.Integer, 'Issues'),
            mockCondition(MetricKey.major_violations, MetricType.Integer, 'Issues'),
            mockCondition(MetricKey.sqale_debt_ratio, MetricType.Integer, 'Maintainability'),
            mockCondition(MetricKey.security_remediation_effort, MetricType.Integer, 'Security'),
            mockCondition(
              MetricKey.software_quality_security_rating,
              MetricType.Rating,
              'Security',
              { error: '2' },
            ),
            mockCondition(
              MetricKey.software_quality_reliability_rating,
              MetricType.Rating,
              'Reliability',
            ),
            mockCondition(
              MetricKey.software_quality_maintainability_rating,
              MetricType.Rating,
              'Maintainability',
            ),
            mockCondition(MetricKey.software_quality_high_issues, MetricType.Integer, 'Issues'),
            mockCondition(MetricKey.software_quality_blocker_issues, MetricType.Integer, 'Issues'),
            mockCondition(MetricKey.software_quality_medium_issues, MetricType.Integer, 'Issues'),
            mockCondition(
              MetricKey.software_quality_maintainability_debt_ratio,
              MetricType.Integer,
              'Maintainability',
            ),
            mockCondition(
              MetricKey.software_quality_security_remediation_effort,
              MetricType.Integer,
              'Security',
            ),
          ],
        },
        measures: [
          {
            metric: {
              id: MetricKey.from_sonarqube_update_issues,
              key: MetricKey.from_sonarqube_update_issues,
              name: 'Issues from SonarQube update',
              type: MetricType.Integer,
            },
            value: '2',
          },
        ],
        qualityGate: mockQualityGate({ isBuiltIn: true }),
      },
      mockLoggedInUser({
        dismissedNotices: { [NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION]: true },
      }),
    );

    await waitFor(() => {
      expect(
        screen.getAllByRole('link', { name: /overview.issues.issue_from_update/ }),
      ).toHaveLength(13);
    });

    // Total issues condition - shows both issues
    expect(
      screen.getAllByRole('link', { name: 'overview.issues.issue_from_update.2' }),
    ).toHaveLength(1);
    // Other conditions just have 1 issue
    expect(
      screen.getAllByRole('link', { name: 'overview.issues.issue_from_update.1' }),
    ).toHaveLength(12);

    expect(
      screen.getAllByRole('link', { name: 'overview.issues.issue_from_update.2' })[0],
    ).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    const linksToSingleIssues = screen.getAllByRole('link', {
      name: 'overview.issues.issue_from_update.1',
    });
    expect(linksToSingleIssues[0]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=CODE_SMELL&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[1]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=VULNERABILITY&severities=BLOCKER%2CCRITICAL%2CMAJOR&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[2]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&severities=CRITICAL&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[3]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&severities=MAJOR&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[4]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=CODE_SMELL&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[5]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&types=VULNERABILITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[6]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSeverities=BLOCKER%2CHIGH%2CMEDIUM&impactSoftwareQualities=SECURITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[7]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=MAINTAINABILITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[8]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSeverities=HIGH&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[9]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSeverities=MEDIUM&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[10]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=MAINTAINABILITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
    expect(linksToSingleIssues[11]).toHaveAttribute(
      'href',
      '/project/issues?issueStatuses=OPEN%2CCONFIRMED&impactSoftwareQualities=SECURITY&fromSonarQubeUpdate=true&id=qgStatusKey',
    );
  });
});

function renderQualityGatePanelSection(
  props: Partial<QualityGatePanelSectionProps> = {},
  currentUser: CurrentUser = mockLoggedInUser(),
) {
  return renderComponent(
    <CurrentUserContextProvider currentUser={currentUser}>
      <QualityGatePanelSection isApplication isNewCode qgStatus={qgStatus} {...props} />
    </CurrentUserContextProvider>,
    '/',
    { featureList: [Feature.FromSonarQubeUpdate] },
  );
}
