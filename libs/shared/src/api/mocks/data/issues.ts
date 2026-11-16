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

import { IssueShared } from '../../issues';
import { IssueProducer } from '../../../types/issues';

export function mockRulelessIssue(overrides: Partial<IssueShared> = {}): IssueShared {
  const issue = {
    component: 'project:main.js',
    componentKey: 'project:main.js',
    creationDate: '2026-01-01T00:00:00+0000',
    impacts: [],
    key: 'da-ruleless-issue',
    message: 'The request reaches a protected resource without authorization.',
    producer: IssueProducer.HunterAgent,
    title: 'Missing authorization check',
    findingCategory: 'broken-access-control',
    tags: ['hunter-agent', 'hunter-broken-access-control'],
    ...overrides,
  };
  if (issue.producer === IssueProducer.Scanner) {
    if (issue.rule === undefined) {
      throw new Error('Scanner issues require a rule');
    }
    return { ...issue, producer: IssueProducer.Scanner, rule: issue.rule };
  }
  return { ...issue, producer: issue.producer };
}
