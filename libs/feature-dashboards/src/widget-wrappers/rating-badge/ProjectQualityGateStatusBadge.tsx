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

import styled from '@emotion/styled';
import { LinkStandalone, Spinner, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import tw from 'twin.macro';
import { QualityGateIndicator } from '~adapters/components/ui/QualityGateIndicator';
import { formatDashboardMeasure } from '~adapters/helpers/dashboard-measures';
import { getProjectDashboardSummaryUrl } from '~adapters/helpers/dashboard-widget-urls';
import { useProjectQualityGateStatusWidgetQuery } from '~adapters/queries/project-rating-badge-widget-data';
import type { QGStatusExtended } from '~shared/types/common';
import { MetricType } from '~shared/types/metrics';
import { QualityGateBreakdown } from './QualityGateBreakdown';

interface Props {
  showBreakdown?: boolean;
  status?: QGStatusExtended;
}

interface StatusDescriptionProps {
  failedConditionsCount: number | undefined;
  isLoading: boolean;
  status: QGStatusExtended;
}

function StatusDescription({
  failedConditionsCount,
  isLoading,
  status,
}: Readonly<StatusDescriptionProps>) {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const component = searchParams.get('id');
  const summaryUrl = component ? getProjectDashboardSummaryUrl(component) : '#';

  switch (status) {
    case 'OK':
      return (
        <Text className="sw-text-sm" isSubtle>
          <ConditionLink to={summaryUrl}>
            {intl.formatMessage({ id: 'overview.quality_gate.all_conditions_passed' })}
          </ConditionLink>
        </Text>
      );

    case 'ERROR': {
      // Show loading state while we fetch the count
      if (isLoading) {
        return <Spinner />;
      }

      // Show failed conditions count with link to summary
      if (failedConditionsCount) {
        return (
          <Text className="sw-text-sm" colorOverride="echoes-color-text-danger">
            <ConditionLink to={summaryUrl}>
              <FormattedMessage
                id="summary.x_conditions_failed.formatted"
                values={{
                  conditions: failedConditionsCount,
                  conditionsFormatted: <strong>{failedConditionsCount}</strong>,
                }}
              />
            </ConditionLink>
          </Text>
        );
      }

      // Fallback if we don't have the count
      return (
        <Text className="sw-text-sm" colorOverride="echoes-color-text-danger">
          <ConditionLink to={summaryUrl}>
            {intl.formatMessage({ id: 'overview.quality_gate.conditions_failed' })}
          </ConditionLink>
        </Text>
      );
    }

    case undefined:
    case 'NOT_COMPUTED':
    case 'NONE':
      return (
        <Text className="sw-text-sm" isSubtle>
          <ConditionLink to={summaryUrl}>
            {intl.formatMessage({ id: 'overview.quality_gate.run_analysis' })}
          </ConditionLink>
        </Text>
      );

    default:
      return null;
  }
}

export function ProjectQualityGateStatusBadge({
  showBreakdown = false,
  status = 'NOT_COMPUTED',
}: Readonly<Props>) {
  const [searchParams] = useSearchParams();
  const component = searchParams.get('id') ?? '';
  const { data: qualityGateStatus, isLoading } = useProjectQualityGateStatusWidgetQuery(component);

  const statusLabel = formatDashboardMeasure(status, MetricType.Level);

  const failedConditionsCount = qualityGateStatus?.conditions?.filter(
    (c) => c.level === 'ERROR',
  ).length;

  const conditions = qualityGateStatus?.conditions ?? [];

  return (
    <div className="sw-h-full sw-flex sw-flex-col sw-items-center sw-justify-center sw-gap-4">
      <div className="sw-flex sw-items-center sw-justify-center sw-gap-4">
        <QualityGateIndicator size="xl" status={status} />
        <div className="sw-flex sw-flex-col">
          <Text className="sw-typo-lg-semibold sw-text-2xl">{statusLabel}</Text>
          <StatusDescription
            failedConditionsCount={failedConditionsCount}
            isLoading={isLoading}
            status={status}
          />
        </div>
      </div>
      {showBreakdown && status === 'ERROR' && !isLoading && (
        <QualityGateBreakdown componentKey={component} conditions={conditions} />
      )}
    </div>
  );
}

const ConditionLink = styled(LinkStandalone)`
  ${tw`sw-no-underline hover:sw-underline sw-font-regular`};

  &,
  &:visited,
  &:hover,
  &:visited:hover {
    color: inherit;
    text-decoration-color: currentColor;
  }
`;
