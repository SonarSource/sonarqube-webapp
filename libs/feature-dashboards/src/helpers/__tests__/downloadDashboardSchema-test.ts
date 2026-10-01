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

import { downloadDashboardSchema, sanitizeDashboardFilename } from '../downloadDashboardSchema';

describe('sanitizeDashboardFilename', () => {
  it('strips control and Windows-illegal characters', () => {
    expect(sanitizeDashboardFilename('a\u0000b\u007fc\\d/e:f*g?h"i<j>k|l')).toBe('abcdefghijkl');
  });

  it('normalizes whitespace and hyphens and trims edge hyphens', () => {
    expect(sanitizeDashboardFilename('  --a   b\t-- c--  ')).toBe('a-b-c');
  });

  it('preserves Unicode letters and digits', () => {
    expect(sanitizeDashboardFilename('Übersicht 质量 v1')).toBe('Übersicht-质量-v1');
  });
});

describe('downloadDashboardSchema', () => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = jest.fn(() => 'blob:dashboard-schema');
    globalThis.URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('downloads the dashboard as a JSON file and cleans up its resources', () => {
    const dashboard = {
      description: 'Description',
      id: 'dashboard-id',
      layout: { children: [] },
      name: 'My / Dashboard',
    };

    downloadDashboardSchema(dashboard);

    const link = document.body.querySelector('a[download]');
    expect(link).toHaveAttribute('download', 'My-Dashboard-dashboard-id.json');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));

    jest.runAllTimers();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:dashboard-schema');
    expect(document.body.querySelector('a[download]')).not.toBeInTheDocument();
  });
});
