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
import userEvent from '@testing-library/user-event';
import { ModeServiceMock } from '~sq-server-shared/api/mocks/ModeServiceMock';
import { ProjectBadgesServiceMock } from '~sq-server-shared/api/mocks/ProjectBadgesServiceMock';
import WebApiServiceMock from '~sq-server-shared/api/mocks/WebApiServiceMock';
import { getProjectBadgesToken } from '~sq-server-shared/api/project-badges';
import { mockBranch } from '~sq-server-shared/helpers/mocks/branch-like';
import { mockComponent } from '~sq-server-shared/helpers/mocks/component';
import { renderComponent } from '~sq-server-shared/helpers/testReactTestingUtils';
import { Location } from '~sq-server-shared/helpers/urls';
import { byLabelText, byRole, byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { Mode } from '~sq-server-shared/types/mode';
import ProjectBadges, { ProjectBadgesProps } from '../ProjectBadges';
import { BadgeType } from '../utils';

jest.mock('~sq-server-shared/helpers/urls', () => ({
  getHostUrl: () => 'host',
  getPathUrlAsString: (l: Location) => l.pathname,
  getProjectUrl: () => ({ pathname: '/dashboard' }) as Location,
}));

const badgesHandler = new ProjectBadgesServiceMock();
const webApiHandler = new WebApiServiceMock();
const modeHandler = new ModeServiceMock();

afterEach(() => {
  badgesHandler.reset();
  webApiHandler.reset();
  modeHandler.reset();
});

it('should renew token', async () => {
  const { user, ui } = getPageObjects();
  jest.mocked(getProjectBadgesToken).mockResolvedValueOnce('foo').mockResolvedValueOnce('bar');
  renderProjectBadges();
  await ui.appLoaded();

  expect(
    screen.getByAltText(`overview.badges.${BadgeType.measure}.alt.metric.alert_status.name`),
  ).toHaveAttribute(
    'src',
    expect.stringContaining(
      `host/api/project_badges/measure?branch=branch-6.7&project=my-project&metric=${MetricKey.alert_status}&token=foo`,
    ),
  );

  await user.click(screen.getByText('overview.badges.renew'));

  expect(
    await screen.findByAltText(`overview.badges.${BadgeType.qualityGate}.alt`),
  ).toHaveAttribute(
    'src',
    expect.stringContaining(
      'host/api/project_badges/quality_gate?branch=branch-6.7&project=my-project&token=bar',
    ),
  );

  expect(
    screen.getByAltText(`overview.badges.${BadgeType.measure}.alt.metric.alert_status.name`),
  ).toHaveAttribute(
    'src',
    expect.stringContaining(
      `host/api/project_badges/measure?branch=branch-6.7&project=my-project&metric=${MetricKey.alert_status}&token=bar`,
    ),
  );
});

it('can select badges in Standard Experience Mode', async () => {
  const { user, ui } = getPageObjects();
  modeHandler.setMode(Mode.Standard);

  renderProjectBadges();
  await ui.appLoaded();

  expect(ui.markdownCode(MetricKey.alert_status).get()).toBeInTheDocument();

  await ui.selectMetric(MetricKey.code_smells);
  expect(ui.markdownCode(MetricKey.code_smells).get()).toBeInTheDocument();

  await ui.selectMetric(MetricKey.security_rating);
  expect(ui.markdownCode(MetricKey.security_rating).get()).toBeInTheDocument();

  await user.click(ui.imageUrlRadio.get());
  expect(ui.urlCode(MetricKey.security_rating).get()).toBeInTheDocument();

  await user.click(ui.qualityGateBadge.get());
  expect(ui.urlCode().get()).toBeInTheDocument();

  await user.click(ui.mardownRadio.get());
  expect(ui.markdownCode().get()).toBeInTheDocument();
});

it('can select badges in MQR Mode', async () => {
  const { user, ui } = getPageObjects();

  renderProjectBadges();
  await ui.appLoaded();

  expect(ui.markdownCode(MetricKey.alert_status).get()).toBeInTheDocument();

  await ui.selectMetric(MetricKey.coverage);
  expect(ui.markdownCode(MetricKey.coverage).get()).toBeInTheDocument();

  await ui.selectMetric(MetricKey.software_quality_reliability_issues);
  expect(ui.markdownCode(MetricKey.software_quality_reliability_issues).get()).toBeInTheDocument();

  await ui.selectMetric(MetricKey.software_quality_maintainability_rating);
  expect(
    ui.markdownCode(MetricKey.software_quality_maintainability_rating).get(),
  ).toBeInTheDocument();

  await user.click(ui.imageUrlRadio.get());
  expect(ui.urlCode(MetricKey.software_quality_maintainability_rating).get()).toBeInTheDocument();

  await user.click(ui.qualityGateBadge.get());
  expect(ui.urlCode().get()).toBeInTheDocument();

  await user.click(ui.mardownRadio.get());
  expect(ui.markdownCode().get()).toBeInTheDocument();
});

const getPageObjects = () => {
  const user = userEvent.setup();

  return {
    user,
    ui: {
      qualityGateBadge: byRole('button', {
        name: `overview.badges.${BadgeType.qualityGate}.alt overview.badges.${BadgeType.qualityGate}.description.${ComponentQualifier.Project}`,
      }),
      imageUrlRadio: byRole('radio', { name: 'overview.badges.options.formats.url' }),
      mardownRadio: byRole('radio', { name: 'overview.badges.options.formats.md' }),
      urlCode: (metric?: MetricKey) =>
        byText(
          metric
            ? `host/api/project_badges/measure?branch=branch-6.7&project=my-project&metric=${metric}&token=${badgesHandler.token}`
            : `host/api/project_badges/quality_gate?branch=branch-6.7&project=my-project&token=${badgesHandler.token}`,
          { exact: false },
        ),
      markdownCode: (metric?: MetricKey) =>
        byText(
          metric
            ? `[![${metric}](host/api/project_badges/measure?branch=branch-6.7&project=my-project&metric=${metric}&token=${badgesHandler.token}`
            : `[![Quality gate](host/api/project_badges/quality_gate?branch=branch-6.7&project=my-project&token=${badgesHandler.token}`,
          { exact: false },
        ),

      async selectMetric(metric: MetricKey) {
        await user.click(byLabelText('overview.badges.metric').get());
        await user.click(byText(`metric.${metric}.name`).get());
      },
      async appLoaded() {
        await waitFor(() => {
          expect(screen.queryByLabelText(`loading`)).not.toBeInTheDocument();
        });
      },
    },
  };
};

function renderProjectBadges(props: Partial<ProjectBadgesProps> = {}) {
  return renderComponent(
    <ProjectBadges
      branchLike={mockBranch()}
      component={mockComponent({ configuration: { showSettings: true } })}
      {...props}
    />,
  );
}
