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

import type { IntlShape } from 'react-intl';
import { formatTopListIssueCount } from '../topListIssueCountFormat';

describe('formatTopListIssueCount', () => {
  const formatMessage = ((descriptor: { id: string }) => {
    const suffixes: Record<string, string> = {
      'short_number_suffix.g': 'G',
      'short_number_suffix.k': 'k',
      'short_number_suffix.m': 'M',
    };
    return suffixes[descriptor.id] ?? descriptor.id;
  }) as IntlShape['formatMessage'];

  it('formats values below 1000 without a suffix', () => {
    expect(formatTopListIssueCount(12, formatMessage)).toBe('12');
    expect(formatTopListIssueCount(999, formatMessage)).toBe('999');
  });

  it('formats thousands with a k suffix', () => {
    expect(formatTopListIssueCount(1500, formatMessage)).toBe('1.5k');
    expect(formatTopListIssueCount(14900, formatMessage)).toBe('15k');
  });
});
