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
import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import {
  DashboardMetricType,
  RichMetricKey,
  type TopListWidgetProps,
} from '../../types/dashboard-widget';
import {
  getIssueFilterSeverityValueMessageId,
  getIssueFilterTypeLabelMessageId,
  getIssueFilterTypeValueMessageId,
} from '../../widget-creation-modal/utils/issueFilterPresentation';

export function buildTopListDrilldownSegments(
  counts: Record<string, number>,
  formatLabel: (value: string) => string,
  limit: number,
): Array<{ label: string; value: string }> {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, limit)
    .map(([value]) => ({ label: formatLabel(value), value }));
}

function formatSeverityValueLabels(
  formatMessage: IntlShape['formatMessage'],
  severities: SoftwareImpactSeverity[],
  isStandardMode: boolean,
): string[] {
  return severities.map((severity) =>
    formatMessage({ id: getIssueFilterSeverityValueMessageId(severity, isStandardMode) }),
  );
}

export function buildTopListIssueCountFilterSegments(
  formatMessage: IntlShape['formatMessage'],
  widget: TopListWidgetProps,
  isStandardMode = false,
): string[] {
  const segments = [formatMessage({ id: `dashboard_widget.codescope.${widget.scope}` })];

  if (widget.metric.type !== DashboardMetricType.Rich) {
    return segments;
  }

  const { measureFilters, metricKey } = widget.metric;
  if (metricKey !== RichMetricKey.Hotspots && measureFilters?.issueStatus) {
    const statusLabel = formatMessage({
      id: 'dashboard.add_widget_modal.apply_filters_section.select.status.label',
    });
    const statusValue = formatMessage({ id: `issue.status.${measureFilters.issueStatus}` });
    segments.push(`${statusLabel}: ${statusValue}`);
  }

  if (measureFilters?.impactSoftwareQuality) {
    const softwareQualityLabel = formatMessage({
      id: getIssueFilterTypeLabelMessageId(isStandardMode),
    });
    const softwareQuality = formatMessage({
      id: getIssueFilterTypeValueMessageId(measureFilters.impactSoftwareQuality, isStandardMode),
    });
    segments.push(`${softwareQualityLabel}: ${softwareQuality}`);
  }

  if (measureFilters?.impactSeverities?.length) {
    const severityLabel = formatMessage({
      id: 'dashboard.add_widget_modal.apply_filters_section.select.severity.label',
    });
    const severityValues = formatSeverityValueLabels(
      formatMessage,
      measureFilters.impactSeverities,
      isStandardMode,
    ).join(', ');
    segments.push(`${severityLabel}: ${severityValues}`);
  }

  return segments;
}
