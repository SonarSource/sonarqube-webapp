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

import { cloneDeep } from 'lodash';
import { ScaEnablementPayload } from '../../types/sca';
import { getFeatureEnablement, updateFeatureEnablement } from '../sca';

jest.mock('../sca');

export default class ScaSettingsServiceMock {
  isEnabled = true;

  constructor() {
    jest.mocked(updateFeatureEnablement).mockImplementation(this.handleUpdateFeatureEnablement);
    jest.mocked(getFeatureEnablement).mockImplementation(this.handleGetFeatureEnablement);
  }

  reply<T>(response: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cloneDeep(response));
      }, 10);
    });
  }

  reset = () => {
    this.isEnabled = true;
  };

  handleGetFeatureEnablement = () => {
    return this.reply({
      enablement: this.isEnabled,
    });
  };

  /**
   * Calling this causes submitted params to be re-returned via handleGetFeatureEnablement
   * as if the backend call was successful and re-returned the same data.
   */
  handleUpdateFeatureEnablement = (isEnabled: boolean): Promise<ScaEnablementPayload> => {
    this.isEnabled = isEnabled;
    return Promise.resolve({
      enablement: this.isEnabled,
    });
  };
}
