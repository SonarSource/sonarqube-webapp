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

import { reportError } from '~adapters/helpers/report-error';
import { MetricKey } from '~shared/types/metrics';
import { LATEST_DASHBOARD_SPEC_VERSION } from '../../data/widgets/shared';
import { parseDashboardLayoutFromJsonString, stringifyDashboardLayout } from '../dashboard-layout';
import {
  DashboardLayoutValidationError,
  resetLayoutValidationReportingForTests,
} from '../dashboard-layout-validation-reporting';

jest.mock('~adapters/helpers/report-error', () => ({
  reportError: jest.fn(),
}));

interface FailingWidgetSentrySummary {
  props?: unknown;
  sectionIndex?: number;
  widgetIndex?: number;
  widgetKey?: string;
  widgetType?: string;
}

function isFailingWidgetSentrySummary(value: unknown): value is FailingWidgetSentrySummary {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseFailingWidgetsFromSentryContext(value: unknown): FailingWidgetSentrySummary[] {
  if (typeof value !== 'string') {
    throw new TypeError('Expected failingWidgets to be a serialized string');
  }
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isFailingWidgetSentrySummary)) {
    throw new TypeError('Expected failingWidgets to deserialize to a summary array');
  }
  return parsed;
}

const VALID_LAYOUT_JSON = JSON.stringify({
  children: [
    {
      children: [
        {
          dimensions: { height: 4, width: 6 },
          key: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          position: { x: 0, y: 0 },
          props: { metric: { metricKey: MetricKey.violations, type: 'raw' }, scope: 'overall' },
          type: 'count',
        },
      ],
      type: 'implicit',
    },
  ],
});

describe('parseDashboardLayoutFromJsonString', () => {
  beforeEach(() => {
    resetLayoutValidationReportingForTests();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a DashboardInstance for a valid layout JSON string', () => {
    const result = parseDashboardLayoutFromJsonString(VALID_LAYOUT_JSON);

    expect(result.version).toBe(LATEST_DASHBOARD_SPEC_VERSION);
    expect(result.children).toHaveLength(1);
    expect(result.children[0]?.children).toHaveLength(1);

    expect(jest.mocked(reportError)).not.toHaveBeenCalled();
  });

  it('keeps an explicit dashboard version of zero', () => {
    const layoutWithVersion = JSON.stringify({
      ...JSON.parse(VALID_LAYOUT_JSON),
      version: 0,
    });

    const result = parseDashboardLayoutFromJsonString(layoutWithVersion);

    expect(result.version).toBe(LATEST_DASHBOARD_SPEC_VERSION);
  });

  it('throws DashboardLayoutValidationError for an empty string', () => {
    expect(() => parseDashboardLayoutFromJsonString('   ')).toThrow(DashboardLayoutValidationError);
  });

  it('throws DashboardLayoutValidationError for malformed JSON', () => {
    expect(() => parseDashboardLayoutFromJsonString('{not valid json')).toThrow(
      DashboardLayoutValidationError,
    );
  });

  it('throws DashboardLayoutValidationError when schema validation fails', () => {
    expect(() => parseDashboardLayoutFromJsonString(JSON.stringify({ children: 'bad' }))).toThrow(
      DashboardLayoutValidationError,
    );
  });

  it('reports widget props to Sentry without full layout JSON', () => {
    const layoutJson = JSON.stringify({
      children: [
        {
          children: [
            {
              dimensions: { height: 4, width: 6 },
              key: 'widget-key-abc',
              position: { x: 0, y: 0 },
              props: { metric: 'invalid', scope: 'overall' },
              type: 'count',
            },
          ],
          type: 'implicit',
        },
      ],
    });

    expect(() => parseDashboardLayoutFromJsonString(layoutJson)).toThrow(
      DashboardLayoutValidationError,
    );
    expect(jest.mocked(reportError)).toHaveBeenCalledTimes(1);
    const reportedMessage = String(jest.mocked(reportError).mock.calls[0]?.[0]);
    expect(reportedMessage).toContain('widget-key-abc');
    expect(reportedMessage).not.toContain('"dimensions"');
    const sentryContext = jest.mocked(reportError).mock.calls[0]?.[1];
    expect(sentryContext?.layoutJson).toBeUndefined();
    expect(sentryContext?.parsedLayout).toBeUndefined();
    const failingWidgets = parseFailingWidgetsFromSentryContext(sentryContext?.failingWidgets);
    expect(failingWidgets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          widgetKey: 'widget-key-abc',
          props: { metric: 'invalid', scope: 'overall' },
        }),
      ]),
    );
    expect(JSON.stringify(failingWidgets)).not.toContain('"dimensions"');
  });

  it('deduplicates Sentry reports for the same validation message', () => {
    const layoutJson = '   ';

    expect(() => parseDashboardLayoutFromJsonString(layoutJson)).toThrow(
      DashboardLayoutValidationError,
    );
    expect(() => parseDashboardLayoutFromJsonString(layoutJson)).toThrow(
      DashboardLayoutValidationError,
    );
    expect(jest.mocked(reportError)).toHaveBeenCalledTimes(1);
  });
});

describe('stringifyDashboardLayout', () => {
  it('round-trips a DashboardInstance through parse and stringify', () => {
    const parsed = parseDashboardLayoutFromJsonString(VALID_LAYOUT_JSON);
    const stringified = stringifyDashboardLayout(parsed);
    const reparsed = parseDashboardLayoutFromJsonString(stringified);

    expect(reparsed.children).toHaveLength(parsed.children.length);
  });
});
