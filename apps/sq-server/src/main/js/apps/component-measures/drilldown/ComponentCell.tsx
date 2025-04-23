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

import { To } from 'react-router-dom';
import { ContentCell, HoverLink, Note, QualifierIcon } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { fillBranchLike } from '~sq-server-shared/helpers/branch-like';
import { limitComponentName, splitPath } from '~sq-server-shared/helpers/path';
import {
  getComponentDrilldownUrlWithSelection,
  getProjectUrl,
} from '~sq-server-shared/helpers/urls';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import { isApplication, isProject } from '~sq-server-shared/types/component';
import { MeasurePageView } from '~sq-server-shared/types/measures';
import { ComponentMeasure, ComponentMeasureEnhanced, Metric } from '~sq-server-shared/types/types';

export interface ComponentCellProps {
  branchLike?: BranchLike;
  component: ComponentMeasureEnhanced;
  metric: Metric;
  rootComponent: ComponentMeasure;
  view: MeasurePageView;
}

const COMPONENT_PATH_MAX_CHARS = 50;

export default function ComponentCell(props: ComponentCellProps) {
  const { branchLike, component, metric, rootComponent, view } = props;

  let head = '';
  let tail = component.name;

  if (
    view === MeasurePageView.list &&
    (
      [
        ComponentQualifier.File,
        ComponentQualifier.TestFile,
        ComponentQualifier.Directory,
      ] as string[]
    ).includes(component.qualifier) &&
    component.path
  ) {
    ({ head, tail } = splitPath(component.path));
  }

  let path: To;
  const targetKey = component.refKey || rootComponent.key;
  const selectionKey = component.refKey ? '' : component.key;

  // drilldown by default
  path = getComponentDrilldownUrlWithSelection(
    targetKey,
    selectionKey,
    metric.key,
    component.branch ? fillBranchLike(component.branch) : branchLike,
    view,
  );

  // This metric doesn't exist for project
  if (metric.key === MetricKey.projects && isProject(component.qualifier)) {
    path = getProjectUrl(targetKey, component.branch);
  }

  // Those metric doesn't exist for application and project
  if (
    ([MetricKey.releasability_rating, MetricKey.alert_status] as string[]).includes(metric.key) &&
    (isApplication(component.qualifier) || isProject(component.qualifier))
  ) {
    path = getProjectUrl(targetKey, component.branch);
  }

  return (
    <ContentCell className="sw-py-3">
      <HoverLink
        aria-hidden
        icon={<QualifierIcon qualifier={component.qualifier} />}
        tabIndex={-1}
        title={component.path}
        to={path}
      />
      <HoverLink className="sw-flex sw-flex-wrap" title={component.path} to={path}>
        {head.length > 0 && <Note>{limitComponentName(head, COMPONENT_PATH_MAX_CHARS)}/</Note>}
        <strong>{tail}</strong>
      </HoverLink>
    </ContentCell>
  );
}
