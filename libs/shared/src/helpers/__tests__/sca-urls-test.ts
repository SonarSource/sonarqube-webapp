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

import { useLocation } from 'react-router-dom';
import { mockLocation } from '../mocks/router';
import { useScaBaseUrl } from '../sca-urls';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('sca-urls', () => {
  describe('useScaBaseUrl', () => {
    it('should return default base URL when no SCA routes found', () => {
      jest.mocked(useLocation).mockReturnValue(mockLocation({ pathname: '/some/other/path' }));

      expect(useScaBaseUrl()).toBe('/');
    });

    it('should return base URL when releases route is found', () => {
      jest
        .mocked(useLocation)
        .mockReturnValue(mockLocation({ pathname: '/sca/dependencies?id=123' }));
      expect(useScaBaseUrl()).toBe('/sca/');
    });
  });
});
