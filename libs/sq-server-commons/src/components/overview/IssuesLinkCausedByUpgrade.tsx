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
import { cssVar, Link, LinkHighlight, Text, TextSize, Tooltip } from '@sonarsource/echoes-react';
import { omit } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MeasureEnhanced, Metric } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { useAvailableFeatures } from '../../context/available-features/withAvailableFeatures';
import { useComponent } from '../../context/componentContext/withComponentContext';
import {
  CCT_SOFTWARE_QUALITY_METRICS,
  LEAK_CCT_SOFTWARE_QUALITY_METRICS,
  SOFTWARE_QUALITY_RATING_METRICS,
} from '../../helpers/constants';
import { getIssueTypeBySoftwareQuality } from '../../helpers/issues';
import { RequestData } from '../../helpers/request';
import { useIssuesSearchQuery } from '../../queries/issues';
import { getComponentIssuesUrl } from '../../sonar-aligned/helpers/urls';
import { BranchLike } from '../../types/branch-like';
import { Feature } from '../../types/features';
import { IssueType } from '../../types/issues';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import { Component } from '../../types/types';
import {
  MQR_RATING_TO_SEVERITIES_MAPPING,
  RATING_TO_SEVERITIES_MAPPING,
} from '../../utils/overview-utils';
import { DEFAULT_ISSUES_QUERY, propsToIssueParams } from '../shared/utils';

interface IssuesLinkCausedByUpgradeProps {
  branchLike?: BranchLike;
  className?: string;
  component: Pick<Component, 'key'>;
  condition?: QualityGateStatusConditionEnhanced;
  fromSonarQubeUpdateIssuesMeasure?: MeasureEnhanced;
  isNewCodePeriod?: boolean;
  metric?: Metric;
}

const ISSUES_PAGE_SIZE_TO_RETRIEVE_TOTALS = 1;
const DOMAINS_TO_SHOW_FAILED_ISSUES_COUNT = [
  'Security',
  'Reliability',
  'Maintainability',
  'Issues',
];

const METRICS_TO_QUALITY: Record<string, SoftwareQuality> = {
  [MetricKey.new_software_quality_reliability_rating]: SoftwareQuality.Reliability,
  [MetricKey.new_software_quality_security_rating]: SoftwareQuality.Security,
  [MetricKey.new_software_quality_maintainability_rating]: SoftwareQuality.Maintainability,
  [MetricKey.software_quality_reliability_rating]: SoftwareQuality.Reliability,
  [MetricKey.software_quality_security_rating]: SoftwareQuality.Security,
  [MetricKey.software_quality_maintainability_rating]: SoftwareQuality.Maintainability,
};

const METRICS_TO_ISSUE_TYPE: Record<string, IssueType> = {
  [MetricKey.reliability_rating]: IssueType.Bug,
  [MetricKey.new_reliability_rating]: IssueType.Bug,
  [MetricKey.security_rating]: IssueType.Vulnerability,
  [MetricKey.new_security_rating]: IssueType.Vulnerability,
  [MetricKey.sqale_rating]: IssueType.CodeSmell,
  [MetricKey.maintainability_rating]: IssueType.CodeSmell,
  [MetricKey.new_maintainability_rating]: IssueType.CodeSmell,
};

export default function IssuesLinkCausedByUpgrade(props: Readonly<IssuesLinkCausedByUpgradeProps>) {
  const { className, component, fromSonarQubeUpdateIssuesMeasure, isNewCodePeriod, metric } = props;
  const { component: { needIssueSync } = {} } = useComponent();
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();

  const fromSonarQubeUpdateIssuesCount = fromSonarQubeUpdateIssuesMeasure
    ? Number(fromSonarQubeUpdateIssuesMeasure.value || '0')
    : 0;

  const shouldEnableQueries =
    hasFeature(Feature.FromSonarQubeUpdate) &&
    !needIssueSync &&
    DOMAINS_TO_SHOW_FAILED_ISSUES_COUNT.includes(metric?.domain ?? '') &&
    fromSonarQubeUpdateIssuesCount > 0;

  // Build query parameters based on the metric and condition
  const metricQueryParams: RequestData = getMetricQueryParams(props);

  const upgradeDetectionParams = {
    fromSonarQubeUpdate: true,
  };

  const { data: failedDueToUpgradeCount = 0 } = useIssuesSearchQuery(
    {
      ...metricQueryParams,
      ...upgradeDetectionParams,
      ps: ISSUES_PAGE_SIZE_TO_RETRIEVE_TOTALS,
      additionalFields: '_all',
    },
    {
      enabled: !!metric && shouldEnableQueries,
      select: (data) => data.paging.total ?? 0,
    },
  );

  if (!metric) {
    return null;
  }

  // Add new code period if applicable
  if (isNewCodePeriod) {
    metricQueryParams.inNewCodePeriod = true;
  }

  if (!shouldEnableQueries || failedDueToUpgradeCount < 1) {
    return null;
  }

  const linkUrl = getComponentIssuesUrl(component.key, {
    ...omit(metricQueryParams, ['components']),
    ...upgradeDetectionParams,
  });

  return (
    <Text as="p" className={className} size={TextSize.Small}>
      <Tooltip content={intl.formatMessage({ id: 'overview.issues.issue_from_update.tooltip' })}>
        <StyledLink highlight={LinkHighlight.Default} to={linkUrl}>
          <FormattedMessage
            id="overview.issues.issue_from_update"
            values={{ count: failedDueToUpgradeCount }}
          />
        </StyledLink>
      </Tooltip>
    </Text>
  );
}

const StyledLink = styled(Link)`
  font-weight: ${cssVar('font-weight-regular')};
`;

const getMetricQueryParams = ({
  metric,
  component,
  branchLike,
  condition,
  isNewCodePeriod,
}: IssuesLinkCausedByUpgradeProps) => {
  if (!metric?.key) {
    return {};
  }
  const metricKey = metric.key;

  const params: RequestData = {
    ...DEFAULT_ISSUES_QUERY,
    ...getBranchLikeQuery(branchLike),
    components: component.key,
  };

  Object.assign(params, propsToIssueParams(metricKey, isNewCodePeriod));

  if (metric.type === MetricType.Rating) {
    const threshold = condition?.level === 'ERROR' ? condition.error : condition?.warning;
    if (SOFTWARE_QUALITY_RATING_METRICS.includes(metricKey as MetricKey)) {
      Object.assign(params, {
        impactSeverities: MQR_RATING_TO_SEVERITIES_MAPPING[Number(threshold) - 1],
        impactSoftwareQualities: METRICS_TO_QUALITY[metricKey],
      });
    } else {
      Object.assign(params, {
        types: METRICS_TO_ISSUE_TYPE[metricKey],
        severities: RATING_TO_SEVERITIES_MAPPING[Number(threshold) - 1],
      });
    }
  } else if (metric.domain !== 'Issues') {
    if (
      SOFTWARE_QUALITY_RATING_METRICS.includes(metricKey as MetricKey) ||
      LEAK_CCT_SOFTWARE_QUALITY_METRICS.includes(metricKey as MetricKey) ||
      CCT_SOFTWARE_QUALITY_METRICS.includes(metricKey as MetricKey)
    ) {
      Object.assign(params, {
        impactSoftwareQualities: metric.domain?.toUpperCase(),
      });
    } else {
      Object.assign(params, {
        types: getIssueTypeBySoftwareQuality(metric.domain?.toUpperCase() as SoftwareQuality),
      });
    }
  }

  return params;
};
