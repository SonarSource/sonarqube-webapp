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

import { safeParse } from 'valibot';
import { reportError } from '~adapters/helpers/report-error';
import { uuidv4 } from '~shared/helpers/crypto';
import {
  projectDashboardWidgetPropsSchemaByType,
  widgetEditBehaviorMap,
  type ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { normalizeSection } from '../logic/positioning';
import { type SectionInstance, type WidgetInstance } from '../logic/types';

export function createWidget<T extends keyof ProjectDashboardWidgetPropMap>(
  widgetType: T,
  props: ProjectDashboardWidgetPropMap[T],
  position: { x: number; y: number },
): WidgetInstance<ProjectDashboardWidgetPropMap> {
  const mergedProps = { ...widgetEditBehaviorMap[widgetType].defaultProps, ...props };
  const validationResult = safeParse(
    projectDashboardWidgetPropsSchemaByType[widgetType],
    mergedProps,
  );

  if (!validationResult.success) {
    // eslint-disable-next-line no-console
    console.error('Widget props validation failed:', { widgetType, props: mergedProps });
    reportError(`Dashboard widget props validation failed for type "${widgetType}"`, {
      widgetType,
    });
  }

  return {
    dimensions: widgetEditBehaviorMap[widgetType].defaultSize,
    key: uuidv4(),
    position,
    props: validationResult.success ? validationResult.output : mergedProps,
    type: widgetType,
  } as WidgetInstance<ProjectDashboardWidgetPropMap>;
}

export const addWidgetToSection = (
  sections: SectionInstance<ProjectDashboardWidgetPropMap>[],
  sectionIndex: number,
  widget: WidgetInstance<ProjectDashboardWidgetPropMap>,
) => {
  const targetSection = sections[sectionIndex];
  const updatedSection = normalizeSection({
    ...targetSection,
    children: [...targetSection.children, widget],
  });
  const newSections = [...sections];
  newSections[sectionIndex] = updatedSection;
  return newSections;
};
