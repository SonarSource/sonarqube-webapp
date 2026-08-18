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

import { useCallback, useState } from 'react';
import { normalizeSection } from '../../dashboard-layout/logic/positioning';
import type { DashboardInstance, WidgetInstance } from '../../dashboard-layout/logic/types';
import type {
  CompleteWidgetConfig,
  ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { configToWidgetProps, widgetToConfig } from '../utils/editWidgetConfig';

interface UseEditWidgetParams<
  TWidgetMap extends ProjectDashboardWidgetPropMap = ProjectDashboardWidgetPropMap,
> {
  setDashboardWithUnsavedChanges: (
    value: React.SetStateAction<DashboardInstance<TWidgetMap>>,
  ) => void;
}

interface EditingWidget<TWidgetMap extends ProjectDashboardWidgetPropMap> {
  sectionIndex: number;
  widget: WidgetInstance<TWidgetMap>;
}

export function useEditWidget<
  TWidgetMap extends ProjectDashboardWidgetPropMap = ProjectDashboardWidgetPropMap,
>({ setDashboardWithUnsavedChanges }: UseEditWidgetParams<TWidgetMap>) {
  const [isEditWidgetModalOpen, setIsEditWidgetModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<EditingWidget<TWidgetMap> | null>(null);

  const handleOpenEditWidget = useCallback(
    (sectionIndex: number, widget: WidgetInstance<TWidgetMap>) => {
      setEditingWidget({ sectionIndex, widget });
      setIsEditWidgetModalOpen(true);
    },
    [],
  );

  const handleCloseEditWidget = useCallback(() => {
    setIsEditWidgetModalOpen(false);
    setEditingWidget(null);
  }, []);

  const handleSaveEditWidget = useCallback(
    (config: CompleteWidgetConfig) => {
      if (!editingWidget) {
        return;
      }

      const { sectionIndex, widget } = editingWidget;

      setDashboardWithUnsavedChanges((prev) => {
        if (!prev) {
          return prev;
        }

        const sections = [...prev.children];
        const section = sections[sectionIndex];

        const updatedChildren = section.children.map((w) =>
          w.key === widget.key
            ? ({
                ...w,
                props: configToWidgetProps(config),
              } as WidgetInstance<TWidgetMap>)
            : w,
        );

        sections[sectionIndex] = normalizeSection({
          ...section,
          children: updatedChildren,
        });

        return { ...prev, children: sections };
      });

      handleCloseEditWidget();
    },
    [editingWidget, setDashboardWithUnsavedChanges, handleCloseEditWidget],
  );

  const initialWidgetProps = editingWidget
    ? widgetToConfig(editingWidget.widget as WidgetInstance<ProjectDashboardWidgetPropMap>)
    : undefined;

  return {
    isEditWidgetModalOpen,
    setIsEditWidgetModalOpen,
    editingWidget,
    initialWidgetProps,
    handleOpenEditWidget,
    handleCloseEditWidget,
    handleSaveEditWidget,
  };
}
