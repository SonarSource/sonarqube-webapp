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

import { throwGlobalError } from '~adapters/helpers/error';
import { getJSON } from '~adapters/helpers/request';
import { post } from '../helpers/request';

export enum AiCodeAssuranceStatus {
  AI_CODE_ASSURED_PASS = 'AI_CODE_ASSURANCE_PASS',
  AI_CODE_ASSURED_FAIL = 'AI_CODE_ASSURANCE_FAIL',
  AI_CODE_ASSURED_ON = 'AI_CODE_ASSURANCE_ON',
  AI_CODE_ASSURED_OFF = 'AI_CODE_ASSURANCE_OFF',
  NONE = 'NONE',
}

export function getProjectBranchesAiCodeAssuranceStatus(
  project: string,
  branch?: string,
): Promise<AiCodeAssuranceStatus> {
  return getJSON('/api/project_branches/get_ai_code_assurance', {
    project,
    branch,
  })
    .then((response) => response.aiCodeAssurance)
    .catch(throwGlobalError);
}

export function getProjectContainsAiCode(project: string): Promise<boolean> {
  return getJSON('/api/projects/get_contains_ai_code', { project })
    .then((response) => response.containsAiCode)
    .catch(throwGlobalError);
}

export function getProjectDetectedAiCode(project: string): Promise<boolean> {
  return getJSON('/api/projects/get_detected_ai_code', { project })
    .then((response) => response.detectedAiCode)
    .catch(throwGlobalError);
}

export function setProjectAiGeneratedCode(
  project: string,
  isAiCodeAssurance: boolean,
): Promise<void> {
  return post('/api/projects/set_contains_ai_code', {
    // eslint-disable-next-line camelcase
    contains_ai_code: isAiCodeAssurance,
    project,
  }).catch(throwGlobalError);
}
