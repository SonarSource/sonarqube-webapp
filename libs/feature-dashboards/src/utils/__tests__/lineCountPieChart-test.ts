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

import {
  buildCoverageLineCountCounts,
  buildDuplicationsLineCountCounts,
} from '../lineCountPieChart';

describe('buildCoverageLineCountCounts', () => {
  it('uses uncovered lines when they are available', () => {
    expect(buildCoverageLineCountCounts({ linesToCover: 120, uncoveredLines: 20 })).toEqual({
      covered: 100,
      uncovered: 20,
    });
  });

  it('falls back to coverage percentage when uncovered lines are missing', () => {
    expect(buildCoverageLineCountCounts({ coverage: 62.5, linesToCover: 80 })).toEqual({
      covered: 50,
      uncovered: 30,
    });
  });

  it('returns empty counts when it cannot derive a valid breakdown', () => {
    expect(buildCoverageLineCountCounts({ linesToCover: 0, uncoveredLines: 0 })).toEqual({});
    expect(buildCoverageLineCountCounts({ linesToCover: 80 })).toEqual({});
  });
});

describe('buildDuplicationsLineCountCounts', () => {
  it('uses duplicated lines when they are available', () => {
    expect(buildDuplicationsLineCountCounts({ duplicatedLines: 10, totalLines: 40 })).toEqual({
      duplicated: 10,
      'non-duplicated': 30,
    });
  });

  it('falls back to duplication density when duplicated lines are missing', () => {
    expect(
      buildDuplicationsLineCountCounts({ duplicatedLinesDensity: 25, totalLines: 40 }),
    ).toEqual({
      duplicated: 10,
      'non-duplicated': 30,
    });
  });

  it('returns empty counts when it cannot derive a valid breakdown', () => {
    expect(buildDuplicationsLineCountCounts({ duplicatedLines: 0, totalLines: 0 })).toEqual({});
    expect(buildDuplicationsLineCountCounts({ totalLines: 40 })).toEqual({});
  });
});
