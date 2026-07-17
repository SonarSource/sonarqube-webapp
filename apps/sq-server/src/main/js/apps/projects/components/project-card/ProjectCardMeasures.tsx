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

import { Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { CoverageIndicator, DuplicationsIndicator } from '~design-system';
import { getProjectCardMeasureList } from '~shared/helpers/projectCardMeasures';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { duplicationRatingConverter } from '~sq-server-commons/components/measure/utils';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import RatingComponent from '~sq-server-commons/context/metrics/RatingComponent';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import Measure from '~sq-server-commons/sonar-aligned/components/measure/Measure';
import { Feature } from '~sq-server-commons/types/features';
import ProjectCardMeasure from './ProjectCardMeasure';

export interface ProjectCardMeasuresProps {
  componentKey: string;
  componentQualifier: ComponentQualifier;
  isNewCode: boolean;
  measures: Record<string, string | undefined>;
}

export default function ProjectCardMeasures(props: Readonly<ProjectCardMeasuresProps>) {
  const { formatMessage } = useIntl();
  const { isNewCode, measures, componentKey, componentQualifier } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const { hasFeature } = useAvailableFeatures();

  const { ncloc } = measures;

  if (!isNewCode && !ncloc) {
    return (
      <Text className="sw-py-4" isSubtle>
        {componentQualifier === ComponentQualifier.Application
          ? formatMessage({ id: 'portfolio.app.empty' })
          : formatMessage({ id: 'overview.project.main_branch_empty' })}
      </Text>
    );
  }

  const coverageMetric = isNewCode ? MetricKey.new_coverage : MetricKey.coverage;
  const duplicationMetric = isNewCode
    ? MetricKey.new_duplicated_lines_density
    : MetricKey.duplicated_lines_density;
  const duplicationRating =
    measures[duplicationMetric] !== undefined
      ? duplicationRatingConverter(Number(measures[duplicationMetric]))
      : undefined;

  const measureList = getProjectCardMeasureList({
    isNewCode,
    measures,
    isStandardMode: Boolean(isStandardMode),
    isScaEnabled: hasFeature(Feature.Sca),
  });

  return (
    <div className="sw-flex sw-items-center sw-gap-6">
      {measureList.map(({ labelKey, metricKey, metricRatingKey, metricType }) => (
        <ProjectCardMeasure
          key={metricKey}
          label={formatMessage({ id: labelKey })}
          metricKey={metricKey}
        >
          {metricRatingKey && (
            <RatingComponent componentKey={componentKey} ratingMetric={metricRatingKey} />
          )}
          <Measure
            className="sw-ml-2 sw-typo-lg-semibold"
            componentKey={componentKey}
            metricKey={metricKey}
            metricType={metricType}
            value={measures[metricKey]}
          />
        </ProjectCardMeasure>
      ))}
      <ProjectCardMeasure
        label={formatMessage({ id: 'metric.coverage.name' })}
        metricKey={coverageMetric}
      >
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
      <ProjectCardMeasure
        label={formatMessage({ id: 'metric.duplicated_lines_density.short_name' })}
        metricKey={duplicationMetric}
      >
        <div>
          {measures[duplicationMetric] != null && (
            <DuplicationsIndicator rating={duplicationRating} />
          )}
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
    </div>
  );
}
