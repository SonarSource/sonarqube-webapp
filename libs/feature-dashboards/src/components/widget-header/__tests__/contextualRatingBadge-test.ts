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

import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import {
  DashboardMetricType,
  IssueStatus,
  RichMetricKey,
  type DashboardMetric,
} from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import {
  getProjectContextualRatingMetricKey,
  shouldShowContextualRatingBadge,
} from '../contextualRatingBadge';

describe('contextualRatingBadge', () => {
  it('shows the matching rating for overall open issue counts with one software quality', () => {
    const metric = richIssuesMetric({
      impactSoftwareQuality: SoftwareQuality.Security,
      issueStatus: IssueStatus.Open,
    });

    expect(shouldShowContextualRatingBadge(metric, CodeScope.Overall)).toBe(true);
    expect(getProjectContextualRatingMetricKey(metric, CodeScope.Overall)).toBe(
      MetricKey.security_rating,
    );
  });

  it('shows the matching rating when issue status defaults to open', () => {
    const metric = richIssuesMetric({
      impactSoftwareQuality: SoftwareQuality.Reliability,
    });

    expect(shouldShowContextualRatingBadge(metric, CodeScope.Overall)).toBe(true);
    expect(getProjectContextualRatingMetricKey(metric, CodeScope.Overall)).toBe(
      MetricKey.reliability_rating,
    );
  });

  it('maps maintainability issue counts to the project maintainability rating', () => {
    expect(
      getProjectContextualRatingMetricKey(
        richIssuesMetric({
          impactSoftwareQuality: SoftwareQuality.Maintainability,
          issueStatus: IssueStatus.Open,
        }),
        CodeScope.Overall,
      ),
    ).toBe(MetricKey.sqale_rating);
  });

  it('does not show for non-open status, missing software quality, or new-code scope', () => {
    expect(
      shouldShowContextualRatingBadge(
        richIssuesMetric({
          impactSoftwareQuality: SoftwareQuality.Security,
          issueStatus: IssueStatus.Accepted,
        }),
        CodeScope.Overall,
      ),
    ).toBe(false);
    expect(
      shouldShowContextualRatingBadge(
        richIssuesMetric({ issueStatus: IssueStatus.Open }),
        CodeScope.Overall,
      ),
    ).toBe(false);
    expect(
      shouldShowContextualRatingBadge(
        richIssuesMetric({
          impactSoftwareQuality: SoftwareQuality.Security,
          issueStatus: IssueStatus.Open,
        }),
        CodeScope.New,
      ),
    ).toBe(false);
  });

  it('does not show when severity filters are selected', () => {
    expect(
      shouldShowContextualRatingBadge(
        richIssuesMetric({
          impactSeverities: [SoftwareImpactSeverity.High],
          impactSoftwareQuality: SoftwareQuality.Security,
          issueStatus: IssueStatus.Open,
        }),
        CodeScope.Overall,
      ),
    ).toBe(false);
  });

  it('shows the security review rating for overall security hotspot counts', () => {
    const metric: DashboardMetric = {
      metricKey: MetricKey.security_hotspots,
      type: DashboardMetricType.Raw,
    };

    expect(shouldShowContextualRatingBadge(metric, CodeScope.Overall)).toBe(true);
    expect(getProjectContextualRatingMetricKey(metric, CodeScope.Overall)).toBe(
      MetricKey.security_review_rating,
    );
  });

  it('does not show a contextual rating for issue-resolution metrics', () => {
    const metric: DashboardMetric = {
      statistic: IssueResolutionStatistic.MTTR,
      type: DashboardMetricType.IssueResolution,
    };

    expect(shouldShowContextualRatingBadge(metric, CodeScope.Overall)).toBe(false);
    expect(getProjectContextualRatingMetricKey(metric, CodeScope.Overall)).toBeUndefined();
  });
});

function richIssuesMetric(
  measureFilters?: Extract<DashboardMetric, { type: DashboardMetricType.Rich }>['measureFilters'],
): DashboardMetric {
  return {
    measureFilters,
    metricKey: RichMetricKey.Issues,
    type: DashboardMetricType.Rich,
  };
}
