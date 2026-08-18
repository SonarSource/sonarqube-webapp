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
import {
  SCA_MTTR_METRIC_OPTION_VALUE,
  type MetricGroup,
  type MetricOption,
} from '../../types/widget-common';

export function appendScaMttrOption(
  groups: MetricGroup[],
  formatMessage: IntlShape['formatMessage'],
  dependencyRiskGroupLabel: string,
): MetricGroup[] {
  const scaMttrOption: MetricOption = {
    label: formatMessage({
      id: 'dashboard.add_widget_modal.define_widget.metric.sca_mttr',
    }),
    value: SCA_MTTR_METRIC_OPTION_VALUE,
  };
  const dependencyRiskGroup = groups.find(({ group }) => group === dependencyRiskGroupLabel);

  if (!dependencyRiskGroup) {
    return [...groups, { group: dependencyRiskGroupLabel, items: [scaMttrOption] }];
  }

  return groups.map((group) =>
    group === dependencyRiskGroup ? { ...group, items: [...group.items, scaMttrOption] } : group,
  );
}
