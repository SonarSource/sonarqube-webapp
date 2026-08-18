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

import { useCallback } from 'react';
import { compactLayout } from '../../../editable-multigrid/utils/compact';
import type { WidgetInstance } from '../../logic/types';

/**
 * Hook for widget edit and delete operations.
 *
 * Handles:
 * - Deleting a widget and compacting remaining widgets
 * - Finding and editing a widget
 *
 * @param groups - Current section groups
 * @param onGroupsChange - Callback when groups change
 * @param onWidgetEdit - Callback when a widget should be edited
 * @returns Widget operation handlers
 */
export function useWidgetHandlers<
  WidgetPropMap extends {},
  GroupType extends { children: WidgetInstance<WidgetPropMap>[]; key: string },
>(
  groups: GroupType[],
  onGroupsChange: (newGroups: GroupType[]) => void,
  onWidgetEdit: (sectionIndex: number, widget: WidgetInstance<WidgetPropMap>) => void,
) {
  const handleWidgetDelete = useCallback(
    (widgetKey: string, groupKey: string) => {
      const newGroups = groups.map((g) => {
        if (g.key !== groupKey) {
          return g;
        }
        // Remove widget and compact remaining widgets to fill the gap
        const remainingWidgets = g.children.filter((w) => w.key !== widgetKey);
        const compactedWidgets = compactLayout(remainingWidgets);
        return {
          ...g,
          children: compactedWidgets,
        };
      });
      onGroupsChange(newGroups);
    },
    [groups, onGroupsChange],
  );

  const handleWidgetEdit = useCallback(
    (widgetKey: string, groupKey: string) => {
      // Find the section index from the groups array
      const sectionIndex = groups.findIndex((g) => g.key === groupKey);
      if (sectionIndex === -1) {
        return;
      }

      // Find the widget within the group
      const widget = groups[sectionIndex].children.find((w) => w.key === widgetKey);
      if (!widget) {
        return;
      }

      onWidgetEdit(sectionIndex, widget);
    },
    [groups, onWidgetEdit],
  );

  return {
    handleWidgetDelete,
    handleWidgetEdit,
  };
}
