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

import { MetricKey } from '~shared/types/metrics';
import {
  getPortfolioDashboardMeasureRequestKey,
  PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE,
} from '../portfolioMeasures';

/** `new_*` keys from the portfolio computed superset, excluding `*_distribution` metrics. */
const PORTFOLIO_NEW_COMPUTED_KEYS_EXCEPT_DISTRIBUTION = [
  MetricKey.new_reliability_rating,
  MetricKey.new_coverage,
  MetricKey.new_lines_to_cover,
  MetricKey.new_branch_coverage,
  MetricKey.new_sqale_debt_ratio,
  MetricKey.new_uncovered_lines,
] as const;

describe('portfolioDashboardMeasures', () => {
  it('exposes expected new-code scope keys', () => {
    expect(PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(MetricKey.coverage)).toBe(true);
    expect(PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(MetricKey.new_coverage)).toBe(false);
    expect(PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(MetricKey.alert_status)).toBe(false);
    expect(PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(MetricKey.sca_rating_any_issue)).toBe(
      true,
    );
    expect(PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(MetricKey.sca_severity_malware)).toBe(
      false,
    );
  });

  it('includes portfolio new_* bases in PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE except *_distribution', () => {
    expect(PORTFOLIO_NEW_COMPUTED_KEYS_EXCEPT_DISTRIBUTION.length).toBeGreaterThan(0);

    for (const key of PORTFOLIO_NEW_COMPUTED_KEYS_EXCEPT_DISTRIBUTION) {
      const base = String(key).slice('new_'.length) as MetricKey;
      expect(PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE.has(base)).toBe(true);
    }
  });

  describe('getPortfolioDashboardMeasureRequestKey', () => {
    it('returns base key when scope is overall', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.coverage, false)).toBe(
        MetricKey.coverage,
      );
    });

    it('returns base key when new scope is not supported for metric', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.security_hotspots, true)).toBe(
        MetricKey.security_hotspots,
      );
    });

    it('returns violations unchanged when scope is new (not in SUPPORTING set)', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.violations, true)).toBe(
        MetricKey.violations,
      );
    });

    it('prefixes new_ when scope is new and metric supports it', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.coverage, true)).toBe(
        MetricKey.new_coverage,
      );
    });

    it('returns the key unchanged when new scope is on but metric is not in SUPPORTING', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.new_coverage, true)).toBe(
        MetricKey.new_coverage,
      );
    });

    it('maps SCA count keys to their new-code variants', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.sca_count_any_issue, true)).toBe(
        MetricKey.new_sca_count_any_issue,
      );
    });

    it('maps supported SCA security keys and leaves unsupported severity keys unchanged', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.sca_count_any_security, true)).toBe(
        MetricKey.new_sca_count_any_security,
      );
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.sca_rating_any_security, true)).toBe(
        MetricKey.new_sca_rating_any_security,
      );
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.sca_severity_any_issue, true)).toBe(
        MetricKey.sca_severity_any_issue,
      );
    });

    it('returns alert_status unchanged when scope is new (not a portfolio metric)', () => {
      expect(getPortfolioDashboardMeasureRequestKey(MetricKey.alert_status, true)).toBe(
        MetricKey.alert_status,
      );
    });
  });
});
