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

import { AppVariablesElement } from '../../types/browser';
import { InstanceType } from '../../types/system';
import { getEnhancedWindow, initAppVariables } from '../browser';

describe('initAppVariables', () => {
  it('should correctly init app variables', () => {
    const dataset: AppVariablesElement['dataset'] = {
      baseUrl: 'test/base-url',
      serverStatus: 'DOWN',
      instance: InstanceType.SonarQube,
      official: 'false',
    };

    const appVariablesElement = document.querySelector('#content') as AppVariablesElement;
    Object.assign(appVariablesElement.dataset, dataset);

    initAppVariables();

    expect(getEnhancedWindow().baseUrl).toBe('test/base-url');
    expect(getEnhancedWindow().serverStatus).toBe('DOWN');
    expect(getEnhancedWindow().instance).toBe(InstanceType.SonarQube);
    expect(getEnhancedWindow().official).toBe(false);
  });

  it('should throw error if app variables element is not found', () => {
    const querySelector = jest.spyOn(document, 'querySelector');
    querySelector.mockReturnValue(null);

    expect(initAppVariables).toThrow('Failed to get app variables');
  });
});
