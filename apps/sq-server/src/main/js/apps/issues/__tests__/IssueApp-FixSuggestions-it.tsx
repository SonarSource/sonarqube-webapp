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
import { range } from 'lodash';
import { ISSUE_101, ISSUE_1101, ISSUE_2 } from '~sq-server-commons/api/mocks/data/ids';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import {
  branchHandler,
  componentsHandler,
  issuesHandler,
  modeHandler,
  sourcesHandler,
  ui,
  usersHandler,
} from '~sq-server-commons/utils/issues-test-utils';
import { renderProjectIssuesApp } from '../test-utils';

beforeEach(() => {
  issuesHandler.reset();
  componentsHandler.reset();
  branchHandler.reset();
  usersHandler.reset();
  modeHandler.reset();
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

it('should be able to trigger a fix when feature is available', async () => {
  componentsHandler.registerComponent({
    ...mockComponent({ key: 'myproject' }),
    isAiCodeFixEnabled: true,
  } as Component);
  sourcesHandler.setSource(
    range(0, 1)
      .map((n) => `line: ${n}`)
      .join('\n'),
  );
  const user = userEvent.setup();
  renderProjectIssuesApp(
    `project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`,
    {},
    mockLoggedInUser(),
    [Feature.BranchSupport, Feature.FixSuggestions],
  );

  expect(await ui.getFixSuggestion.find(undefined, { timeout: 10_000 })).toBeInTheDocument();
  await user.click(ui.getFixSuggestion.get());

  expect(await ui.suggestedExplanation.find()).toBeInTheDocument();

  await user.click(ui.issueCodeTab.get());

  expect(ui.seeFixSuggestion.get()).toBeInTheDocument();
});

it('should not be able to trigger a fix when user is not logged in', async () => {
  renderProjectIssuesApp(
    'project/issues?issueStatuses=CONFIRMED&open=issue2&id=myproject',
    {},
    mockCurrentUser(),
    [Feature.BranchSupport, Feature.FixSuggestions],
  );
  expect(await ui.issueCodeTab.find(undefined, { timeout: 10_000 })).toBeInTheDocument();
  expect(ui.getFixSuggestion.query()).not.toBeInTheDocument();
  expect(ui.issueCodeFixTab.query()).not.toBeInTheDocument();
});

it('should not be able to trigger a fix when the feature is disabled', async () => {
  componentsHandler.registerComponent({
    ...mockComponent({ key: 'myproject' }),
    isAiCodeFixEnabled: false,
  } as Component);
  sourcesHandler.setSource(
    range(0, 1)
      .map((n) => `line: ${n}`)
      .join('\n'),
  );
  renderProjectIssuesApp(
    `project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`,
    {},
    mockLoggedInUser(),
    [Feature.BranchSupport, Feature.FixSuggestions],
  );

  expect(await ui.issueCodeTab.find(undefined, { timeout: 10_000 })).toBeInTheDocument();
  expect(ui.getFixSuggestion.query()).not.toBeInTheDocument();
  expect(ui.issueCodeFixTab.query()).not.toBeInTheDocument();
});

it('should not be able to trigger a fix when issue is not eligible', async () => {
  renderProjectIssuesApp(
    `project/issues?issueStatuses=CONFIRMED&open=${ISSUE_1101}&id=myproject`,
    {},
    mockCurrentUser(),
    [Feature.BranchSupport, Feature.FixSuggestions],
  );
  expect(await ui.issueCodeTab.find(undefined, { timeout: 10_000 })).toBeInTheDocument();
  expect(ui.getFixSuggestion.query()).not.toBeInTheDocument();
  expect(ui.issueCodeFixTab.query()).not.toBeInTheDocument();
});

it('should show error when no fix is available', async () => {
  componentsHandler.registerComponent({
    ...mockComponent({ key: 'myproject' }),
    isAiCodeFixEnabled: true,
  } as Component);
  const user = userEvent.setup();
  renderProjectIssuesApp(
    `project/issues?issueStatuses=CONFIRMED&open=${ISSUE_101}&id=myproject`,
    {},
    mockLoggedInUser(),
    [Feature.BranchSupport, Feature.FixSuggestions],
  );

  await user.click(await ui.issueCodeFixTab.find(undefined, { timeout: 10_000 }));
  await user.click(ui.getAFixSuggestion.get());

  expect(await ui.noFixAvailable.find()).toBeInTheDocument();
});
