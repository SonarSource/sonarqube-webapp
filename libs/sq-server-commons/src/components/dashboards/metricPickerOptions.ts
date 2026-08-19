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
import { getLocalizedMetricDomain } from '../../helpers/l10n';

interface MetricGroup {
  group: string;
  items: Array<{ label: string; value: MetricKey }>;
}

export type MetricGroupDefinition = Readonly<{
  domain: string;
  keys: readonly MetricKey[];
}>;

export function buildMetricGroups(
  definitions: readonly MetricGroupDefinition[],
  metricKeys: ReadonlySet<MetricKey>,
  formatMessage: IntlShape['formatMessage'],
): MetricGroup[] {
  return definitions.flatMap(({ domain, keys }) => {
    const items = keys
      .filter((key) => metricKeys.has(key))
      .map((value) => ({
        label:
          value === MetricKey.violations
            ? formatMessage({ id: 'dashboard.add_widget_modal.define_widget.metric.issue_count' })
            : formatMessage({ id: `metric.${value}.name` }),
        value,
      }));

    return items.length > 0 ? [{ group: getLocalizedMetricDomain(domain), items }] : [];
  });
}
