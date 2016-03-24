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
import { DISPLAY_DOMAIN, RECEIVE_METRICS } from './actions';

const initialState = {
  metrics: undefined,
  lastDisplayedDomain: undefined
};

export default function appReducer (state = initialState, action = {}) {
  switch (action.type) {
    case DISPLAY_DOMAIN:
      return { ...state, lastDisplayedDomain: action.domainName };
    case RECEIVE_METRICS:
      return { ...state, metrics: action.metrics };
    default:
      return state;
  }
}

