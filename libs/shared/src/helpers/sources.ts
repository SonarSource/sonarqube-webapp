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

import memoizeOne from 'memoize-one';
import { SourceLine, SourceLineCoverageStatus, SourceLineMap } from '../types/source';

export default function getCoverageStatus(s: SourceLine): SourceLineCoverageStatus | undefined {
  let status: SourceLineCoverageStatus | undefined;
  if (s.lineHits != null && s.lineHits > 0) {
    status = 'partially-covered';
  }
  if (s.lineHits != null && s.lineHits > 0 && s.conditions === s.coveredConditions) {
    status = 'covered';
  }
  if (s.lineHits === 0 || s.coveredConditions === 0) {
    status = 'uncovered';
  }
  return status;
}

export const enhanceSources = memoizeOne((sources: SourceLine[]) => {
  const sourcesMap: SourceLineMap = {};
  sources.forEach((line: SourceLine) => {
    line.coverageStatus = getCoverageStatus(line);
    sourcesMap[line.line] = line;
  });

  return { sources, sourcesMap };
});
