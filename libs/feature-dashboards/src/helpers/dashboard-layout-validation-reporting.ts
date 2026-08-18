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

import type { BaseIssue } from 'valibot';
import { reportError } from '~adapters/helpers/report-error';
import { stringifyErrorContext } from '~shared/helpers/dashboard-error-reporting';

/** Thrown when a dashboard `layout` JSON is missing, malformed, or fails schema validation. */
export class DashboardLayoutValidationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DashboardLayoutValidationError';
  }
}

const MAX_REPORTED_LAYOUT_VALIDATION_KEYS = 50;

interface FailingWidgetSummary {
  issues: BaseIssue<unknown>[];
  props: unknown;
  sectionIndex: number;
  widget: unknown;
  widgetIndex: number;
  widgetKey?: string;
  widgetType?: string;
}

export interface LayoutValidationReportDetails {
  failingWidgets?: FailingWidgetSummary[];
  issues?: BaseIssue<unknown>[];
  layoutDomain?: 'portfolio' | 'project';
  layoutJson?: string;
  parsedLayout?: unknown;
  reason?: string;
}

const reportedLayoutValidationKeys: string[] = [];

/** @internal test-only */
export function resetLayoutValidationReportingForTests() {
  reportedLayoutValidationKeys.length = 0;
}

function getLayoutValidationReportKey(
  message: string,
  details: LayoutValidationReportDetails,
): string {
  const reason = details.reason ?? 'validation_error';
  const failingWidget = details.failingWidgets?.[0];
  const layoutFingerprint =
    details.layoutJson === undefined ? undefined : String(details.layoutJson.length);
  return [
    details.layoutDomain ?? 'portfolio',
    reason,
    message,
    failingWidget?.widgetKey,
    failingWidget?.widgetType,
    failingWidget?.sectionIndex,
    failingWidget?.widgetIndex,
    layoutFingerprint,
  ].join(':');
}

function shouldReportLayoutValidation(key: string): boolean {
  if (reportedLayoutValidationKeys.includes(key)) {
    return false;
  }
  reportedLayoutValidationKeys.push(key);
  if (reportedLayoutValidationKeys.length > MAX_REPORTED_LAYOUT_VALIDATION_KEYS) {
    reportedLayoutValidationKeys.shift();
  }
  return true;
}

function buildSentryDetails(
  message: string,
  details: LayoutValidationReportDetails,
): Record<string, string> {
  const { failingWidgets, issues, layoutDomain, reason } = details;
  const sentryFailingWidgets = failingWidgets?.map(({ widget, ...summary }) => summary);
  return stringifyErrorContext({
    failingWidgets: sentryFailingWidgets,
    issues,
    layoutDomain,
    message,
    reason,
  });
}

function buildConsoleDetails(
  message: string,
  details: LayoutValidationReportDetails,
): Record<string, string> {
  const { layoutJson, parsedLayout, failingWidgets, ...consoleDetails } = details;
  const consoleFailingWidgets = failingWidgets?.map(({ widget, ...summary }) => summary);
  return stringifyErrorContext({
    message,
    ...consoleDetails,
    failingWidgets: consoleFailingWidgets,
  });
}

/** Logs rich details to the console, reports to Sentry with bounded dedupe, and throws {@link DashboardLayoutValidationError}. */
export function reportLayoutValidationFailure(
  message: string,
  details: LayoutValidationReportDetails = {},
  options: { cause?: unknown } = {},
): never {
  const { cause } = options;

  // eslint-disable-next-line no-console
  console.error(
    'Dashboard layout validation failed:',
    JSON.stringify(buildConsoleDetails(message, details), null, 2),
  );

  const reportKey = getLayoutValidationReportKey(message, details);
  if (shouldReportLayoutValidation(reportKey)) {
    reportError(message, buildSentryDetails(message, details));
  }

  throw new DashboardLayoutValidationError(message, {
    cause: cause instanceof Error ? cause : undefined,
  });
}
