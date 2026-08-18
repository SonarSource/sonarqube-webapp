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

import { safeParse, type BaseIssue } from 'valibot';
import { isRecord } from '~shared/helpers/types';
import {
  dashboardInstanceSchema,
  getDashboardSpecVersion,
  type DashboardInstance,
} from '../dashboard-layout/logic/types';
import { createDashboardWidgetInstanceSchema } from '../data/widgets';
import type { DashboardSpecVersion } from '../data/widgets/shared';
import type { PortfolioDashboardWidgetPropMap } from '../types/dashboard-widget';
import { reportLayoutValidationFailure } from './dashboard-layout-validation-reporting';

interface FailingWidgetDetails {
  issues: BaseIssue<unknown>[];
  props: unknown;
  sectionIndex: number;
  widget: unknown;
  widgetIndex: number;
}

function getFailingWidgets(
  parsedLayout: unknown,
  version: DashboardSpecVersion,
): FailingWidgetDetails[] {
  if (!isRecord(parsedLayout) || !Array.isArray(parsedLayout.children)) {
    return [];
  }

  const widgetInstanceSchema = createDashboardWidgetInstanceSchema(version);
  const failingWidgets: FailingWidgetDetails[] = [];

  parsedLayout.children.forEach((section, sectionIndex) => {
    if (!isRecord(section) || !Array.isArray(section.children)) {
      return;
    }
    section.children.forEach((widget, widgetIndex) => {
      const widgetResult = safeParse(widgetInstanceSchema, widget);
      if (!widgetResult.success) {
        const widgetRecord = isRecord(widget) ? widget : undefined;
        failingWidgets.push({
          issues: widgetResult.issues,
          props: widgetRecord?.props,
          sectionIndex,
          widget,
          widgetIndex,
        });
      }
    });
  });

  return failingWidgets;
}

function toFailingWidgetSummaries(failingWidgets: FailingWidgetDetails[]) {
  return failingWidgets.map((failingWidget) => {
    const widgetRecord = isRecord(failingWidget.widget) ? failingWidget.widget : undefined;
    return {
      issues: failingWidget.issues,
      props: failingWidget.props,
      sectionIndex: failingWidget.sectionIndex,
      widget: failingWidget.widget,
      widgetIndex: failingWidget.widgetIndex,
      widgetKey: typeof widgetRecord?.key === 'string' ? widgetRecord.key : undefined,
      widgetType: typeof widgetRecord?.type === 'string' ? widgetRecord.type : undefined,
    };
  });
}

function formatFailingWidgetForMessage(failingWidget: FailingWidgetDetails): string {
  const widgetRecord = isRecord(failingWidget.widget) ? failingWidget.widget : undefined;
  return JSON.stringify({
    sectionIndex: failingWidget.sectionIndex,
    widgetIndex: failingWidget.widgetIndex,
    widgetKey: typeof widgetRecord?.key === 'string' ? widgetRecord.key : undefined,
    widgetType: typeof widgetRecord?.type === 'string' ? widgetRecord.type : undefined,
  });
}

/**
 * Parses a dashboard `layout` JSON string and validates it against the versioned dashboard schema.
 * Throws {@link DashboardLayoutValidationError} on invalid JSON, empty layout, or schema violations.
 */
export function parseDashboardLayoutFromJsonString(
  layoutJson: string,
  options: { layoutDomain?: 'portfolio' | 'project' } = {},
): DashboardInstance<PortfolioDashboardWidgetPropMap> {
  const layoutDomain = options.layoutDomain ?? 'portfolio';

  if (!layoutJson.trim()) {
    reportLayoutValidationFailure('Invalid dashboard layout JSON', {
      layoutDomain,
      reason: 'empty_layout',
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(layoutJson);
  } catch (cause) {
    reportLayoutValidationFailure(
      'Invalid dashboard layout JSON',
      { layoutDomain, layoutJson, reason: 'json_parse_error' },
      { cause },
    );
  }

  const version = getDashboardSpecVersion(parsed);
  const result = safeParse(dashboardInstanceSchema, parsed);
  if (!result.success) {
    const failingWidgets = getFailingWidgets(parsed, version);
    const message =
      failingWidgets.length > 0
        ? `Invalid dashboard layout: ${formatFailingWidgetForMessage(failingWidgets[0])}`
        : `Invalid dashboard layout: ${JSON.stringify(result.issues)}`;
    reportLayoutValidationFailure(message, {
      failingWidgets: toFailingWidgetSummaries(failingWidgets),
      issues: result.issues,
      layoutDomain,
      layoutJson,
      parsedLayout: parsed,
    });
  }
  return result.output;
}

/**
 * Serializes a {@link DashboardInstance} to a JSON string for storage in the API.
 */
export function stringifyDashboardLayout<T extends {}>(layout: DashboardInstance<T>): string {
  return JSON.stringify(layout);
}
