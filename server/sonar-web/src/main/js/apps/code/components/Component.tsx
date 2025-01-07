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

import { IconTriangleRight, Spinner } from '@sonarsource/echoes-react';
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';
import { ContentCell, NumericalCell, TableRowInteractive } from '~design-system';
import { ComponentQualifier } from '~sonar-aligned/types/component';
import DateFromNow from '../../../components/intl/DateFromNow';
import { WorkspaceContext } from '../../../components/workspace/context';
import { useComponentDataQuery } from '../../../queries/component';
import { BranchLike } from '../../../types/branch-like';
import { Metric, ComponentMeasure as TypeComponentMeasure } from '../../../types/types';
import ComponentMeasure from './ComponentMeasure';
import ComponentName from './ComponentName';
import ComponentPin from './ComponentPin';

interface Props {
  branchLike?: BranchLike;
  canBePinned?: boolean;
  canBrowse?: boolean;
  component: TypeComponentMeasure;
  controls?: string;
  expandable?: boolean;
  expanded?: boolean;
  isBaseComponent?: boolean;
  metrics: Metric[];
  newCodeSelected?: boolean;
  previous?: TypeComponentMeasure;
  rootComponent: TypeComponentMeasure;
  selected?: boolean;
  setExpanded?: Dispatch<SetStateAction<boolean>>;
  showAnalysisDate?: boolean;
}

export default function Component(props: Props) {
  const {
    branchLike,
    canBePinned = true,
    canBrowse = false,
    component,
    controls,
    expandable = false,
    expanded,
    isBaseComponent = false,
    metrics,
    previous,
    rootComponent,
    selected = false,
    newCodeSelected,
    showAnalysisDate,
    setExpanded,
  } = props;

  const isFile =
    component.qualifier === ComponentQualifier.File ||
    component.qualifier === ComponentQualifier.TestFile;

  const { data: analysisDate, isLoading } = useComponentDataQuery(
    {
      component: component.key,
      branch: component.branch,
    },
    {
      enabled: showAnalysisDate && !isBaseComponent,
      select: (data) => data.component.analysisDate,
    },
  );

  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        setExpanded?.((expanded) => !expanded);
        break;
    }
  };

  return (
    <TableRowInteractive
      aria-controls={controls}
      aria-expanded={expanded}
      aria-label={component.name}
      selected={selected}
      {...(expandable && {
        className: 'sw-cursor-pointer',
        onClick: () => setExpanded?.((expanded) => !expanded),
        onKeyDown,
        tabIndex: 0,
      })}
    >
      {canBePinned && (
        <ContentCell className="sw-py-3">
          {isFile && (
            <WorkspaceContext.Consumer>
              {({ openComponent }) => (
                <ComponentPin
                  branchLike={branchLike}
                  component={component}
                  openComponent={openComponent}
                />
              )}
            </WorkspaceContext.Consumer>
          )}
        </ContentCell>
      )}
      <ContentCell className="it__code-name-cell sw-overflow-hidden">
        {expandable && (
          <IconTriangleRight
            className={`
              motion-safe:sw-transition-transform
              sw-mr-3
              ${expanded ? 'sw-rotate-90' : 'sw-rotate-0'}
            `}
          />
        )}
        <ComponentName
          branchLike={branchLike}
          canBrowse={canBrowse}
          component={component}
          previous={previous}
          rootComponent={rootComponent}
          unclickable={isBaseComponent}
          newCodeSelected={newCodeSelected}
        />
      </ContentCell>

      {metrics.map((metric) => (
        <ComponentMeasure
          component={component}
          branchLike={branchLike}
          key={metric.key}
          metric={metric}
        />
      ))}

      {showAnalysisDate && (
        <NumericalCell className="sw-whitespace-nowrap">
          <Spinner isLoading={isLoading}>
            {!isBaseComponent && (analysisDate ? <DateFromNow date={analysisDate} /> : '—')}
          </Spinner>
        </NumericalCell>
      )}
    </TableRowInteractive>
  );
}
