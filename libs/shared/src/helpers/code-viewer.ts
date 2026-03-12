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

import { LinesOfCodeEllipsesDirection } from '../types/code-viewer';
import { isDefined } from './types';

/**
 * Get the range of lines to fetch from the server to expand the snippet.
 * @param params.direction - Direction of the expansion
 * @param params.end - For "up" and "down" directions: end of the snippet to expand; For "middle" direction: end of the range to fetch
 * @param params.maxExpand - Maximum number of lines to fetch
 * @param params.start - For "up" and "down" directions: start of the snippet to expand; For "middle" direction: start of the range to fetch
 * @param params.totalLines - Total number of lines in the file
 * @returns Range of lines to fetch from the server
 */
export function getLinesExpandRange(params: {
  direction: LinesOfCodeEllipsesDirection;
  end?: number;
  maxExpand: number;
  start: number;
  totalLines: number;
}) {
  const { direction, end, maxExpand, start, totalLines } = params;

  if (direction === 'up') {
    return { from: Math.max(1, start - maxExpand), to: start - 1 };
  }
  if (direction === 'down' && isDefined(end)) {
    return {
      from: end + 1,
      to: Math.min(end + maxExpand, totalLines),
    };
  }
  if (direction === 'middle' && isDefined(end)) {
    return { from: start, to: end };
  }

  return undefined;
}
