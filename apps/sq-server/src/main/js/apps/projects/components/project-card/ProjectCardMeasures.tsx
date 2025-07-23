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

import * as React from 'react';
import {
  CoverageIndicator,
  DuplicationsIndicator,
  Note,
  PageContentFontWrapper,
} from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { duplicationRatingConverter } from '~sq-server-commons/components/measure/utils';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import RatingComponent from '~sq-server-commons/context/metrics/RatingComponent';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import Measure from '~sq-server-commons/sonar-aligned/components/measure/Measure';
import { Feature } from '~sq-server-commons/types/features';
import ProjectCardMeasure from './ProjectCardMeasure';

export interface ProjectCardMeasuresProps {
  // eslint-disable-next-line react/no-unused-prop-types
  componentKey: string;
  componentQualifier: ComponentQualifier;
  isNewCode: boolean;
  measures: Record<string, string | undefined>;
}

function renderNewIssues(props: ProjectCardMeasuresProps) {
  const { measures, isNewCode, componentKey } = props;

  if (!isNewCode) {
    return null;
  }

  return (
    <ProjectCardMeasure
      label={translate(`metric.${MetricKey.new_violations}.description`)}
      metricKey={MetricKey.new_violations}
    >
      <Measure
        className="sw-ml-2 sw-typo-lg-semibold"
        componentKey={componentKey}
        metricKey={MetricKey.new_violations}
        metricType={MetricType.ShortInteger}
        value={measures[MetricKey.new_violations]}
      />
    </ProjectCardMeasure>
  );
}

function renderCoverage(props: ProjectCardMeasuresProps) {
  const { measures, isNewCode, componentKey } = props;
  const coverageMetric = isNewCode ? MetricKey.new_coverage : MetricKey.coverage;

  return (
    <ProjectCardMeasure label={translate('metric.coverage.name')} metricKey={coverageMetric}>
      <div>
        {measures[coverageMetric] && <CoverageIndicator value={measures[coverageMetric]} />}
        <Measure
          className="sw-ml-2 sw-typo-lg-semibold"
          componentKey={componentKey}
          decimals={2}
          metricKey={coverageMetric}
          metricType={MetricType.Percent}
          value={measures[coverageMetric]}
        />
      </div>
    </ProjectCardMeasure>
  );
}

function renderDuplication(props: ProjectCardMeasuresProps) {
  const { measures, isNewCode, componentKey } = props;
  const duplicationMetric = isNewCode
    ? MetricKey.new_duplicated_lines_density
    : MetricKey.duplicated_lines_density;

  const rating =
    measures[duplicationMetric] !== undefined
      ? duplicationRatingConverter(Number(measures[duplicationMetric]))
      : undefined;

  return (
    <ProjectCardMeasure
      label={translate('metric.duplicated_lines_density.short_name')}
      metricKey={duplicationMetric}
    >
      <div>
        {measures[duplicationMetric] != null && <DuplicationsIndicator rating={rating} />}
        <Measure
          className="sw-ml-2 sw-typo-lg-semibold"
          componentKey={componentKey}
          decimals={2}
          metricKey={duplicationMetric}
          metricType={MetricType.Percent}
          value={measures[duplicationMetric]}
        />
      </div>
    </ProjectCardMeasure>
  );
}

function renderRatings(
  props: ProjectCardMeasuresProps,
  isStandardMode: boolean,
  renderSCA: boolean,
) {
  const { isNewCode, measures, componentKey } = props;

  const measuresByCodeLeak = isNewCode
    ? []
    : [
        {
          iconLabel: translate(
            `metric.${isStandardMode ? MetricKey.vulnerabilities : MetricKey.software_quality_security_issues}.short_name`,
          ),
          noShrink: true,
          metricKey:
            isStandardMode || measures[MetricKey.software_quality_security_issues] === undefined
              ? MetricKey.vulnerabilities
              : MetricKey.software_quality_security_issues,
          metricRatingKey: MetricKey.security_rating,
          metricType: MetricType.ShortInteger,
        },
        {
          iconLabel: translate(
            `metric.${isStandardMode ? MetricKey.bugs : MetricKey.software_quality_reliability_issues}.short_name`,
          ),
          metricKey:
            isStandardMode || measures[MetricKey.software_quality_reliability_issues] === undefined
              ? MetricKey.bugs
              : MetricKey.software_quality_reliability_issues,
          metricRatingKey: MetricKey.reliability_rating,
          metricType: MetricType.ShortInteger,
        },
        {
          iconLabel: translate(
            `metric.${isStandardMode ? MetricKey.code_smells : MetricKey.software_quality_maintainability_issues}.short_name`,
          ),
          metricKey:
            isStandardMode ||
            measures[MetricKey.software_quality_maintainability_issues] === undefined
              ? MetricKey.code_smells
              : MetricKey.software_quality_maintainability_issues,
          metricRatingKey: MetricKey.sqale_rating,
          metricType: MetricType.ShortInteger,
        },
      ];

  const measureList = [
    ...measuresByCodeLeak,
    {
      iconKey: MetricKey.security_hotspots,
      iconLabel: translate('projects.security_hotspots_reviewed'),
      metricKey: isNewCode
        ? MetricKey.new_security_hotspots_reviewed
        : MetricKey.security_hotspots_reviewed,
      metricRatingKey: isNewCode
        ? MetricKey.new_security_review_rating
        : MetricKey.security_review_rating,
      metricType: MetricType.Percent,
    },
  ];

  if (renderSCA) {
    measureList.push({
      iconLabel: translate('dependencies.risks'),
      noShrink: true,
      metricKey: isNewCode ? MetricKey.new_sca_count_any_issue : MetricKey.sca_count_any_issue,
      metricRatingKey: isNewCode
        ? MetricKey.new_sca_rating_any_issue
        : MetricKey.sca_rating_any_issue,
      metricType: MetricType.ShortInteger,
    });
  }

  return measureList.map((measure) => {
    const { iconLabel, metricKey, metricRatingKey, metricType } = measure;

    return (
      <ProjectCardMeasure key={metricKey} label={iconLabel} metricKey={metricKey}>
        <RatingComponent componentKey={componentKey} ratingMetric={metricRatingKey} />
        <Measure
          className="sw-ml-2 sw-typo-lg-semibold"
          componentKey={componentKey}
          metricKey={metricKey}
          metricType={metricType}
          value={measures[metricKey]}
        />
      </ProjectCardMeasure>
    );
  });
}

export default function ProjectCardMeasures(props: ProjectCardMeasuresProps) {
  const { isNewCode, measures, componentQualifier } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const { hasFeature } = useAvailableFeatures();

  const { ncloc } = measures;

  if (!isNewCode && !ncloc) {
    return (
      <Note className="sw-py-4">
        {componentQualifier === ComponentQualifier.Application
          ? translate('portfolio.app.empty')
          : translate('overview.project.main_branch_empty')}
      </Note>
    );
  }

  const measureList = [
    renderNewIssues(props),
    ...renderRatings(props, !!isStandardMode, hasFeature(Feature.Sca)),
    renderCoverage(props),
    renderDuplication(props),
  ].filter(isDefined);

  return (
    <PageContentFontWrapper className="sw-flex sw-items-center sw-gap-6">
      {measureList.map((measure, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={i}>{measure}</React.Fragment>
      ))}
    </PageContentFontWrapper>
  );
}
