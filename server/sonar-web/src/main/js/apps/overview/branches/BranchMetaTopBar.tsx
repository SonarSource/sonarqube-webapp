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

import { Button, IconSlideshow, IconSparkle } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { Badge, SeparatorCircleIcon } from '~design-system';
import ComponentReportActions from '~sq-server-shared/components/controls/ComponentReportActions';
import HomePageSelect from '~sq-server-shared/components/controls/HomePageSelect';
import Tooltip from '~sq-server-shared/components/controls/Tooltip';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { translate } from '~sq-server-shared/helpers/l10n';
import { findMeasure } from '~sq-server-shared/helpers/measures';
import { useProjectContainsAiCodeQuery } from '~sq-server-shared/queries/ai-code-assurance';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey, MetricType } from '~sq-server-shared/sonar-aligned/types/metrics';
import { Branch } from '~sq-server-shared/types/branch-like';
import { Feature } from '~sq-server-shared/types/features';
import { Component, MeasureEnhanced } from '~sq-server-shared/types/types';
import { HomePage } from '~sq-server-shared/types/users';
import { getCurrentPage } from '../../../app/components/nav/component/utils';

interface Props {
  branch: Branch;
  component: Component;
  measures: MeasureEnhanced[];
  showTakeTheTourButton: boolean;
  startTour?: () => void;
}

export default function BranchMetaTopBar({
  branch,
  measures,
  component,
  showTakeTheTourButton,
  startTour,
}: Readonly<Props>) {
  const { hasFeature } = useAvailableFeatures();
  const { data: containsAiCode } = useProjectContainsAiCodeQuery(
    {
      project: component,
    },
    {
      enabled:
        component.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    },
  );

  const intl = useIntl();

  const currentPage = getCurrentPage(component, branch) as HomePage;
  const locMeasure = findMeasure(measures, MetricKey.ncloc);

  const leftSection = (
    <div className="sw-flex sw-items-center">
      <h1 className="sw-flex sw-gap-2 sw-items-center sw-heading-lg">{branch.name}</h1>
      {containsAiCode && (
        <Tooltip content={translate('projects.ai_code.tooltip.content')}>
          <span>
            <Badge className="sw-ml-3">
              <IconSparkle className="sw-mr-1 sw-fon" />
              {translate('contains_ai_code')}
            </Badge>
          </span>
        </Tooltip>
      )}
    </div>
  );
  const rightSection = (
    <div className="sw-flex sw-gap-2 sw-items-center">
      {locMeasure && (
        <>
          <div className="sw-flex sw-items-center sw-gap-1">
            <strong>{formatMeasure(locMeasure.value, MetricType.ShortInteger)}</strong>
            {intl.formatMessage({ id: 'metric.ncloc.name' })}
          </div>
          <SeparatorCircleIcon />
        </>
      )}
      {component.version && (
        <>
          <div className="sw-flex sw-items-center sw-gap-1">
            {intl.formatMessage({ id: 'version_x' }, { '0': <strong>{component.version}</strong> })}
          </div>
          <SeparatorCircleIcon />
        </>
      )}
      <HomePageSelect currentPage={currentPage} type="button" />
      <ComponentReportActions component={component} branch={branch} />
      {showTakeTheTourButton && (
        <Tooltip content={translate('overview.promoted_section.button_tooltip')}>
          <Button
            className="sw-pl-4 sw-shrink-0"
            data-spotlight-id="take-tour-1"
            onClick={startTour}>
            <IconSlideshow className="sw-mr-1" />
            {translate('overview.promoted_section.button_primary')}
          </Button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <div className="sw-flex sw-justify-between sw-whitespace-nowrap sw-typo-default sw-mb-2">
      {leftSection}
      {rightSection}
    </div>
  );
}
