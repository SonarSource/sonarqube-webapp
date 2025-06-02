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

import { Text } from '@sonarsource/echoes-react';
import { merge } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Path } from 'react-router-dom';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { Metric } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import withMetricsContext from '../../context/metrics/withMetricsContext';
import { LinkBox } from '../../design-system';
import { getLocalizedMetricNameNoDiffMetric, getOperatorLabel } from '../../helpers/quality-gates';
import {
  RISK_TYPE_QUALITY_GATE_LABEL,
  SCA_METRIC_TYPE_MAP,
  SCA_RISK_ALL_METRICS,
  SCA_RISK_LICENSE_METRIC_KEYS,
  scaFilterConditionsBySeverity,
} from '../../helpers/sca';
import { getRisksUrl } from '../../helpers/sca-urls';
import { getComponentDrilldownUrl } from '../../helpers/urls';
import { getBranchLikeQuery } from '../../sonar-aligned/helpers/branch-like';
import { formatMeasure } from '../../sonar-aligned/helpers/measures';
import {
  getComponentIssuesUrl,
  getComponentSecurityHotspotsUrl,
} from '../../sonar-aligned/helpers/urls';
import { BranchLike } from '../../types/branch-like';
import { IssueType } from '../../types/issues';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import { Component } from '../../types/types';
import {
  MQR_RATING_TO_SEVERITIES_MAPPING,
  RATING_TO_SEVERITIES_MAPPING,
} from '../../utils/overview-utils';
import IssueTypeIcon from '../icon-mappers/IssueTypeIcon';
import MeasureIndicator from '../measure/MeasureIndicator';
import { DEFAULT_ISSUES_QUERY, isIssueMeasure, propsToIssueParams } from '../shared/utils';

interface Props {
  branchLike?: BranchLike;
  component: Pick<Component, 'key'>;
  condition: QualityGateStatusConditionEnhanced;
  metrics: Record<string, Metric>;
}

export class QualityGateCondition extends React.PureComponent<Props> {
  getIssuesUrl = (inNewCodePeriod: boolean, customQuery: Record<string, string>) => {
    const query: Record<string, string | undefined> = {
      ...DEFAULT_ISSUES_QUERY,
      ...getBranchLikeQuery(this.props.branchLike),
      ...customQuery,
    };
    if (inNewCodePeriod) {
      Object.assign(query, { inNewCodePeriod: 'true' });
    }
    return getComponentIssuesUrl(this.props.component.key, query);
  };

  getUrlForSecurityHotspot(inNewCodePeriod: boolean) {
    return getComponentSecurityHotspotsUrl(
      this.props.component.key,
      this.props.branchLike,
      inNewCodePeriod ? { inNewCodePeriod: 'true' } : {},
    );
  }

  getUrlForCodeSmells(inNewCodePeriod: boolean) {
    return this.getIssuesUrl(inNewCodePeriod, { types: 'CODE_SMELL' });
  }

  getUrlForSoftwareQualityRatings(quality: SoftwareQuality, isNewCode: boolean) {
    const { condition } = this.props;
    const threshold = condition.level === 'ERROR' ? condition.error : condition.warning;

    if (quality === SoftwareQuality.Maintainability) {
      return this.getIssuesUrl(isNewCode, {
        impactSoftwareQualities: quality,
      });
    }

    return this.getIssuesUrl(isNewCode, {
      impactSeverities: MQR_RATING_TO_SEVERITIES_MAPPING[Number(threshold) - 1],
      impactSoftwareQualities: quality,
    });
  }

  getUrlForBugsOrVulnerabilities(type: string, inNewCodePeriod: boolean) {
    const { condition } = this.props;
    const threshold = condition.level === 'ERROR' ? condition.error : condition.warning;

    return this.getIssuesUrl(inNewCodePeriod, {
      types: type,
      severities: RATING_TO_SEVERITIES_MAPPING[Number(threshold) - 1],
    });
  }

  makeScaRiskRoutes() {
    const { condition } = this.props;
    return SCA_RISK_ALL_METRICS.reduce(
      (acc, metricKey) => {
        acc[metricKey] = () => {
          const threshold = (
            condition.level === 'ERROR' ? condition.error : condition.warning
          ) as string;
          return getRisksUrl({
            newParams: {
              ...getBranchLikeQuery(this.props.branchLike),
              newlyIntroduced: condition.period != null ? 'true' : undefined,
              severities: scaFilterConditionsBySeverity(threshold).join(','),
              types: SCA_METRIC_TYPE_MAP[metricKey as MetricKey],
              id: this.props.component.key,
            },
          });
        };
        return acc;
      },
      {} as Record<string, () => Partial<Path>>,
    );
  }

  /**
   * TODO: Backend tech debt hack:
   * metrics/search and condition.measure.metric should never disagree but they do
   * becaus of the SCA_RISK metric.
   */
  getMetric() {
    const { condition } = this.props;
    const { measure } = condition;
    const { metric } = measure;
    return merge({}, metric, this.props.metrics[metric.key] ?? {});
  }

  wrapWithLink(children: React.ReactNode) {
    const { branchLike, component, condition } = this.props;

    const metricKey = condition.measure.metric.key;

    const METRICS_TO_URL_MAPPING: Record<string, () => Partial<Path>> = {
      [MetricKey.reliability_rating]: () =>
        this.getUrlForBugsOrVulnerabilities(IssueType.Bug, false),
      [MetricKey.new_reliability_rating]: () =>
        this.getUrlForBugsOrVulnerabilities(IssueType.Bug, true),
      [MetricKey.security_rating]: () =>
        this.getUrlForBugsOrVulnerabilities(IssueType.Vulnerability, false),
      [MetricKey.new_security_rating]: () =>
        this.getUrlForBugsOrVulnerabilities(IssueType.Vulnerability, true),
      [MetricKey.sqale_rating]: () => this.getUrlForCodeSmells(false),
      [MetricKey.new_maintainability_rating]: () => this.getUrlForCodeSmells(true),
      [MetricKey.security_hotspots_reviewed]: () => this.getUrlForSecurityHotspot(false),
      [MetricKey.new_security_hotspots_reviewed]: () => this.getUrlForSecurityHotspot(true),
      // MQR
      [MetricKey.new_software_quality_reliability_rating]: () =>
        this.getUrlForSoftwareQualityRatings(SoftwareQuality.Reliability, true),
      [MetricKey.new_software_quality_security_rating]: () =>
        this.getUrlForSoftwareQualityRatings(SoftwareQuality.Security, true),
      [MetricKey.new_software_quality_maintainability_rating]: () =>
        this.getUrlForSoftwareQualityRatings(SoftwareQuality.Maintainability, true),
      [MetricKey.software_quality_reliability_rating]: () =>
        this.getUrlForSoftwareQualityRatings(SoftwareQuality.Reliability, false),
      [MetricKey.software_quality_security_rating]: () =>
        this.getUrlForSoftwareQualityRatings(SoftwareQuality.Security, false),
      [MetricKey.software_quality_maintainability_rating]: () =>
        this.getUrlForSoftwareQualityRatings(SoftwareQuality.Maintainability, false),
      [MetricKey.reopened_issues]: () =>
        this.getIssuesUrl(false, { issueStatuses: '', statuses: 'REOPENED' }),
      ...this.makeScaRiskRoutes(),
    };

    if (METRICS_TO_URL_MAPPING[metricKey]) {
      return (
        <LinkBox className="link-box-wrapper" to={METRICS_TO_URL_MAPPING[metricKey]()}>
          {children}
        </LinkBox>
      );
    }

    const url = isIssueMeasure(condition.measure.metric.key)
      ? getComponentIssuesUrl(component.key, {
          ...propsToIssueParams(condition.measure.metric.key, condition.period != null),
          ...getBranchLikeQuery(branchLike),
        })
      : getComponentDrilldownUrl({
          componentKey: component.key,
          metric: condition.measure.metric.key,
          branchLike,
          listView: true,
        });

    return (
      <LinkBox className="link-box-wrapper" to={url}>
        {children}
      </LinkBox>
    );
  }

  getPrimaryText = () => {
    const { condition } = this.props;
    const { measure } = condition;
    const metric = this.getMetric();

    if (metric.type === MetricType.ScaRisk) {
      const metricType = SCA_METRIC_TYPE_MAP[metric.key as MetricKey];
      const metricTypeLabel = metricType
        ? RISK_TYPE_QUALITY_GATE_LABEL[metricType]
        : RISK_TYPE_QUALITY_GATE_LABEL.Any;

      return <FormattedMessage id={metricTypeLabel} />;
    }

    const subText = getLocalizedMetricNameNoDiffMetric(metric, this.props.metrics);

    if (metric.type !== MetricType.Rating) {
      const actual = (condition.period ? measure.period?.value : measure.value) as string;
      const formattedValue = formatMeasure(actual, metric.type, {
        decimals: 1,
        omitExtraDecimalZeros: metric.type === MetricType.Percent,
      });
      return `${formattedValue} ${subText}`;
    }

    return subText;
  };

  getSecondaryText = (metric: Metric) => {
    const { condition } = this.props;
    const operator = getOperatorLabel(condition.op, metric);
    const threshold = (condition.level === 'ERROR' ? condition.error : condition.warning) as string;

    if (metric.type === MetricType.ScaRisk) {
      if (SCA_RISK_LICENSE_METRIC_KEYS.includes(metric.key)) {
        return null;
      }
    }

    return <Text isSubdued>{`${operator} ${formatMeasure(threshold, metric.type)}`}</Text>;
  };

  render() {
    const { condition, component, branchLike } = this.props;
    const { measure } = condition;
    const metric = this.getMetric();
    const actual = (condition.period ? measure.period?.value : measure.value) as string;

    return this.wrapWithLink(
      <div className="sw-flex sw-items-center sw-p-2">
        <MeasureIndicator
          branchLike={branchLike}
          className="sw-flex sw-justify-center sw-w-6 sw-mx-4"
          componentKey={component.key}
          decimals={2}
          forceRatingMetric
          metricKey={metric.key}
          metricType={metric.type}
          value={actual}
        />
        <div className="sw-flex sw-flex-col sw-text-sm">
          <div className="sw-flex sw-items-center">
            <IssueTypeIcon className="sw-mr-2" type={metric.key} />
            <span className="sw-typo-semibold sw-text-ellipsis sw-max-w-abs-300">
              {this.getPrimaryText()}
            </span>
          </div>
          {this.getSecondaryText(metric)}
        </div>
      </div>,
    );
  }
}

export default withMetricsContext(QualityGateCondition);
