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

import { IconInfo, Tooltip } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { ContentCell, NumericalCell, TableRowInteractive } from '~design-system';
import { Metric } from '~shared/types/measures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { type ComponentMeasure as ComponentMeasureType } from '~sq-server-commons/types/types';
import ComponentMeasure from './ComponentMeasure';

type Props = {
  aicaDisabledMetrics: Metric[];
  aicaEnabledMetrics: Metric[];
  component: ComponentMeasureType;
  expanded?: boolean;
  showAnalysisDate?: boolean;
};

export function SplitPortfolioRatings({
  aicaDisabledMetrics,
  aicaEnabledMetrics,
  component,
  expanded = false,
  showAnalysisDate = false,
}: Readonly<Props>) {
  return (
    <>
      <AggregateRatingRow
        component={component}
        expanded={expanded}
        metrics={aicaEnabledMetrics}
        showAnalysisDate={showAnalysisDate}
        type={AggregateRatingType.AicaEnabled}
      />
      <AggregateRatingRow
        component={component}
        expanded={expanded}
        metrics={aicaDisabledMetrics}
        showAnalysisDate={showAnalysisDate}
        type={AggregateRatingType.AicaDisabled}
      />
    </>
  );
}

export enum AggregateRatingType {
  /**
   * Indicates that the ratings are for projects with AI code Assurance enabled.
   */
  AicaEnabled = 'AicaEnabled',
  /**
   * Indicates that the ratings are for projects with AI code Assurance disabled.
   */
  AicaDisabled = 'AicaDisabled',
}

export const RowIds = {
  [AggregateRatingType.AicaDisabled]: 'split-portfolio-ratings-row-aica-disabled',
  [AggregateRatingType.AicaEnabled]: 'split-portfolio-ratings-row-aica-enabled',
};

export type AggregateRatingRowProps = {
  component: ComponentMeasureType;
  expanded: boolean;
  metrics: Metric[];
  showAnalysisDate: boolean;
  type: `${AggregateRatingType}`;
};

export function AggregateRatingRow({
  component,
  expanded,
  metrics,
  showAnalysisDate,
  type,
}: Readonly<AggregateRatingRowProps>) {
  const content = useMemo(() => {
    switch (type) {
      case 'AicaEnabled':
        return translate('code.aica_enabled_projects');
      case 'AicaDisabled':
        return translate('code.aica_disabled_projects');
      default:
        return type satisfies never;
    }
  }, [type]);

  return (
    <TableRowInteractive className={expanded ? '' : 'sw-collapse'} id={RowIds[type]}>
      <ContentCell className="it__code-name-cell sw-overflow-hidden">
        <div className="sw-ml-16 sw-whitespace-nowrap">
          <span className="sw-truncate">{content}</span>
          <InfoIconWithTooltip type={type} />
        </div>
      </ContentCell>

      {metrics.map((metric) => (
        <ComponentMeasure component={component} key={metric.key} metric={metric} />
      ))}

      {showAnalysisDate && <NumericalCell className="sw-whitespace-nowrap" />}
    </TableRowInteractive>
  );
}

type InfoIconWithTooltipProps = {
  type: `${AggregateRatingType}`;
};

function InfoIconWithTooltip({ type }: Readonly<InfoIconWithTooltipProps>) {
  const content = useMemo(() => {
    switch (type) {
      case 'AicaEnabled':
        return translate('code.aica_enabled_projects.tooltip');
      case 'AicaDisabled':
        return translate('code.aica_disabled_projects.tooltip');
      default:
        return type satisfies never;
    }
  }, [type]);

  return (
    <span>
      <Tooltip content={content}>
        <IconInfo aria-describedby="ldjuh_ja" aria-label="info" className="sw-ml-1" />
      </Tooltip>
      <span className="sw-sr-only" id="ldjuh_ja">
        {content}
      </span>
    </span>
  );
}
