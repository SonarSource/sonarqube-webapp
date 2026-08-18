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
import {
  findLastImplicitSectionIndex,
  getSectionHeight,
  normalizeSection,
} from '../dashboard-layout/logic/positioning';
import type { DashboardInstance } from '../dashboard-layout/logic/types';
import { addWidgetToSection, createWidget } from '../dashboard-layout/utils/widgetFactory';
import type {
  CompleteWidgetConfig,
  PortfolioDashboardWidgetPropMap,
  ProjectDashboardWidgetPropMap,
} from '../types/dashboard-widget';
import { configToWidgetProps } from '../widget-creation-modal/utils/editWidgetConfig';

/* eslint-disable @typescript-eslint/no-duplicate-type-constituents -- Separate public aliases; structurally identical today. */
type CustomDashboardWidgetPropMap = ProjectDashboardWidgetPropMap | PortfolioDashboardWidgetPropMap;
/* eslint-enable @typescript-eslint/no-duplicate-type-constituents */

interface UseAddWidgetParams {
  setDashboardWithUnsavedChanges: (
    value: React.SetStateAction<DashboardInstance<CustomDashboardWidgetPropMap>>,
  ) => void;
}

type ViewportRect = Pick<DOMRect, 'bottom' | 'left' | 'right' | 'top'>;

export function isOutsideViewport(
  elementRect: ViewportRect,
  viewport: { height: number; width: number },
) {
  return (
    elementRect.top < 0 ||
    elementRect.left < 0 ||
    elementRect.bottom > viewport.height ||
    elementRect.right > viewport.width
  );
}

function scrollIntoViewIfNeeded(widgetKey: string) {
  const widgetElement = document.querySelector<HTMLElement>(`[data-widget-key="${widgetKey}"]`);

  if (
    !widgetElement ||
    !isOutsideViewport(widgetElement.getBoundingClientRect(), {
      height: globalThis.innerHeight,
      width: globalThis.innerWidth,
    })
  ) {
    return;
  }

  const behavior = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
  widgetElement.scrollIntoView({ behavior, block: 'center' });
}

export function useAddWidget({ setDashboardWithUnsavedChanges }: UseAddWidgetParams) {
  const [targetSectionIndex, setTargetSectionIndex] = useState<number | null>(null);

  const handleAddWidget = useCallback(
    (props: CompleteWidgetConfig) => {
      const { widgetType } = props;
      const currentTargetSectionIndex = targetSectionIndex;
      const newWidget = createWidget(widgetType, configToWidgetProps(props), { x: 0, y: 0 });

      setDashboardWithUnsavedChanges((prev) => {
        if (!prev) {
          return prev;
        }

        const sections = [...prev.children];
        const sectionIndex = currentTargetSectionIndex ?? findLastImplicitSectionIndex(sections);
        const position =
          sectionIndex === -1
            ? { x: 0, y: 0 }
            : { x: 0, y: getSectionHeight(sections[sectionIndex]) };

        const positionedWidget = { ...newWidget, position };

        if (sectionIndex !== -1) {
          return {
            ...prev,
            children: addWidgetToSection(sections, sectionIndex, positionedWidget),
          };
        }

        const newSection = normalizeSection({ children: [positionedWidget], type: 'implicit' });
        return { ...prev, children: [...sections, newSection] };
      });

      setTargetSectionIndex(null);
      setTimeout(() => {
        scrollIntoViewIfNeeded(newWidget.key);
      }, 150);
    },
    [targetSectionIndex, setDashboardWithUnsavedChanges],
  );

  const handleAddWidgetToSection = useCallback((sectionIndex: number) => {
    setTargetSectionIndex(sectionIndex);
  }, []);
  const handleResetTargetSection = useCallback(() => {
    setTargetSectionIndex(null);
  }, []);

  return {
    handleAddWidget,
    handleAddWidgetToSection,
    handleResetTargetSection,
    targetSectionIndex,
  };
}
