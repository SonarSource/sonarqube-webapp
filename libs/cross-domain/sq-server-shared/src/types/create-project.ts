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

export enum CreateProjectModes {
  Manual = 'manual',
  AzureDevOps = 'azure',
  BitbucketServer = 'bitbucket',
  BitbucketCloud = 'bitbucketcloud',
  GitHub = 'github',
  GitLab = 'gitlab',
}

export type ImportProjectParam =
  | {
      almSetting: string;
      creationMode: CreateProjectModes.AzureDevOps;
      monorepo: false;
      projects: {
        projectName: string;
        repositoryName: string;
      }[];
    }
  | {
      almSetting: string;
      creationMode: CreateProjectModes.BitbucketCloud;
      monorepo: false;
      projects: {
        repositorySlug: string;
      }[];
    }
  | {
      almSetting: string;
      creationMode: CreateProjectModes.BitbucketServer;
      monorepo: false;
      projects: {
        projectKey: string;
        repositorySlug: string;
      }[];
    }
  | {
      almSetting: string;
      creationMode: CreateProjectModes.GitHub;
      monorepo: false;
      projects: {
        repositoryKey: string;
      }[];
    }
  | {
      almSetting: string;
      creationMode: CreateProjectModes.GitLab;
      monorepo: false;
      projects: {
        gitlabProjectId: string;
      }[];
    }
  | {
      creationMode: CreateProjectModes.Manual;
      monorepo: false;
      projects: {
        mainBranch: string;
        name: string;
        project: string;
      }[];
    }
  | {
      creationMode: CreateProjectModes;
      devOpsPlatformSettingId: string;
      monorepo: true;
      projectIdentifier?: string;
      projects: {
        projectKey: string;
        projectName: string;
      }[];
      repositoryIdentifier: string;
    };
