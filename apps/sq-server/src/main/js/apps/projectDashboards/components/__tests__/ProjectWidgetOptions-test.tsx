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

import { screen } from '@testing-library/react';
import { useState } from 'react';
import { createIntl } from 'react-intl';
import { PieChartMetric } from '~feature-dashboards/types/dashboard-widget';
import { IssueResolutionStatistic } from '~feature-dashboards/types/organization-issue-resolution-history';
import {
  ISSUE_DENSITY_METRIC_OPTION_VALUE,
  VisualizationType,
} from '~feature-dashboards/types/widget-common';
import { render } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { getSqsProjectWidgetMetricPickerOptions } from '../projectWidgetMetricPickerOptions';
import { ProjectWidgetModalAccordion, ProjectWidgetOptions } from '../ProjectWidgetOptions';

jest.mock(
  '~feature-dashboards/widget-creation-modal/hooks/useProjectWidgetModalAccordionOpenState',
  () => ({
    useProjectWidgetModalAccordionOpenState: () => ({
      applyFiltersAccordionOpen: false,
      customizeVisualizationAccordionOpen: false,
      defineWidgetAccordionOpen: true,
      setApplyFiltersAccordionOpen: jest.fn(),
      setCustomizeVisualizationAccordionOpen: jest.fn(),
      setDefineWidgetAccordionOpen: jest.fn(),
    }),
  }),
);

jest.mock('~feature-dashboards/widget-creation-modal/components/DashboardWidgetOptions', () => ({
  DashboardWidgetOptions: ({
    defaultDefineWidgetDocumentationUrl,
  }: {
    defaultDefineWidgetDocumentationUrl: string;
  }) => (
    <div
      data-documentation-url={defaultDefineWidgetDocumentationUrl}
      data-testid="dashboard-widget-options"
    />
  ),
}));
jest.mock('~sq-server-commons/helpers/docs', () => ({
  useDocUrl: () => 'https://docs.example.com/metric-definitions',
}));

function AccordionHarness({ initialOpen }: Readonly<{ initialOpen: boolean }>) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <ProjectWidgetModalAccordion
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen((open) => !open);
      }}
      title="Widget options"
    >
      <div>Widget content</div>
    </ProjectWidgetModalAccordion>
  );
}

function getSupportsNewCodeScopeForMetric() {
  const { supportsNewCodeScopeForMetric } = getSqsProjectWidgetMetricPickerOptions(
    createIntl({ locale: 'en' }),
  );

  if (supportsNewCodeScopeForMetric === undefined) {
    throw new TypeError('Expected the project metric picker to define scope support');
  }

  return supportsNewCodeScopeForMetric;
}

describe('ProjectWidgetModalAccordion', () => {
  it('keeps controlled state in sync when the user toggles an accordion', async () => {
    const { user } = render(<AccordionHarness initialOpen />);
    const accordion = screen.getByRole('group');

    expect(accordion).toHaveAttribute('open');

    await user.click(screen.getByText('Widget options'));

    expect(accordion).not.toHaveAttribute('open');
  });
});

describe('ProjectWidgetOptions', () => {
  it('renders the shared widget options with project configuration', () => {
    render(
      <ProjectWidgetOptions
        dispatch={jest.fn()}
        isEditMode
        metricPickerOptions={{} as never}
        state={{} as never}
      />,
    );

    expect(screen.getByTestId('dashboard-widget-options')).toHaveAttribute(
      'data-documentation-url',
      'https://docs.example.com/metric-definitions',
    );
  });

  it('does not offer a redundant New Code scope for new-code metrics', () => {
    const supportsNewCodeScopeForMetric = getSupportsNewCodeScopeForMetric();

    expect(
      supportsNewCodeScopeForMetric(MetricKey.new_sqale_debt_ratio, VisualizationType.Count),
    ).toBe(false);
    expect(supportsNewCodeScopeForMetric(MetricKey.sqale_debt_ratio, VisualizationType.Count)).toBe(
      true,
    );
    expect(
      supportsNewCodeScopeForMetric(MetricKey.line_coverage, VisualizationType.LineChart),
    ).toBe(true);
    expect(supportsNewCodeScopeForMetric(MetricKey.comment_lines, VisualizationType.Count)).toBe(
      false,
    );
    expect(
      supportsNewCodeScopeForMetric(MetricKey.alert_status, VisualizationType.RatingBadge),
    ).toBe(false);
    expect(supportsNewCodeScopeForMetric(MetricKey.violations, VisualizationType.Count)).toBe(true);
    expect(supportsNewCodeScopeForMetric(MetricKey.violations, VisualizationType.LineChart)).toBe(
      false,
    );
    expect(
      supportsNewCodeScopeForMetric(MetricKey.comment_lines, VisualizationType.RatingBadge),
    ).toBe(false);
  });

  it('excludes deprecated security hotspot metrics from every creation picker', () => {
    const options = getSqsProjectWidgetMetricPickerOptions(createIntl({ locale: 'en' }));
    const lineChartMetrics = options.lineChartMetrics as NonNullable<
      typeof options.lineChartMetrics
    >;
    const pieChartMetricOptions = options.pieChartMetricOptions as NonNullable<
      typeof options.pieChartMetricOptions
    >;
    const groupedMetricValues = [
      ...options.countMetrics,
      ...lineChartMetrics,
      ...options.ratingBadgeMetrics,
    ].flatMap(({ items }) => items.map(({ value }) => value));

    expect(groupedMetricValues).not.toContain(MetricKey.security_hotspots);
    expect(groupedMetricValues).not.toContain(MetricKey.security_hotspots_reviewed);
    expect(groupedMetricValues).not.toContain(MetricKey.security_review_rating);
    expect(pieChartMetricOptions.map(({ value }) => value)).not.toContain(
      PieChartMetric.HotspotCount,
    );
  });

  it('includes quality gate and rating metrics in the badge picker only', () => {
    const options = getSqsProjectWidgetMetricPickerOptions(createIntl({ locale: 'en' }));
    const lineChartMetrics = options.lineChartMetrics as NonNullable<
      typeof options.lineChartMetrics
    >;
    const expectedRatingBadgeMetrics = [
      MetricKey.alert_status,
      MetricKey.security_rating,
      MetricKey.reliability_rating,
      MetricKey.sqale_rating,
    ];
    const ratingValues = options.ratingBadgeMetrics.flatMap(({ items }) =>
      items.map(({ value }) => value),
    );
    const countValues = options.countMetrics.flatMap(({ items }) =>
      items.map(({ value }) => value),
    );
    const lineValues = lineChartMetrics.flatMap(({ items }) => items.map(({ value }) => value));

    expect(ratingValues).toEqual(expectedRatingBadgeMetrics);
    expect(countValues).toEqual(expect.not.arrayContaining(expectedRatingBadgeMetrics));
    expect(lineValues).toEqual(expect.not.arrayContaining(expectedRatingBadgeMetrics));
  });

  it('includes both lines and NCLOC in count and line chart pickers', () => {
    const options = getSqsProjectWidgetMetricPickerOptions(createIntl({ locale: 'en' }));
    const lineChartMetrics = options.lineChartMetrics as NonNullable<
      typeof options.lineChartMetrics
    >;
    const countValues = options.countMetrics.flatMap(({ items }) =>
      items.map(({ value }) => value),
    );
    const lineValues = lineChartMetrics.flatMap(({ items }) => items.map(({ value }) => value));

    expect(countValues).toEqual(expect.arrayContaining([MetricKey.lines, MetricKey.ncloc]));
    expect(lineValues).toEqual(expect.arrayContaining([MetricKey.lines, MetricKey.ncloc]));
  });

  it('includes issue density and issue resolution metrics in count and line chart pickers', () => {
    const options = getSqsProjectWidgetMetricPickerOptions(createIntl({ locale: 'en' }));
    const lineChartMetrics = options.lineChartMetrics as NonNullable<
      typeof options.lineChartMetrics
    >;
    const expectedMetrics = [
      ISSUE_DENSITY_METRIC_OPTION_VALUE,
      IssueResolutionStatistic.ResolvedIssues,
      IssueResolutionStatistic.MTTR,
      IssueResolutionStatistic.RecentMTTR,
    ];
    const countValues = options.countMetrics.flatMap(({ items }) =>
      items.map(({ value }) => value),
    );
    const lineValues = lineChartMetrics.flatMap(({ items }) => items.map(({ value }) => value));

    expect(countValues).toEqual(expect.arrayContaining(expectedMetrics));
    expect(lineValues).toEqual(expect.arrayContaining(expectedMetrics));
  });
});
