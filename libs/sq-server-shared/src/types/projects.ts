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

import { ComponentQualifier } from '../sonar-aligned/types/component';

export type Level = 'ERROR' | 'WARN' | 'OK';

export interface ProjectsQuery {
  [x: string]: string | number | string[] | undefined;
  coverage?: number;
  duplications?: number;
  gate?: Level;
  languages?: string[];
  maintainability?: number;
  new_coverage?: number;
  new_duplications?: number;
  new_lines?: number;
  new_maintainability?: number;
  new_reliability?: number;
  new_security?: number;
  new_security_review_rating?: number;
  qualifier?: ComponentQualifier;
  reliability?: number;
  search?: string;
  security?: number;
  security_review_rating?: number;
  size?: number;
  sort?: string;
  tags?: string[];
  view?: string;
}
