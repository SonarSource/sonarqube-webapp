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

import { Badge, BadgeVariety, LinkStandalone, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { getProjectDashboardSummaryUrl } from '~adapters/helpers/dashboard-widget-urls';
import { filterConditions } from '~shared/helpers/quality-gates';
import { QualityGateStatusCondition } from '~shared/types/quality-gates';

interface Props {
  componentKey: string;
  conditions: QualityGateStatusCondition[];
}

export function QualityGateBreakdown({ componentKey, conditions }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const { failedNewCodeConditions, failedOverallConditions } = filterConditions(conditions);

  const newCodeCount = failedNewCodeConditions.length;
  const overallCount = failedOverallConditions.length;

  // If both have 0 issues, don't show the breakdown
  if (newCodeCount === 0 && overallCount === 0) {
    return null;
  }

  const newCodeUrl = getProjectDashboardSummaryUrl(componentKey);
  const overallUrl = getProjectDashboardSummaryUrl(componentKey, true);

  // Determine badge variety based on counts
  const newCodeVariety = newCodeCount > 0 ? BadgeVariety.Danger : BadgeVariety.Success;
  const overallVariety = overallCount > 0 ? BadgeVariety.Danger : BadgeVariety.Success;

  return (
    <div className="sw-flex sw-flex-col sw-gap-3 sw-items-center sw-justify-center sw-w-full">
      <Text isSubtle>{formatMessage({ id: 'quality_gate.breakdown.distribution_title' })}</Text>
      <div className="sw-flex sw-gap-3 sw-items-start sw-justify-center">
        <LinkStandalone to={newCodeUrl}>
          <Badge data-variety={newCodeVariety} variety={newCodeVariety}>
            {formatMessage({ id: 'quality_gate.breakdown.new_code' }, { count: newCodeCount })}
          </Badge>
        </LinkStandalone>
        <LinkStandalone to={overallUrl}>
          <Badge data-variety={overallVariety} variety={overallVariety}>
            {formatMessage({ id: 'quality_gate.breakdown.overall_code' }, { count: overallCount })}
          </Badge>
        </LinkStandalone>
      </div>
    </div>
  );
}
