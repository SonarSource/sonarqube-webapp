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

function normalizeLineCount(value: number, total: number): number {
  return Math.min(Math.max(Math.round(value), 0), total);
}

export function buildCoverageLineCountCounts(args: {
  coverage?: number;
  linesToCover?: number;
  uncoveredLines?: number;
}): Record<string, number> {
  const { coverage, linesToCover, uncoveredLines } = args;
  if (linesToCover === undefined || linesToCover <= 0) {
    return {};
  }

  const normalizedLinesToCover = Math.max(Math.round(linesToCover), 0);
  if (uncoveredLines !== undefined) {
    const resolvedUncoveredLines = normalizeLineCount(uncoveredLines, normalizedLinesToCover);

    return {
      covered: normalizedLinesToCover - resolvedUncoveredLines,
      uncovered: resolvedUncoveredLines,
    };
  }

  if (coverage === undefined) {
    return {};
  }

  const resolvedUncoveredLines =
    normalizedLinesToCover -
    normalizeLineCount((normalizedLinesToCover * coverage) / 100, normalizedLinesToCover);

  return {
    covered: normalizedLinesToCover - resolvedUncoveredLines,
    uncovered: resolvedUncoveredLines,
  };
}

export function buildDuplicationsLineCountCounts(args: {
  duplicatedLines?: number;
  duplicatedLinesDensity?: number;
  totalLines?: number;
}): Record<string, number> {
  const { duplicatedLines, duplicatedLinesDensity, totalLines } = args;
  if (totalLines === undefined || totalLines <= 0) {
    return {};
  }

  const normalizedTotalLines = Math.max(Math.round(totalLines), 0);
  if (duplicatedLines !== undefined) {
    const resolvedDuplicatedLines = normalizeLineCount(duplicatedLines, normalizedTotalLines);

    return {
      duplicated: resolvedDuplicatedLines,
      'non-duplicated': normalizedTotalLines - resolvedDuplicatedLines,
    };
  }

  if (duplicatedLinesDensity === undefined) {
    return {};
  }

  const resolvedDuplicatedLines = normalizeLineCount(
    (normalizedTotalLines * duplicatedLinesDensity) / 100,
    normalizedTotalLines,
  );

  return {
    duplicated: resolvedDuplicatedLines,
    'non-duplicated': normalizedTotalLines - resolvedDuplicatedLines,
  };
}
