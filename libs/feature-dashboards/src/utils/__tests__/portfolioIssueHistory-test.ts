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

import { issueHistoryTrendStartDate, THIRTY_DAYS_MS } from '../datetime';
import { issueCountHistoryToPieCounts } from '../organizationIssueCountHistory';

describe('issueHistoryTrendStartDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T15:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns midnight UTC thirty days before now', () => {
    const expected = new Date(Date.now() - THIRTY_DAYS_MS);
    expected.setUTCHours(0, 0, 0, 0);

    expect(issueHistoryTrendStartDate()).toBe(expected.toISOString());
  });
});

describe('issueCountHistoryToPieCounts', () => {
  it('returns empty counts when history is missing', () => {
    expect(issueCountHistoryToPieCounts(undefined)).toEqual({});
    expect(issueCountHistoryToPieCounts([])).toEqual({});
  });

  it('uses the latest day distribution and drops zero values', () => {
    const counts = issueCountHistoryToPieCounts([
      {
        date: '2026-01-01T00:00:00.000Z',
        distribution: [{ key: 'java:S1', value: 1 }],
      },
      {
        date: '2026-03-01T00:00:00.000Z',
        distribution: [
          { key: 'java:S1', value: 5 },
          { key: 'java:S2', value: 0 },
          { key: 'java:S3', value: 3 },
        ],
      },
    ]);

    expect(counts).toEqual({ 'java:S1': 5, 'java:S3': 3 });
  });
});
