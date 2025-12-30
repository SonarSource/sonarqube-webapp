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

import { LinkHighlight, LinkStandalone, Text, TextSize } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { To } from 'react-router-dom';
import { isMainBranch, isPullRequest } from '~shared/helpers/branch-like';
import { isDefined } from '~shared/helpers/types';
import { MeasureEnhanced } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CoverageIndicator, DuplicationsIndicator } from '../../design-system';
import { DocLink } from '../../helpers/doc-links';
import { findMeasure, localizeMetric } from '../../helpers/measures';
import { getComponentDrilldownUrl } from '../../helpers/urls';
import { formatMeasure } from '../../sonar-aligned/helpers/measures';
import { BranchLike } from '../../types/branch-like';
import { QualityGateStatusConditionEnhanced } from '../../types/quality-gates';
import {
  MeasurementType,
  QGStatusEnum,
  getConditionRequiredLabel,
  getMeasurementMetricKey,
} from '../../utils/overview-utils';
import DocumentationLink from '../common/DocumentationLink';
import { duplicationRatingConverter, getLeakValue } from '../measure/utils';
import AfterMergeNote from './AfterMergeNote';
import MeasuresCard from './MeasuresCard';

interface Props {
  branchLike?: BranchLike;
  componentKey: string;
  conditionMetric: MetricKey;
  conditions: QualityGateStatusConditionEnhanced[];
  label: string;
  linesMetric: MetricKey;
  measurementType: MeasurementType;
  measures: MeasureEnhanced[];
  overallConditionMetric?: MetricKey;
  showRequired?: boolean;
  url: To;
  useDiffMetric?: boolean;
}

export default function MeasuresCardPercent(
  props: Readonly<React.PropsWithChildren<Props & React.HTMLAttributes<HTMLDivElement>>>,
) {
  const {
    componentKey,
    branchLike,
    measurementType,
    label,
    url,
    measures,
    conditions,
    conditionMetric,
    overallConditionMetric,
    linesMetric,
    useDiffMetric = false,
    showRequired = false,
  } = props;

  const intl = useIntl();

  const metricKey = getMeasurementMetricKey(measurementType, useDiffMetric);
  const value = useDiffMetric
    ? getLeakValue(findMeasure(measures, metricKey))
    : findMeasure(measures, metricKey)?.value;
  const linesValue = useDiffMetric
    ? getLeakValue(findMeasure(measures, linesMetric))
    : findMeasure(measures, linesMetric)?.value;
  const linesLabel = `overview.${metricKey}.on_x_new_lines`;
  const linesUrl = getComponentDrilldownUrl({
    componentKey,
    metric: linesMetric,
    branchLike,
    listView: true,
  });

  const condition = conditions.find((c) => c.metric === conditionMetric);
  const conditionFailed = condition?.level === QGStatusEnum.ERROR;
  const shouldRenderRequiredLabel = showRequired && condition;
  const formattedMeasure = formatMeasure(linesValue ?? '0', MetricType.ShortInteger);

  return (
    <MeasuresCard
      failed={conditionFailed}
      icon={renderIcon(measurementType, value)}
      label={label}
      metric={metricKey}
      url={url}
      value={formatMeasure(value, MetricType.Percent, { decimals: 2, omitExtraDecimalZeros: true })}
    >
      {shouldRenderRequiredLabel && (
        <span className="sw-typo-sm sw-mt-3">
          {conditionFailed ? (
            <Text className="sw-font-regular sw-inline" colorOverride="echoes-color-text-danger">
              {getConditionRequiredLabel(condition, intl, true)}
            </Text>
          ) : (
            <Text isSubtle>{getConditionRequiredLabel(condition, intl)}</Text>
          )}
        </span>
      )}
      <div
        className={classNames('sw-flex sw-typo-sm sw-justify-between sw-items-center', {
          'sw-mt-1': shouldRenderRequiredLabel,
          'sw-mt-3': !shouldRenderRequiredLabel,
        })}
      >
        <Text className="sw-flex sw-gap-1" isSubtle size={TextSize.Small}>
          {isDefined(value) ? (
            <FormattedMessage
              id={linesLabel}
              values={{
                link: (
                  <LinkStandalone
                    aria-label={intl.formatMessage(
                      { id: 'overview.see_more_details_on_x_y' },
                      {
                        0: isDefined(linesValue) ? `${formattedMeasure} (${linesValue})` : '0',
                        1: localizeMetric(linesMetric),
                      },
                    )}
                    className="sw-typo-semibold"
                    highlight={LinkHighlight.Default}
                    to={linesUrl}
                  >
                    {formattedMeasure}
                  </LinkStandalone>
                ),
              }}
            />
          ) : (
            <NotComputedLabel {...props} />
          )}
        </Text>
      </div>
      {overallConditionMetric && isPullRequest(branchLike) && (
        <AfterMergeNote measures={measures} overallMetric={overallConditionMetric} />
      )}
    </MeasuresCard>
  );
}

function renderIcon(type: MeasurementType, value?: string) {
  if (type === MeasurementType.Coverage) {
    return <CoverageIndicator aria-hidden="true" size="md" value={value} />;
  }

  const rating = duplicationRatingConverter(Number(value));
  return <DuplicationsIndicator aria-hidden="true" rating={rating} size="md" />;
}

function NotComputedLabel({ measurementType, branchLike, measures }: Readonly<Props>) {
  if (measurementType === MeasurementType.Coverage && isMainBranch(branchLike)) {
    const overallCoverage = findMeasure(measures, MetricKey.coverage);
    const newCoverage = getLeakValue(findMeasure(measures, MetricKey.new_coverage));

    if (!overallCoverage && !newCoverage) {
      return (
        <span>
          <FormattedMessage
            id="overview.coverage.not_computed"
            values={{
              doc: (text) => (
                <DocumentationLink
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={DocLink.TestCoverage}
                >
                  {text}
                </DocumentationLink>
              ),
            }}
          />
        </span>
      );
    }
  }

  return <FormattedMessage id="overview.metric_not_computed" />;
}
