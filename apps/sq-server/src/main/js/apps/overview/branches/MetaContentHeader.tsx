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

import { Badge, IconSparkle, Tooltip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { SeparatorCircleIcon } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import { MeasureEnhanced } from '~shared/types/measures';
import { MetricKey, MetricType } from '~shared/types/metrics';
import LastAnalysisLabel from '~sq-server-commons/components/overview/LastAnalysisLabel';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { findMeasure } from '~sq-server-commons/helpers/measures';
import { useProjectContainsAiCodeQuery } from '~sq-server-commons/queries/ai-code-assurance';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { Branch } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { MetaUnboundBadge } from './MetaUnboundBadge';

interface Props {
  branch?: Branch;
  component: Component;
  measures: MeasureEnhanced[];
}

export default function MetaContentHeader({ branch, measures, component }: Readonly<Props>) {
  const { hasFeature } = useAvailableFeatures();
  const { data: containsAiCode } = useProjectContainsAiCodeQuery(
    { project: component },
    {
      enabled:
        component.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    },
  );

  const locMeasure = findMeasure(measures, MetricKey.ncloc);

  return (
    <>
      <MetaUnboundBadge component={component} />
      <SeparatorCircleIcon />

      {containsAiCode && (
        <>
          <Tooltip content={<FormattedMessage id="projects.ai_code.tooltip.content" />}>
            <Badge IconLeft={IconSparkle} className="sw-ml-3" isInteractive variety="neutral">
              <FormattedMessage id={MetricKey.contains_ai_code} />
            </Badge>
          </Tooltip>
          <SeparatorCircleIcon />
        </>
      )}

      {locMeasure && (
        <>
          <span>
            {formatMeasure(locMeasure.value, MetricType.ShortInteger)}{' '}
            <FormattedMessage id="metric.ncloc.name" />
          </span>
          <SeparatorCircleIcon />
        </>
      )}

      {component.version && (
        <>
          <span>
            <FormattedMessage
              id="version_x"
              values={{
                '0': component.version,
              }}
            />
          </span>
          <SeparatorCircleIcon />
        </>
      )}

      {branch?.analysisDate && (
        <>
          <LastAnalysisLabel analysisDate={branch.analysisDate} />
          <SeparatorCircleIcon />
        </>
      )}
    </>
  );
}
