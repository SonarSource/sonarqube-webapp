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

import { isValidElement } from 'react';
import { convertToPermissionDefinitions } from '../permissions';

describe('convertToPermissionDefinitions', () => {
  it('should convert and translate a permission definition', () => {
    const data = convertToPermissionDefinitions(['admin'], 'global_permissions');
    const expected = [
      {
        description: 'global_permissions.admin.desc',
        key: 'admin',
        name: 'global_permissions.admin',
      },
    ];

    expect(data).toEqual(expected);
  });

  it('should convert scan permission using the rich execute-analysis description path', () => {
    const data = convertToPermissionDefinitions(['scan'], 'global_permissions');
    expect(data).toHaveLength(1);
    const scan = data[0];
    expect(scan).toMatchObject({
      key: 'scan',
      name: 'global_permissions.scan',
    });
    expect(scan).toHaveProperty('description');
    expect(isValidElement((scan as { description: unknown }).description)).toBe(true);
  });
});
