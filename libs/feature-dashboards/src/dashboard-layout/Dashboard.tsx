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

import { EditableDashboard } from './EditableDashboard/EditableDashboard';
import {
  DashboardInstance,
  WidgetBodyMap,
  WidgetEditBehaviorMap,
  WidgetHeaderMap,
  WidgetInstance,
} from './logic/types';
import { ReadonlyDashboard } from './ReadonlyDashboard/ReadonlyDashboard';
import { WidgetMapsProvider } from './shared/WidgetMapsContext';

interface Props<WidgetPropMap extends {}> {
  bodyMap: WidgetBodyMap<WidgetPropMap>;
  dashboard: DashboardInstance<WidgetPropMap>;
  editBehaviorMap: WidgetEditBehaviorMap<WidgetPropMap>;
  headerMap: WidgetHeaderMap<WidgetPropMap>;
  isEditing: boolean;
  onAddWidgetToSection: (sectionIndex: number) => void;
  onDashboardChange: (dashboard: DashboardInstance<WidgetPropMap>) => void;
  onWidgetEdit: (sectionIndex: number, widget: WidgetInstance<WidgetPropMap>) => void;
  width: number;
}

export function Dashboard<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const {
    bodyMap,
    dashboard,
    editBehaviorMap,
    headerMap,
    isEditing,
    onAddWidgetToSection,
    onDashboardChange,
    onWidgetEdit,
    width,
  } = props;

  // Create empty editBehaviorMap for readonly mode if not provided
  const effectiveEditBehaviorMap = editBehaviorMap ?? ({} as WidgetEditBehaviorMap<WidgetPropMap>);

  return (
    <WidgetMapsProvider
      bodyMap={bodyMap}
      editBehaviorMap={effectiveEditBehaviorMap}
      headerMap={headerMap}
    >
      {isEditing ? (
        <EditableDashboard
          dashboard={dashboard}
          onAddWidgetToSection={onAddWidgetToSection}
          onDashboardChange={onDashboardChange}
          onWidgetEdit={onWidgetEdit}
        />
      ) : (
        <ReadonlyDashboard dashboard={dashboard} width={width} />
      )}
    </WidgetMapsProvider>
  );
}
