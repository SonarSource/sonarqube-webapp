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

import { Heading, Link, LinkHighlight, Text, TextSize } from '@sonarsource/echoes-react';
import { SizeIndicator } from '~design-system';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { localizeMetric } from '~sq-server-shared/helpers/measures';
import { getComponentDrilldownUrl } from '~sq-server-shared/helpers/urls';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey, MetricType } from '~sq-server-shared/sonar-aligned/types/metrics';
import { Component, Measure } from '~sq-server-shared/types/types';

interface MetaSizeProps {
  component: Component;
  measures: Measure[];
}

export default function MetaSize({ component, measures }: MetaSizeProps) {
  const isApp = component.qualifier === ComponentQualifier.Application;
  const ncloc = measures.find((measure) => measure.metric === MetricKey.ncloc);
  const projects = isApp
    ? measures.find((measure) => measure.metric === MetricKey.projects)
    : undefined;
  const url = getComponentDrilldownUrl({
    componentKey: component.key,
    metric: MetricKey.ncloc,
    listView: true,
  });

  return (
    <>
      <div className="sw-mb-2 sw-flex sw-items-baseline">
        <Heading as="h3">{localizeMetric(MetricKey.ncloc)}</Heading>
        <span className="sw-ml-1">({translate('project.info.main_branch')})</span>
      </div>
      <div className="sw-flex sw-items-center">
        {ncloc?.value ? (
          <>
            <Text size={TextSize.Large}>
              <Link
                aria-label={translateWithParameters(
                  'project.info.see_more_info_on_x_locs',
                  ncloc.value,
                )}
                highlight={LinkHighlight.Default}
                to={url}
              >
                {formatMeasure(ncloc.value, MetricType.ShortInteger)}
              </Link>
            </Text>

            <span className="sw-ml-2">
              <SizeIndicator size="xs" value={Number(ncloc.value)} />
            </span>
          </>
        ) : (
          <span>0</span>
        )}

        {isApp && (
          <span className="sw-inline-flex sw-items-center sw-ml-10">
            {projects ? (
              <Text size={TextSize.Large}>
                <Link highlight={LinkHighlight.Default} to={url}>
                  {formatMeasure(projects.value, MetricType.ShortInteger)}
                </Link>
              </Text>
            ) : (
              <span>0</span>
            )}
            <Text className="sw-ml-1" isSubdued>
              {translate('metric.projects.name')}
            </Text>
          </span>
        )}
      </div>
    </>
  );
}
