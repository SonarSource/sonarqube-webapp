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

import { LinkStandalone, RatingBadgeSize } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import LanguageDistribution from '~sq-server-shared/components/charts/LanguageDistribution';
import Tooltip from '~sq-server-shared/components/controls/Tooltip';
import { getLocalizedMetricName, translate } from '~sq-server-shared/helpers/l10n';
import { isDiffMetric } from '~sq-server-shared/helpers/measures';
import { getMeasureHistoryUrl } from '~sq-server-shared/helpers/urls';
import Measure from '~sq-server-shared/sonar-aligned/components/measure/Measure';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import {
  ComponentMeasure,
  Metric,
  Period,
  Measure as TypeMeasure,
} from '~sq-server-shared/types/types';
import { getMetricSubnavigationName, hasFullMeasures } from '../utils';
import LeakPeriodLegend from './LeakPeriodLegend';

interface Props {
  branchLike?: BranchLike;
  component: ComponentMeasure;
  leakPeriod?: Period;
  measureValue?: string;
  metric: Metric;
  secondaryMeasure?: TypeMeasure;
}

export default function MeasureHeader(props: Readonly<Props>) {
  const { branchLike, component, leakPeriod, measureValue, metric, secondaryMeasure } = props;
  const isDiff = isDiffMetric(metric.key);
  const hasHistory =
    [
      ComponentQualifier.Portfolio,
      ComponentQualifier.SubPortfolio,
      ComponentQualifier.Application,
      ComponentQualifier.Project,
    ].includes(component.qualifier as ComponentQualifier) && hasFullMeasures(branchLike);
  const displayLeak = hasFullMeasures(branchLike);
  const title = getMetricSubnavigationName(metric, getLocalizedMetricName, isDiff);

  return (
    <div className="sw-mb-4">
      <div className="sw-flex sw-items-center sw-justify-between sw-gap-4">
        <div className="it__measure-details-metric sw-flex sw-items-center sw-gap-1">
          <strong className="sw-typo-lg-semibold">{title}</strong>

          <div className="sw-flex sw-items-center sw-ml-2">
            <Measure
              badgeSize={RatingBadgeSize.Small}
              branchLike={branchLike}
              className={classNames('it__measure-details-value sw-typo-lg')}
              componentKey={component.key}
              metricKey={metric.key}
              metricType={metric.type}
              value={measureValue}
            />
          </div>

          {!isDiff && hasHistory && (
            <Tooltip content={translate('component_measures.show_metric_history')}>
              <span className="sw-ml-4">
                <LinkStandalone
                  className="it__show-history-link sw-font-semibold"
                  to={getMeasureHistoryUrl(component.key, metric.key, branchLike)}
                >
                  {translate('component_measures.see_metric_history')}
                </LinkStandalone>
              </span>
            </Tooltip>
          )}
        </div>
        {displayLeak && leakPeriod && (
          <LeakPeriodLegend component={component} period={leakPeriod} />
        )}
      </div>
      {secondaryMeasure &&
        secondaryMeasure.metric === MetricKey.ncloc_language_distribution &&
        secondaryMeasure.value !== undefined && (
          <div className="sw-inline-block sw-mt-2">
            <LanguageDistribution distribution={secondaryMeasure.value} />
          </div>
        )}
    </div>
  );
}
