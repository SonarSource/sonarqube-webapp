/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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
import axios from 'axios';
import { BoundProject, DopSetting } from '../types/dop-translation';
import { Paging } from '../types/types';

const DOP_TRANSLATION_PATH = '/api/v2/dop-translation';
const BOUND_PROJECTS_PATH = `${DOP_TRANSLATION_PATH}/bound-projects`;
const DOP_SETTINGS_PATH = `${DOP_TRANSLATION_PATH}/dop-settings`;

export function createBoundProject(data: BoundProject) {
  return axios.post(BOUND_PROJECTS_PATH, data);
}

export function getDopSettings() {
  return axios.get<{ paging: Paging; dopSettings: DopSetting[] }>(DOP_SETTINGS_PATH);
}
