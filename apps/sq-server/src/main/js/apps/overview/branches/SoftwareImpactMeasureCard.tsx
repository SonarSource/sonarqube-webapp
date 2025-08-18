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

import styled from '@emotion/styled';
import {
  Badge,
  Label,
  LinkHighlight,
  LinkStandalone,
  Text,
  Tooltip,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MeasureEnhanced } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import {
  SOFTWARE_QUALITIES_METRIC_KEYS_MAP,
  getIssueTypeBySoftwareQuality,
} from '~sq-server-commons/helpers/issues';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { getComponentIssuesUrl } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { Branch } from '~sq-server-commons/types/branch-like';
import { QualityGateStatusConditionEnhanced } from '~sq-server-commons/types/quality-gates';
import { Component } from '~sq-server-commons/types/types';
import { QGStatusEnum, softwareQualityToMeasure } from '~sq-server-commons/utils/overview-utils';
import SoftwareImpactMeasureRating from './SoftwareImpactMeasureRating';

export interface SoftwareImpactBreakdownCardProps {
  branch?: Branch;
  component: Component;
  conditions: QualityGateStatusConditionEnhanced[];
  measures: MeasureEnhanced[];
  ratingMetricKey: MetricKey;
  softwareQuality: SoftwareQuality;
}

export function SoftwareImpactMeasureCard(props: Readonly<SoftwareImpactBreakdownCardProps>) {
  const { component, conditions, softwareQuality, ratingMetricKey, measures, branch } = props;

  const intl = useIntl();
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  // Find measure for this software quality
  const metricKey = softwareQualityToMeasure(softwareQuality);
  const measure = isStandardMode ? undefined : measures.find((m) => m.metric.key === metricKey);
  const alternativeMeasure = measures.find(
    (m) => m.metric.key === SOFTWARE_QUALITIES_METRIC_KEYS_MAP[softwareQuality].deprecatedMetric,
  );
  const count = formatMeasure(measure?.value ?? alternativeMeasure?.value, MetricType.ShortInteger);

  const totalLinkHref = getComponentIssuesUrl(component.key, {
    ...DEFAULT_ISSUES_QUERY,
    ...(isDefined(measure)
      ? { impactSoftwareQualities: softwareQuality }
      : { types: getIssueTypeBySoftwareQuality(softwareQuality) }),
    branch: branch?.name,
  });

  const countTooltipOverlay = intl.formatMessage({
    id: 'overview.measures.software_impact.count_tooltip',
  });

  const failed = conditions.some(
    (c) => c.level === QGStatusEnum.ERROR && c.metric === ratingMetricKey,
  );

  return (
    <div
      className="sw-overflow-hidden sw-rounded-2 sw-flex-col"
      data-testid={`overview__software-impact-card-${softwareQuality}`}
    >
      <div className="sw-flex sw-items-center sw-gap-2">
        <Label as="span">
          {!isStandardMode && intl.formatMessage({ id: `software_quality.${softwareQuality}` })}
          {alternativeMeasure && isStandardMode && alternativeMeasure.metric.name}
        </Label>
        {failed && (
          <Badge variety="danger">
            <FormattedMessage id="overview.measures.failed_badge" />
          </Badge>
        )}
      </div>
      <div className="sw-flex sw-flex-col sw-gap-3">
        <div className="sw-flex sw-mt-4">
          <div className="sw-flex sw-gap-1 sw-items-center">
            {count ? (
              <Tooltip content={countTooltipOverlay} isOpen={isStandardMode ? false : undefined}>
                <LinkStandalone
                  aria-label={intl.formatMessage(
                    {
                      id: `overview.measures.software_impact.see_list_of_x_open_issues`,
                    },
                    {
                      count,
                      softwareQuality: intl.formatMessage({
                        id: `software_quality.${softwareQuality}`,
                      }),
                    },
                  )}
                  className="sw-text-lg sw-font-semibold"
                  data-testid={`overview__software-impact-${softwareQuality}`}
                  highlight={LinkHighlight.CurrentColor}
                  to={totalLinkHref}
                >
                  {count}
                </LinkStandalone>
              </Tooltip>
            ) : (
              <StyledDash isHighlighted>-</StyledDash>
            )}
            <Text className="sw-self-end sw-pb-1" isSubtle>
              {intl.formatMessage({ id: 'overview.measures.software_impact.total_open_issues' })}
            </Text>
          </div>

          <div className="sw-flex-grow sw-flex sw-justify-end">
            <SoftwareImpactMeasureRating
              branch={branch}
              componentKey={component.key}
              ratingMetricKey={ratingMetricKey}
              softwareQuality={softwareQuality}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const StyledDash = styled(Text)`
  font-size: 36px;
`;

export default SoftwareImpactMeasureCard;
