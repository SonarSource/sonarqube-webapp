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

import { mockIssueChangelogDiff } from '~shared/helpers/mocks/issues';
import { IssuesQuery } from '../../types/issues';
import { IssueChangelog } from '../../types/types';

export function mockIssueAuthors(overrides: string[] = []): string[] {
  return [
    'email1@sonarsource.com',
    'email2@sonarsource.com',
    'email3@sonarsource.com',
    'email4@sonarsource.com',
    ...overrides,
  ];
}

export function mockIssueChangelog(overrides: Partial<IssueChangelog> = {}): IssueChangelog {
  return {
    creationDate: '2018-10-01',
    isUserActive: true,
    user: 'luke.skywalker',
    userName: 'Luke Skywalker',
    diffs: [mockIssueChangelogDiff()],
    ...overrides,
  };
}

export function mockQuery(overrides: Partial<IssuesQuery> = {}): IssuesQuery {
  return {
    assigned: false,
    assignees: [],
    author: [],
    cleanCodeAttributeCategories: [],
    codeVariants: [],
    createdAfter: undefined,
    createdAt: '',
    createdBefore: undefined,
    createdInLast: '',
    cwe: [],
    directories: [],
    files: [],
    fixedInPullRequest: '',
    fromSonarQubeUpdate: undefined,
    issues: [],
    languages: [],
    linkedTicketStatus: [],
    owaspTop10: [],
    casa: [],
    'stig-ASD_V5R3': [],
    'stig-ASD_V6': [],
    'owaspTop10-2021': [],
    'owaspTop10-2025': [],
    'owaspMobileTop10-2024': [],
    'pciDss-3.2': [],
    'pciDss-4.0': [],
    'owaspAsvs-4.0': [],
    'owaspAsvs-5.0': [],
    'owaspMasvs-v2': [],
    prioritizedRule: undefined,
    projects: [],
    rules: [],
    scopes: [],
    severities: [],
    impactSeverities: [],
    impactSoftwareQualities: [],
    inNewCodePeriod: false,
    sonarsourceSecurity: [],
    issueStatuses: [],
    sort: '',
    tags: [],
    types: [],
    statuses: [],
    ...overrides,
  };
}
