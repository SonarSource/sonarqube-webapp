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

import userEvent from '@testing-library/user-event';
import { byRole, byText } from '~shared/helpers/testSelector';
import { PARENT_COMPONENT_KEY } from '~sq-server-commons/api/mocks/data/ids';
import { mockCurrentUser, mockRawIssue } from '~sq-server-commons/helpers/testMocks';
import { Feature } from '~sq-server-commons/types/features';
import {
  branchHandler,
  componentsHandler,
  issuesHandler,
  modeHandler,
  ui,
  usersHandler,
} from '~sq-server-commons/utils/issues-test-utils';
import { renderProjectIssuesApp } from '../test-utils';

const ISSUE_KEY = 'architectureIssue';

// Repository + suffix are on the allow-list inside the private architecture addon.
const ARCHITECTURE_RULE = 'tsarchitecture:S8464';

// Test intl provider has no messages loaded, so formatMessage() falls back to the raw l10n key.
const intendedArchitectureButton = byRole('button', { name: 'architecture.page.model' });

beforeEach(() => {
  issuesHandler.reset();
  componentsHandler.reset();
  branchHandler.reset();
  usersHandler.reset();
  modeHandler.reset();
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

function renderIssueOnRule(rule: string, featureList: Feature[]) {
  issuesHandler.setIssueList([
    {
      issue: mockRawIssue(false, {
        key: ISSUE_KEY,
        component: `${PARENT_COMPONENT_KEY}:test1.js`,
        message: 'Architecture deviation',
        project: 'myproject',
        rule,
      }),
      snippets: {},
    },
  ]);

  renderProjectIssuesApp(
    `project/issues?issues=${ISSUE_KEY}&open=${ISSUE_KEY}&id=myproject`,
    {},
    mockCurrentUser(),
    featureList,
  );
}


it('does not show the intended architecture action without the architecture feature', async () => {
  renderIssueOnRule(ARCHITECTURE_RULE, [Feature.BranchSupport]);

  expect(await ui.issueCodeTab.find()).toBeInTheDocument();
  expect(intendedArchitectureButton.query()).not.toBeInTheDocument();
});
