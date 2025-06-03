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

import { cloneDeep } from 'lodash';
import {
  AiCodeAssuranceStatus,
  getProjectBranchesAiCodeAssuranceStatus,
  getProjectContainsAiCode,
  getProjectDetectedAiCode,
  setProjectAiGeneratedCode,
} from '../ai-code-assurance';

jest.mock('../ai-code-assurance');

export const PROJECT_WITH_AI_ASSURED_QG = 'Sonar AI way';
export const PROJECT_WITHOUT_AI_ASSURED_QG = 'Sonar way';
export const PROJECT_WITH_NO_CODE_ASSURANCE = 'no-ai';

interface AicaProject {
  aiCodeAssurance: AiCodeAssuranceStatus;
  containsAiCode: boolean;
  project: string;
}
export class AiCodeAssuredServiceMock {
  projectList: AicaProject[] = [];
  detectedAiCode = true;

  constructor() {
    this.reset();
    jest
      .mocked(getProjectBranchesAiCodeAssuranceStatus)
      .mockImplementation(this.handleProjectBranchAiAssuranceStatus);

    jest.mocked(setProjectAiGeneratedCode).mockImplementation(this.handleSetProjectAiGeneratedCode);
    jest.mocked(getProjectContainsAiCode).mockImplementation(this.handleProjectAiContainsCode);
    jest.mocked(getProjectDetectedAiCode).mockImplementation(this.handleProjectDetectedAiCode);
  }

  handleProjectBranchAiAssuranceStatus = (project: string) => {
    const projectFromList = this.projectList.find((p) => p.project === project);

    if (projectFromList) {
      return this.reply(projectFromList.aiCodeAssurance);
    }
    return Promise.reject({
      errors: [{ msg: 'project not found' }],
    });
  };

  handleProjectAiContainsCode = (project: string) => {
    const projectFromList = this.projectList.find((p) => p.project === project);

    if (projectFromList?.containsAiCode) {
      return this.reply(true);
    } else if (projectFromList?.containsAiCode === false) {
      return this.reply(false);
    }

    return Promise.reject({
      errors: [{ msg: 'project not found' }],
    });
  };

  handleProjectDetectedAiCode = () => {
    return Promise.resolve(this.detectedAiCode);
  };

  handleSetProjectAiGeneratedCode: typeof setProjectAiGeneratedCode = (
    project: string,
    containsAiCode: boolean,
  ) => {
    const projectFromList = this.projectList.find((p) => p.project === project);

    if (projectFromList && containsAiCode) {
      projectFromList.containsAiCode = true;
      return this.reply(undefined);
    } else if (projectFromList && !containsAiCode) {
      projectFromList.containsAiCode = false;
      return this.reply(undefined);
    }
    return Promise.reject({
      errors: [{ msg: 'project not found' }],
    });
  };

  setProject(data: Pick<AicaProject, 'project'> & Partial<AicaProject>) {
    const project = this.projectList.find((p) => p.project === data.project);
    if (project) {
      project.aiCodeAssurance = data.aiCodeAssurance ?? project.aiCodeAssurance;
      project.containsAiCode = data.containsAiCode ?? project.containsAiCode;
    } else {
      this.projectList.push({
        project: data.project,
        aiCodeAssurance: data.aiCodeAssurance ?? AiCodeAssuranceStatus.NONE,
        containsAiCode: data.containsAiCode ?? false,
      });
    }
  }

  reply<T>(response: T): Promise<T> {
    return Promise.resolve(cloneDeep(response));
  }

  reset() {
    this.projectList = [
      {
        project: PROJECT_WITH_AI_ASSURED_QG,
        aiCodeAssurance: AiCodeAssuranceStatus.AI_CODE_ASSURED_ON,
        containsAiCode: false,
      },
      {
        project: PROJECT_WITHOUT_AI_ASSURED_QG,
        aiCodeAssurance: AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF,
        containsAiCode: false,
      },
      {
        project: PROJECT_WITH_NO_CODE_ASSURANCE,
        aiCodeAssurance: AiCodeAssuranceStatus.NONE,
        containsAiCode: false,
      },
    ];
    this.detectedAiCode = true;
  }
}
