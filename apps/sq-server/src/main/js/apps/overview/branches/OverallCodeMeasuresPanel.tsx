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

import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { NoDataIcon, SnoozeCircleIcon, TextSubdued, getTabPanelId } from '~design-system';
import {
  GridContainer,
  StyleMeasuresCard,
  StyledConditionsCard,
} from '~sq-server-shared/components/overview/BranchSummaryStyles';
import MeasuresCard from '~sq-server-shared/components/overview/MeasuresCard';
import MeasuresCardNumber from '~sq-server-shared/components/overview/MeasuresCardNumber';
import MeasuresCardPercent from '~sq-server-shared/components/overview/MeasuresCardPercent';
import RatingComponent from '~sq-server-shared/context/metrics/RatingComponent';
import { findMeasure, isDiffMetric } from '~sq-server-shared/helpers/measures';
import { CodeScope, getComponentDrilldownUrl } from '~sq-server-shared/helpers/urls';
import { getBranchLikeQuery } from '~sq-server-shared/sonar-aligned/helpers/branch-like';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import {
  getComponentIssuesUrl,
  getComponentSecurityHotspotsUrl,
} from '~sq-server-shared/sonar-aligned/helpers/urls';
import { MetricKey, MetricType } from '~sq-server-shared/sonar-aligned/types/metrics';
import { Branch } from '~sq-server-shared/types/branch-like';
import { SoftwareQuality } from '~sq-server-shared/types/clean-code-taxonomy';
import { isApplication } from '~sq-server-shared/types/component';
import { IssueStatus } from '~sq-server-shared/types/issues';
import { QualityGateStatus } from '~sq-server-shared/types/quality-gates';
import { Component, MeasureEnhanced, QualityGate } from '~sq-server-shared/types/types';
import { MeasurementType, getMeasurementMetricKey } from '~sq-server-shared/utils/overview-utils';
import QualityGatePanel from './QualityGatePanel';
import SoftwareImpactMeasureCard from './SoftwareImpactMeasureCard';

export interface OverallCodeMeasuresPanelProps {
  branch?: Branch;
  component: Component;
  loading?: boolean;
  measures: MeasureEnhanced[];
  qgStatuses?: QualityGateStatus[];
  qualityGate?: QualityGate;
}

export default function OverallCodeMeasuresPanel(props: Readonly<OverallCodeMeasuresPanelProps>) {
  const { branch, qgStatuses, component, measures, loading, qualityGate } = props;

  const intl = useIntl();

  const isApp = isApplication(component.qualifier);
  const conditions = qgStatuses?.flatMap((qg) => qg.conditions) ?? [];
  const totalFailedCondition = qgStatuses?.flatMap((qg) => qg.failedConditions) ?? [];
  const totalOverallFailedCondition = totalFailedCondition.filter((c) => !isDiffMetric(c.metric));
  const acceptedIssues = findMeasure(measures, MetricKey.accepted_issues)?.value;
  const securityHotspots = findMeasure(measures, MetricKey.security_hotspots)?.value;
  const securityRating = findMeasure(measures, MetricKey.security_review_rating)?.value;

  const noConditionsAndWarningForOverallCode = totalOverallFailedCondition.length === 0;

  return (
    <GridContainer
      className={classNames('sw-grid sw-gap-12 sw-relative sw-overflow-hidden js-summary', {
        'sw-grid-cols-3': noConditionsAndWarningForOverallCode,
        'sw-grid-cols-4': !noConditionsAndWarningForOverallCode,
      })}
      id={getTabPanelId(CodeScope.Overall)}
    >
      {!noConditionsAndWarningForOverallCode && (
        <StyledConditionsCard className="sw-row-span-4">
          <QualityGatePanel
            component={component}
            loading={loading}
            qgStatuses={qgStatuses}
            qualityGate={qualityGate}
            totalFailedConditionLength={totalOverallFailedCondition.length}
          />
        </StyledConditionsCard>
      )}
      <StyleMeasuresCard>
        <SoftwareImpactMeasureCard
          branch={branch}
          component={component}
          conditions={conditions}
          measures={measures}
          ratingMetricKey={MetricKey.security_rating}
          softwareQuality={SoftwareQuality.Security}
        />
      </StyleMeasuresCard>
      <StyleMeasuresCard>
        <SoftwareImpactMeasureCard
          branch={branch}
          component={component}
          conditions={conditions}
          measures={measures}
          ratingMetricKey={MetricKey.reliability_rating}
          softwareQuality={SoftwareQuality.Reliability}
        />
      </StyleMeasuresCard>
      <StyleMeasuresCard>
        <SoftwareImpactMeasureCard
          branch={branch}
          component={component}
          conditions={conditions}
          measures={measures}
          ratingMetricKey={MetricKey.sqale_rating}
          softwareQuality={SoftwareQuality.Maintainability}
        />
      </StyleMeasuresCard>
      <StyleMeasuresCard>
        <MeasuresCard
          failed={false}
          icon={
            <SnoozeCircleIcon
              color={acceptedIssues === '0' ? 'overviewCardDefaultIcon' : 'overviewCardWarningIcon'}
            />
          }
          label="overview.accepted_issues"
          metric={MetricKey.accepted_issues}
          url={getComponentIssuesUrl(component.key, {
            ...getBranchLikeQuery(branch),
            issueStatuses: IssueStatus.Accepted,
          })}
          value={formatMeasure(acceptedIssues, MetricType.ShortInteger)}
        >
          <TextSubdued className="sw-typo-sm sw-mt-3">
            {intl.formatMessage({
              id: 'overview.accepted_issues.help',
            })}
          </TextSubdued>
        </MeasuresCard>
      </StyleMeasuresCard>
      <StyleMeasuresCard>
        <MeasuresCardPercent
          branchLike={branch}
          componentKey={component.key}
          conditionMetric={MetricKey.coverage}
          conditions={conditions}
          label="overview.quality_gate.coverage"
          linesMetric={MetricKey.lines_to_cover}
          measurementType={MeasurementType.Coverage}
          measures={measures}
          showRequired={!isApp}
          url={getComponentDrilldownUrl({
            componentKey: component.key,
            metric: getMeasurementMetricKey(MeasurementType.Coverage, false),
            branchLike: branch,
            listView: true,
          })}
        />
      </StyleMeasuresCard>
      <StyleMeasuresCard>
        <MeasuresCardPercent
          branchLike={branch}
          componentKey={component.key}
          conditionMetric={MetricKey.duplicated_lines_density}
          conditions={conditions}
          label="overview.quality_gate.duplications"
          linesMetric={MetricKey.lines}
          measurementType={MeasurementType.Duplication}
          measures={measures}
          showRequired={!isApp}
          url={getComponentDrilldownUrl({
            componentKey: component.key,
            metric: getMeasurementMetricKey(MeasurementType.Duplication, false),
            branchLike: branch,
            listView: true,
          })}
        />
      </StyleMeasuresCard>
      <StyleMeasuresCard>
        <MeasuresCardNumber
          conditionMetric={MetricKey.security_hotspots_reviewed}
          conditions={conditions}
          icon={
            securityRating ? (
              <RatingComponent
                branchLike={branch}
                componentKey={component.key}
                getLabel={(rating) =>
                  intl.formatMessage({ id: 'metric.has_rating_X' }, { 0: rating })
                }
                getTooltip={(rating) =>
                  intl.formatMessage({ id: `metric.security_review_rating.tooltip.${rating}` })
                }
                ratingMetric={MetricKey.security_review_rating}
                size="md"
              />
            ) : (
              <NoDataIcon size="md" />
            )
          }
          label={
            securityHotspots === '1'
              ? 'issue.type.SECURITY_HOTSPOT'
              : 'issue.type.SECURITY_HOTSPOT.plural'
          }
          metric={MetricKey.security_hotspots}
          showRequired={!isApp}
          url={getComponentSecurityHotspotsUrl(component.key, branch)}
          value={securityHotspots}
        />
      </StyleMeasuresCard>
    </GridContainer>
  );
}
