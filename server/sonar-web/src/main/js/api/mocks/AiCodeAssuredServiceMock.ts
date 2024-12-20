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

import {
  AiCodeAssuranceStatus,
  getProjectBranchesAiCodeAssuranceStatus,
  getProjectContainsAiCode,
  getProjectDetectedAiCode,
} from '../ai-code-assurance';

jest.mock('../ai-code-assurance');

export const PROJECT_WITH_AI_ASSURED_QG = 'Sonar AI way';
export const PROJECT_WITHOUT_AI_ASSURED_QG = 'Sonar way';

export class AiCodeAssuredServiceMock {
  noAiProject = 'no-ai';

  defaultAIStatus = AiCodeAssuranceStatus.NONE;
  detectedAiCode = true;

  constructor() {
    jest
      .mocked(getProjectBranchesAiCodeAssuranceStatus)
      .mockImplementation(this.handleProjectBranchAiAssuranceStatus);

    jest.mocked(getProjectContainsAiCode).mockImplementation(this.handleProjectAiContainsCode);
    jest.mocked(getProjectDetectedAiCode).mockImplementation(this.handleProjectDetectedAiCode);
  }

  handleProjectBranchAiAssuranceStatus = (project: string) => {
    if (project === PROJECT_WITH_AI_ASSURED_QG) {
      return Promise.resolve(AiCodeAssuranceStatus.AI_CODE_ASSURED_ON);
    } else if (project === PROJECT_WITHOUT_AI_ASSURED_QG) {
      return Promise.resolve(AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF);
    }
    return Promise.resolve(this.defaultAIStatus);
  };

  handleProjectAiContainsCode = (project: string) => {
    if (project === PROJECT_WITH_AI_ASSURED_QG || project === PROJECT_WITHOUT_AI_ASSURED_QG) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  };

  handleProjectDetectedAiCode = () => {
    return Promise.resolve(this.detectedAiCode);
  };

  reset() {
    this.noAiProject = 'no-ai';
    this.defaultAIStatus = AiCodeAssuranceStatus.NONE;
    this.detectedAiCode = true;
  }
}
