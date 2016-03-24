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
import { getMetrics } from '../../../api/metrics';

/*
 * Actions
 */

export const DISPLAY_HOME = 'app/DISPLAY_HOME';
export const DISPLAY_DOMAIN = 'app/DISPLAY_DOMAIN';
export const RECEIVE_METRICS = 'app/RECEIVE_METRICS';


/*
 * Action Creators
 */

export function displayHome () {
  return { type: DISPLAY_HOME };
}

export function displayDomain (domainName) {
  return { type: DISPLAY_DOMAIN, domainName };
}

function receiveMetrics (metrics) {
  return { type: RECEIVE_METRICS, metrics };
}


/*
 * Workflow
 */

export function fetchMetrics () {
  return dispatch => {
    getMetrics().then(metrics => {
      dispatch(receiveMetrics(metrics));
    });
  };
}
