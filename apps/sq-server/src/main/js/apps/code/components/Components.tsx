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

import styled from '@emotion/styled';
import { sortBy, times } from 'lodash';
import { useState } from 'react';
import tw from 'twin.macro';
import { ContentCell, Table, TableRow, themeColor } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import { Metric } from '~shared/types/measures';
import withKeyboardNavigation from '~sq-server-commons/components/hoc/withKeyboardNavigation';
import { getComponentMeasureUniqueKey } from '~sq-server-commons/helpers/component';
import { translate } from '~sq-server-commons/helpers/l10n';
import { isAicaDisabledMetric, isAicaEnabledMetric } from '~sq-server-commons/helpers/measures';
import { isPortfolioLike } from '~sq-server-commons/sonar-aligned/helpers/component';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { ComponentMeasure } from '~sq-server-commons/types/types';
import Component from './Component';
import ComponentsEmpty from './ComponentsEmpty';
import ComponentsHeader from './ComponentsHeader';
import { RowIds, SplitPortfolioRatings } from './SplitPortfolioRatings';

interface ComponentsProps {
  aicaDisabledMetrics: Metric[];
  aicaEnabledMetrics: Metric[];
  baseComponent?: ComponentMeasure;
  branchLike?: BranchLike;
  components: ComponentMeasure[];
  metrics: Metric[];
  newCodeSelected?: boolean;
  rootComponent: ComponentMeasure;
  selected?: ComponentMeasure;
  showAnalysisDate?: boolean;
}

function Components(props: ComponentsProps) {
  const {
    aicaDisabledMetrics,
    aicaEnabledMetrics,
    baseComponent,
    branchLike,
    components,
    rootComponent,
    selected,
    metrics,
    newCodeSelected,
    showAnalysisDate,
  } = props;

  const canBePinned =
    baseComponent !== undefined &&
    ![
      ComponentQualifier.Application,
      ComponentQualifier.Portfolio,
      ComponentQualifier.SubPortfolio,
    ].includes(baseComponent.qualifier as ComponentQualifier);

  const columnCount = metrics.length + Number(canBePinned) + Number(showAnalysisDate) + 1;
  const isPortfolio = isPortfolioLike(baseComponent?.qualifier);

  const hasAicaDisabledMetrics =
    isPortfolio &&
    Boolean(baseComponent.measures?.some((measure) => isAicaDisabledMetric(measure.metric)));

  const hasAicaEnabledMetrics =
    isPortfolio &&
    Boolean(baseComponent.measures?.some((measure) => isAicaEnabledMetric(measure.metric)));

  const [splitPortfolioExpanded, setSplitPortfolioExpanded] = useState(
    hasAicaEnabledMetrics && hasAicaDisabledMetrics,
  );

  return (
    <div className="sw-mb-4">
      <Table
        columnCount={columnCount}
        columnWidths={[
          canBePinned ? '1%' : undefined,
          'auto',
          ...times(columnCount - 1, () => '1%'),
        ].filter(isDefined)}
        header={
          baseComponent && (
            <TableRow>
              <ComponentsHeader
                baseComponent={baseComponent}
                canBePinned={canBePinned}
                metrics={metrics.map((metric) => metric.key)}
                rootComponent={rootComponent}
                showAnalysisDate={showAnalysisDate}
                title={isPortfolio ? translate('portfolio.details') : undefined}
              />
            </TableRow>
          )
        }
      >
        {baseComponent && (
          <>
            <Component
              branchLike={branchLike}
              canBePinned={canBePinned}
              component={baseComponent}
              isBaseComponent
              key={baseComponent.key}
              metrics={metrics}
              newCodeSelected={newCodeSelected}
              rootComponent={rootComponent}
              showAnalysisDate={showAnalysisDate}
              {...(hasAicaEnabledMetrics && {
                controls: Object.values(RowIds).join(' '),
                expandable: true,
                expanded: splitPortfolioExpanded,
                setExpanded: setSplitPortfolioExpanded,
              })}
            />
            {
              // Split portfolio ratings are displayed if the base component is portfolio-
              // like and at least one project in the portfolio has AICA enabled.
              hasAicaEnabledMetrics && (
                <SplitPortfolioRatings
                  aicaDisabledMetrics={aicaDisabledMetrics}
                  aicaEnabledMetrics={aicaEnabledMetrics}
                  component={baseComponent}
                  expanded={splitPortfolioExpanded}
                  showAnalysisDate={showAnalysisDate}
                />
              )
            }
            <TableRow>
              <SubHeader className="sw-font-semibold" colSpan={columnCount}>
                {isPortfolio && translate('portfolio.details.breakdown')}
              </SubHeader>
            </TableRow>
          </>
        )}
        {components.length ? (
          sortBy(
            components,
            (c) => c.qualifier,
            (c) => c.name.toLowerCase(),
            (c) => (c.branch ? c.branch.toLowerCase() : ''),
          ).map((component, index, list) => (
            <Component
              branchLike={branchLike}
              canBePinned={canBePinned}
              canBrowse
              component={component}
              key={getComponentMeasureUniqueKey(component)}
              metrics={metrics}
              newCodeSelected={newCodeSelected}
              previous={index > 0 ? list[index - 1] : undefined}
              rootComponent={rootComponent}
              selected={
                selected &&
                getComponentMeasureUniqueKey(component) === getComponentMeasureUniqueKey(selected)
              }
              showAnalysisDate={showAnalysisDate}
            />
          ))
        ) : (
          <ComponentsEmpty />
        )}
      </Table>
    </div>
  );
}

export default withKeyboardNavigation(Components);

const SubHeader = styled(ContentCell)`
  ${tw`sw-font-semibold`}
  color: ${themeColor('pageTitle')}
`;
