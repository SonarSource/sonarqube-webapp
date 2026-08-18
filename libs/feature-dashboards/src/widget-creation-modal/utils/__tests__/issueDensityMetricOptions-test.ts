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

import type { IntlShape } from 'react-intl';
import { MetricKey } from '~shared/types/metrics';
import { ISSUE_DENSITY_METRIC_OPTION_VALUE } from '../../../types/widget-common';
import { appendIssueDensityOption } from '../issueDensityMetricOptions';

function createIntlStub(): IntlShape {
  return {
    formatMessage: ({ id }: { id: string }) => id,
  } as IntlShape;
}

describe('appendIssueDensityOption', () => {
  const groups = [
    {
      group: 'Issues',
      items: [{ label: 'Issue count', value: MetricKey.violations }],
    },
    {
      group: 'Security',
      items: [{ label: 'Security hotspots', value: MetricKey.security_hotspots }],
    },
  ];

  it('appends the localized issue-density option to the requested group', () => {
    const result = appendIssueDensityOption(groups, createIntlStub().formatMessage, 'Issues');

    expect(result[0]?.items).toEqual([
      groups[0]?.items[0],
      {
        label: 'dashboard.add_widget_modal.define_widget.metric.issue_density',
        value: ISSUE_DENSITY_METRIC_OPTION_VALUE,
      },
    ]);
    expect(result[1]).toEqual(groups[1]);
  });

  it('leaves all groups unchanged when the requested group is absent', () => {
    expect(
      appendIssueDensityOption(groups, createIntlStub().formatMessage, 'Maintainability'),
    ).toEqual(groups);
  });
});
