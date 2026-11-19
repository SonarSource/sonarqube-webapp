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

import { createIntl } from 'react-intl';
import { createDashboardRequestCases } from '~feature-dashboards/widget-creation-modal/state/__tests__/dashboardRequestCases';
import {
  auditServerDashboardRequest,
  writeServerDashboardRequestTrace,
} from '~feature-dashboards/widget-creation-modal/state/__tests__/dashboardRequestHarness';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { getSqsProjectWidgetMetricPickerOptions } from '../projectWidgetMetricPickerOptions';

jest.mock('~sq-server-commons/context/componentContext/withComponentContext');

beforeEach(() => {
  jest
    .mocked(useComponent)
    .mockReturnValue({ component: { key: 'project-key' }, isPending: false } as ReturnType<
      typeof useComponent
    >);
});

afterAll(() => {
  writeServerDashboardRequestTrace('server-project');
});

// Intentionally fragile: preserve fetched data and request order. Review legitimate changes
// before updating these snapshots; see feature-dashboards dashboard-request-contract.md.
describe.each([false, true])('Server project requests / standard mode: %s', (isStandardMode) => {
  const cases = createDashboardRequestCases({
    isRatingBadgeBreakdownEligibleForMetric: () => false,
    metricPickerOptions: getSqsProjectWidgetMetricPickerOptions(
      createIntl({ locale: 'en' }),
      true,
      isStandardMode,
    ),
  });
  it.each(cases)('$id', async (sample) => {
    const captured = await auditServerDashboardRequest({
      ...sample,
      entity: 'project',
      isStandardMode,
    });
    expect(JSON.stringify(captured)).toMatchSnapshot();
  });
});
