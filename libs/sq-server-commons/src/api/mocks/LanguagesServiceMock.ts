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
import { getLanguages } from '~shared/api/languages';
import { Language } from '~shared/types/languages';

jest.mock('~shared/api/languages');

const defaultLanguages: Language[] = [
  { key: 'abap', name: 'ABAP' },
  { key: 'apex', name: 'Apex' },
  { key: 'azureresourcemanager', name: 'AzureResourceManager' },
  { key: 'c', name: 'C' },
  { key: 'cs', name: 'C#' },
  { key: 'cpp', name: 'C++' },
  { key: 'cobol', name: 'COBOL' },
  { key: 'css', name: 'CSS' },
  { key: 'cloudformation', name: 'CloudFormation' },
  { key: 'docker', name: 'Docker' },
  { key: 'flex', name: 'Flex' },
  { key: 'go', name: 'Go' },
  { key: 'html', name: 'HTML' },
  { key: 'json', name: 'JSON' },
  { key: 'jsp', name: 'JSP' },
  { key: 'java', name: 'Java' },
  { key: 'js', name: 'JavaScript' },
  { key: 'kotlin', name: 'Kotlin' },
  { key: 'kubernetes', name: 'Kubernetes' },
  { key: 'objc', name: 'Objective-C' },
  { key: 'php', name: 'PHP' },
  { key: 'pli', name: 'PL/I' },
  { key: 'plsql', name: 'PL/SQL' },
  { key: 'py', name: 'Python' },
  { key: 'rpg', name: 'RPG' },
  { key: 'ruby', name: 'Ruby' },
  { key: 'scala', name: 'Scala' },
  { key: 'secrets', name: 'Secrets' },
  { key: 'swift', name: 'Swift' },
  { key: 'tsql', name: 'T-SQL' },
  { key: 'terraform', name: 'Terraform' },
  { key: 'text', name: 'Text' },
  { key: 'ts', name: 'TypeScript' },
  { key: 'vbnet', name: 'VB.NET' },
  { key: 'vb', name: 'Vb' },
  { key: 'xml', name: 'XML' },
  { key: 'yaml', name: 'YAML' },
];

export class LanguagesServiceMock {
  languages = cloneDeep(defaultLanguages);

  constructor() {
    jest.mocked(getLanguages).mockImplementation(this.handleGetLanguages);
  }

  handleGetLanguages: typeof getLanguages = () => {
    return this.reply(this.languages);
  };

  set(languages: Language[]) {
    this.languages = languages;
  }

  reset() {
    this.languages = cloneDeep(defaultLanguages);
  }

  reply<T>(response: T): Promise<T> {
    return Promise.resolve(cloneDeep(response));
  }
}
