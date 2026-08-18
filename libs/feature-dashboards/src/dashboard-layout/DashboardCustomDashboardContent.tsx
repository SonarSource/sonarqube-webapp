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

import { Dashboard } from './Dashboard';
import { EmptyDashboard } from './EmptyDashboard';
import type {
  DashboardInstance,
  WidgetBodyMap,
  WidgetEditBehaviorMap,
  WidgetHeaderMap,
  WidgetInstance,
} from './logic/types';

interface Props<WidgetPropMap extends Record<string, {}>> {
  bodyMap: WidgetBodyMap<WidgetPropMap>;
  canEdit: boolean;
  dashboard: DashboardInstance<WidgetPropMap>;
  emptyDashboardButtonLabelKey: string;
  emptyDashboardEditDocumentationUrl: string;
  emptyDashboardViewDocumentationUrl: string;
  editBehaviorMap: WidgetEditBehaviorMap<WidgetPropMap>;
  headerMap: WidgetHeaderMap<WidgetPropMap>;
  isEditing: boolean;
  isEmptyDashboard: (dashboard: DashboardInstance<WidgetPropMap>) => boolean;
  onAddWidgetToSection: (index: number) => void;
  onDashboardChange: (dashboard: DashboardInstance<WidgetPropMap>) => void;
  onWidgetEdit: (index: number, widget: WidgetInstance<WidgetPropMap>) => void;
  setIsEditing: (editing: boolean) => void;
}

export function DashboardCustomDashboardContent<WidgetPropMap extends Record<string, {}>>({
  bodyMap,
  canEdit,
  dashboard,
  emptyDashboardButtonLabelKey,
  emptyDashboardEditDocumentationUrl,
  emptyDashboardViewDocumentationUrl,
  editBehaviorMap,
  headerMap,
  isEditing,
  isEmptyDashboard,
  onAddWidgetToSection,
  onDashboardChange,
  onWidgetEdit,
  setIsEditing,
}: Readonly<Props<WidgetPropMap>>) {
  if (isEmptyDashboard(dashboard) && !isEditing) {
    return (
      <EmptyDashboard
        canEdit={canEdit}
        editDescriptionDocUrl={emptyDashboardEditDocumentationUrl}
        editModeButtonLabelKey={emptyDashboardButtonLabelKey}
        isEditing={isEditing}
        nonEditDescriptionDocUrl={emptyDashboardViewDocumentationUrl}
        setIsEditing={setIsEditing}
      />
    );
  }

  return (
    <Dashboard
      bodyMap={bodyMap}
      dashboard={dashboard}
      editBehaviorMap={editBehaviorMap}
      headerMap={headerMap}
      isEditing={isEditing}
      onAddWidgetToSection={onAddWidgetToSection}
      onDashboardChange={onDashboardChange}
      onWidgetEdit={onWidgetEdit}
      width={12}
    />
  );
}
