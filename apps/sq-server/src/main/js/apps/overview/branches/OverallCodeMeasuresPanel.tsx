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

import { RatingBadgeSize, Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { NoDataIcon, SnoozeCircleIcon, getTabPanelId } from '~design-system';
import {
  GridContainer,
  StyleMeasuresCard,
  StyledConditionsCard,
} from '~shared/components/overview/BranchSummaryStyles';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication } from '~shared/helpers/component';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MeasureEnhanced } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import MeasuresCard from '~sq-server-commons/components/overview/MeasuresCard';
import { MeasuresCardDependencyRisk } from '~sq-server-commons/components/overview/MeasuresCardDependencyRisk';
import MeasuresCardNumber from '~sq-server-commons/components/overview/MeasuresCardNumber';
import MeasuresCardPercent from '~sq-server-commons/components/overview/MeasuresCardPercent';
import RatingComponent from '~sq-server-commons/context/metrics/RatingComponent';
import { findMeasure, isDiffMetric } from '~sq-server-commons/helpers/measures';
import { CodeScope, getComponentDrilldownUrl } from '~sq-server-commons/helpers/urls';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import {
  getComponentIssuesUrl,
  getComponentSecurityHotspotsUrl,
} from '~sq-server-commons/sonar-aligned/helpers/urls';
import { Branch } from '~sq-server-commons/types/branch-like';
import { IssueStatus } from '~sq-server-commons/types/issues';
import { QualityGateStatus } from '~sq-server-commons/types/quality-gates';
import { Component, QualityGate } from '~sq-server-commons/types/types';
import { MeasurementType, getMeasurementMetricKey } from '~sq-server-commons/utils/overview-utils';
import { IssuesInSandboxSection } from './issues-sandbox/IssuesInSandboxSection';
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
  const dependencyRiskCount = findMeasure(measures, MetricKey.sca_count_any_issue)?.value;
  const dependencyRiskRating = findMeasure(measures, MetricKey.sca_rating_any_issue)?.value;

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
            measures={measures}
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
          <Text className="sw-mt-3" isSubtle size="small">
            {intl.formatMessage({
              id: 'overview.accepted_issues.help',
            })}
          </Text>
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
                size={RatingBadgeSize.Medium}
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
      <MeasuresCardDependencyRisk
        branchLike={branch}
        component={component}
        conditions={conditions}
        countMetricKey={MetricKey.sca_count_any_issue}
        dependencyRiskCount={dependencyRiskCount}
        dependencyRiskRating={dependencyRiskRating}
        ratingMetricKey={MetricKey.sca_rating_any_issue}
      />
      <IssuesInSandboxSection measures={measures} />
    </GridContainer>
  );
}
