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

import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import { Language } from '~shared/types/languages';

export interface LanguagesServiceData {
  languages: Language[];
}

export class LanguagesServiceMock extends AbstractServiceMock<LanguagesServiceData> {
  handlers = [http.get('/api/languages/list', () => this.ok({ languages: this.data.languages }))];
}

export const LanguagesServiceDefaultDataset: LanguagesServiceData = {
  languages: [
    { key: 'java', name: 'Java' },
    { key: 'ts', name: 'TypeScript' },
    { key: 'js', name: 'JavaScript' },
    { key: 'py', name: 'Python' },
    { key: 'cs', name: 'C#' },
  ],
};
