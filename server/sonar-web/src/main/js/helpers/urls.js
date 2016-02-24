/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
 * Generate URL for a component's home page
 * @param {string} componentKey
 * @returns {string}
 */
export function getComponentUrl (componentKey) {
  return '/dashboard?id=' + encodeURIComponent(componentKey);
}


/**
 * Generate URL for a component's issues page
 * @param {string} componentKey
 * @param {object} query
 * @returns {string}
 */
export function getComponentIssuesUrl (componentKey, query) {
  const serializedQuery = Object.keys(query).map(criterion => {
    return `${encodeURIComponent(criterion)}=${encodeURIComponent(query[criterion])}`;
  }).join('|');
  return '/component_issues?id=' + encodeURIComponent(componentKey) + '#' + serializedQuery;
}


/**
 * Generate URL for a component's drilldown page
 * @param {string} componentKey
 * @param {string} metric
 * @param {string|number} [period]
 * @param {string} [highlightedMetric]
 * @returns {string}
 */
export function getComponentDrilldownUrl (componentKey, metric, period, highlightedMetric) {
  let url = '/drilldown/measures?id=' + encodeURIComponent(componentKey) +
      '&metric=' + encodeURIComponent(metric);
  if (period) {
    url += '&period=' + period;
  }
  if (highlightedMetric) {
    url += '&highlight=' + encodeURIComponent(highlightedMetric);
  }
  return url;
}


/**
 * Generate URL for a component's dashboard
 * @param {string} componentKey
 * @param {string} dashboardKey
 * @param {string} [period]
 * @returns {string}
 */
export function getComponentDashboardUrl (componentKey, dashboardKey, period) {
  let url = '/dashboard?id=' + encodeURIComponent(componentKey) +
      '&did=' + encodeURIComponent(dashboardKey);
  if (period) {
    url += '&period=' + period;
  }
  return url;
}


/**
 * Generate URL for a fixed component's dashboard (overview)
 * @param {string} componentKey
 * @param {string} dashboardKey
 * @returns {string}
 */
export function getComponentFixedDashboardUrl (componentKey, dashboardKey) {
  return '/overview' + dashboardKey + '?id=' + encodeURIComponent(componentKey);
}


/**
 * Generate URL for a component's dashboards management page
 * @param {string} componentKey
 * @returns {string}
 */
export function getComponentDashboardManagementUrl (componentKey) {
  return '/dashboards?resource=' + encodeURIComponent(componentKey);
}
