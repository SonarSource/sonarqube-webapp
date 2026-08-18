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

/**
 * Structural shapes for **organizations** HTTP responses used by portfolio and project line charts
 * (`GET /organizations/measures-history`, `GET /organizations/issue-count-history`) and by
 * `../utils/lineChartSeriesTransforms` transforms.
 *
 * **Single source of truth for these fields** (keep MSW and `~api/portfolio-dashboard` aliases in
 * sync when the backend contract changes).
 */
export interface OrganizationsMeasuresHistoryDay {
  date: string;
  measures: {
    metric: string;
    /** Metric type as returned by the API (e.g. "percent", "rating") */
    type: string;
    value: string;
  }[];
}

export interface OrganizationsIssueCountHistoryDay {
  date: string;
  distribution: {
    key: string;
    value: number;
  }[];
}
