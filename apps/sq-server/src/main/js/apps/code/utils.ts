/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { uniq } from 'lodash';
import { isPullRequest } from '~shared/helpers/branch-like';
import { isPortfolioLike } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import {
  CCT_SOFTWARE_QUALITY_METRICS,
  OLD_TAXONOMY_METRICS,
} from '~sq-server-commons/helpers/constants';
import { BranchLike } from '~sq-server-commons/types/branch-like';

const METRICS = [
  MetricKey.ncloc,
  ...CCT_SOFTWARE_QUALITY_METRICS,
  ...OLD_TAXONOMY_METRICS,
  MetricKey.security_hotspots,
  MetricKey.coverage,
  MetricKey.duplicated_lines_density,
];

const APPLICATION_METRICS = [MetricKey.alert_status, ...METRICS];

/**
 * Aggregate ratings for all code in a portfolio. These ratings are AI code
 * assurance agnostic, and may contain a blend of projects with AICA and
 * without AICA.
 */
const PORTFOLIO_METRICS = [
  MetricKey.releasability_rating,
  MetricKey.security_rating,
  MetricKey.software_quality_security_rating,
  MetricKey.reliability_rating,
  MetricKey.software_quality_reliability_rating,
  MetricKey.sqale_rating,
  MetricKey.software_quality_maintainability_rating,
  MetricKey.security_review_rating,
  MetricKey.ncloc,
];

/**
 * Aggregate ratings for all code in portfolios with projects that are AI code
 * assured. A project is AI code assured if it contains AI code and it is
 * configured to use the "Sonar way for AI code" quality gate.
 */
const PORTFOLIO_METRICS_WITH_AICA = [
  MetricKey.releasability_rating_with_aica,
  MetricKey.security_rating_with_aica,
  MetricKey.software_quality_security_rating_with_aica,
  MetricKey.reliability_rating_with_aica,
  MetricKey.software_quality_reliability_rating_with_aica,
  MetricKey.sqale_rating_with_aica,
  MetricKey.software_quality_maintainability_rating_with_aica,
  MetricKey.security_review_rating_with_aica,
  MetricKey.ncloc_with_aica,
];

/**
 * Aggregate ratings for all code in portfolios with projects that are not AI
 * code assured. Note that a project can contain AI code but not be AI code
 * assured, if it is configure to use the correct quality gate.
 */
const PORTFOLIO_METRICS_WITHOUT_AICA = [
  MetricKey.releasability_rating_without_aica,
  MetricKey.security_rating_without_aica,
  MetricKey.software_quality_security_rating_without_aica,
  MetricKey.reliability_rating_without_aica,
  MetricKey.software_quality_reliability_rating_without_aica,
  MetricKey.sqale_rating_without_aica,
  MetricKey.software_quality_maintainability_rating_without_aica,
  MetricKey.security_review_rating_without_aica,
  MetricKey.ncloc_without_aica,
];

/**
 * Aggregate ratings for new code in a portfolio. These ratings are AI code
 * assurance agnostic, and may contain a blend of projects with AICA and
 * without AICA.
 */
const NEW_PORTFOLIO_METRICS = [
  MetricKey.releasability_rating,
  MetricKey.new_security_rating,
  MetricKey.new_software_quality_security_rating,
  MetricKey.new_reliability_rating,
  MetricKey.new_software_quality_reliability_rating,
  MetricKey.new_maintainability_rating,
  MetricKey.new_software_quality_maintainability_rating,
  MetricKey.new_security_review_rating,
  MetricKey.new_lines,
];

/**
 * Aggregate ratings for new code in portfolios with projects that are AI code
 * assured. A project is AI code assured if it contains AI code and it is
 * configured to use the "Sonar way for AI code" quality gate.
 */
const NEW_PORTFOLIO_METRICS_WITH_AICA = [
  MetricKey.releasability_rating_with_aica,
  MetricKey.new_security_rating_with_aica,
  MetricKey.new_software_quality_security_rating_with_aica,
  MetricKey.new_reliability_rating_with_aica,
  MetricKey.new_software_quality_reliability_rating_with_aica,
  MetricKey.new_maintainability_rating_with_aica,
  MetricKey.new_software_quality_maintainability_rating_with_aica,
  MetricKey.new_security_review_rating_with_aica,
  MetricKey.new_lines,
];

/**
 * Aggregate ratings for new code in portfolios with projects that are not AI
 * code assured. Note that a project can contain AI code but not be AI code
 * assured, if it is configure to use the correct quality gate.
 */
const NEW_PORTFOLIO_METRICS_WITHOUT_AICA = [
  MetricKey.releasability_rating_without_aica,
  MetricKey.new_security_rating_without_aica,
  MetricKey.new_software_quality_security_rating_without_aica,
  MetricKey.new_reliability_rating_without_aica,
  MetricKey.new_software_quality_reliability_rating_without_aica,
  MetricKey.new_maintainability_rating_without_aica,
  MetricKey.new_software_quality_maintainability_rating_without_aica,
  MetricKey.new_security_review_rating_without_aica,
  MetricKey.new_lines,
];

const LEAK_METRICS = [
  MetricKey.new_lines,
  ...CCT_SOFTWARE_QUALITY_METRICS,
  ...OLD_TAXONOMY_METRICS,
  MetricKey.security_hotspots,
  MetricKey.new_coverage,
  MetricKey.new_duplicated_lines_density,
];

export enum PortfolioMetrics {
  /**
   * Metrics for all code in a portfolio.
   */
  AllCodeAicaAgnostic = 'AllCodeAicaAgnostic',
  /**
   * Metrics for all code in a portfolio with AI code assurance enabled.
   */
  AllCodeAicaEnabled = 'AllCodeAicaEnabled',
  /**
   * Metrics for all code in a portfolio with AI code assurance disabled.
   */
  AllCodeAicaDisabled = 'AllCodeAicaDisabled',
  /**
   * Metrics for new code in a portfolio.
   */
  NewCodeAicaAgnostic = 'AicaAgnostic',
  /**
   * Metrics for new code in a portfolio with AI code assurance enabled.
   */
  NewCodeAicaEnabled = 'NewCodeAicaEnabled',
  /**
   * Metrics for new code in a portfolio with AI code assurance disabled.
   */
  NewCodeAicaDisabled = 'NewCodeAicaDisabled',
  /**
   * If unspecified, a combination of all portfolio metrics. This is used when
   * fetching the component from the API, so that all metrics can be fetched in
   * a single request.
   */
  Unspecified = 'Unspecified',
}

export type GetCodeMetricsOptions = {
  /**
   * When set to true, includes the `contains_ai_code` metric, which is used to
   * display the CONTAINS AI CODE badge in the portfolio breakdown.
   */
  includeContainsAiCode?: boolean;
  includeQGStatus?: boolean;
  /**
   * Narrow the portfolio metrics to a specific set of metrics.
   */
  portfolioMetrics?: PortfolioMetrics;
};

export function getCodeMetrics(
  qualifier: string,
  branchLike?: BranchLike,
  { portfolioMetrics = PortfolioMetrics.Unspecified, ...options }: GetCodeMetricsOptions = {},
) {
  if (isPortfolioLike(qualifier)) {
    let metrics: MetricKey[] = [];

    switch (portfolioMetrics) {
      case PortfolioMetrics.Unspecified:
        metrics = uniq([
          ...NEW_PORTFOLIO_METRICS,
          ...NEW_PORTFOLIO_METRICS_WITH_AICA,
          ...NEW_PORTFOLIO_METRICS_WITHOUT_AICA,
          ...PORTFOLIO_METRICS,
          ...PORTFOLIO_METRICS_WITH_AICA,
          ...PORTFOLIO_METRICS_WITHOUT_AICA,
        ]);
        break;
      case PortfolioMetrics.AllCodeAicaAgnostic:
        metrics = [...PORTFOLIO_METRICS];
        break;
      case PortfolioMetrics.AllCodeAicaDisabled:
        metrics = [...PORTFOLIO_METRICS_WITHOUT_AICA];
        break;
      case PortfolioMetrics.AllCodeAicaEnabled:
        metrics = [...PORTFOLIO_METRICS_WITH_AICA];
        break;
      case PortfolioMetrics.NewCodeAicaAgnostic:
        metrics = [...NEW_PORTFOLIO_METRICS];
        break;
      case PortfolioMetrics.NewCodeAicaDisabled:
        metrics = [...NEW_PORTFOLIO_METRICS_WITHOUT_AICA];
        break;
      case PortfolioMetrics.NewCodeAicaEnabled:
        metrics = [...NEW_PORTFOLIO_METRICS_WITH_AICA];
        break;
    }

    if (options?.includeContainsAiCode) {
      metrics = [...metrics, MetricKey.contains_ai_code];
    }

    if (options.includeQGStatus) {
      metrics = [...metrics, MetricKey.alert_status];
    }

    return metrics;
  }
  if (qualifier === ComponentQualifier.Application) {
    let metrics: MetricKey[] = [...APPLICATION_METRICS];

    if (options?.includeContainsAiCode) {
      metrics = [...metrics, MetricKey.contains_ai_code];
    }

    return metrics;
  }
  if (isPullRequest(branchLike)) {
    return [...LEAK_METRICS];
  }
  if (qualifier === ComponentQualifier.Project) {
    let metrics: MetricKey[] = [...METRICS];

    if (options?.includeContainsAiCode) {
      metrics = [...metrics, MetricKey.contains_ai_code];
    }

    return metrics;
  }
  return [...METRICS];
}

export function mostCommonPrefix(strings: string[]) {
  const sortedStrings = strings.slice(0).sort((a, b) => a.localeCompare(b));
  const firstString = sortedStrings[0];
  const firstStringLength = firstString.length;
  const lastString = sortedStrings[sortedStrings.length - 1];
  let i = 0;
  while (i < firstStringLength && firstString.charAt(i) === lastString.charAt(i)) {
    i++;
  }
  const prefix = firstString.slice(0, i);
  const prefixTokens = prefix.split(/[\s\\/]/);
  const lastPrefixPart = prefixTokens[prefixTokens.length - 1];
  return prefix.slice(0, prefix.length - lastPrefixPart.length);
}
