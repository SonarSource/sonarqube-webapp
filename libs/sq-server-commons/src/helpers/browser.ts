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

import { AppVariablesElement, EnhancedWindow } from '../types/browser';

export function getEnhancedWindow(): EnhancedWindow {
  if (!('baseUrl' in window)) {
    initAppVariables();
  }
  return window as unknown as EnhancedWindow;
}

function getReactDomContainer() {
  const reactDomContainer = document.querySelector<AppVariablesElement>('#content');
  if (reactDomContainer === null) {
    throw new Error('Failed to get app variables');
  }
  return reactDomContainer;
}

export function initAppVariables() {
  const reactDomContainerDataSet = getReactDomContainer().dataset;

  (window as unknown as EnhancedWindow).baseUrl = reactDomContainerDataSet.baseUrl;
  (window as unknown as EnhancedWindow).serverStatus = reactDomContainerDataSet.serverStatus;
  (window as unknown as EnhancedWindow).instance = reactDomContainerDataSet.instance;
  (window as unknown as EnhancedWindow).official = reactDomContainerDataSet.official === 'true';
}
