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

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import { IssueTransition } from '~shared/types/issues';
import {
  EXTERNAL_RULE,
  FILE3_KEY,
  HUNTER_AGENT_RULE,
  ISSUE_2,
  ISSUE_5,
  PARENT_COMPONENT_KEY,
} from '~sq-server-commons/api/mocks/data/ids';
import { TabKeys } from '~sq-server-commons/components/rules/RuleTabViewer';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { mockLoggedInUser, mockRawIssue } from '~sq-server-commons/helpers/testMocks';
import { IssueStatus } from '~sq-server-commons/types/issues';
import { NoticeType, RestUserDetailed } from '~sq-server-commons/types/users';
import {
  branchHandler,
  componentsHandler,
  issuesHandler,
  modeHandler,
  ui,
  usersHandler,
} from '~sq-server-commons/utils/issues-test-utils';
import { renderIssueApp, renderProjectIssuesApp } from '../test-utils';

// Matches a file registered by default in ComponentsServiceMock, so the code viewer can resolve it.
const REGISTERED_COMPONENT = `${PARENT_COMPONENT_KEY}:${FILE3_KEY}`;

jest.mock('../sidebar/Sidebar', () => {
  const fakeSidebar = () => {
    return <div data-guiding-id="issue-5" />;
  };
  return {
    __esModule: true,
    default: fakeSidebar,
    Sidebar: fakeSidebar,
  };
});

beforeEach(() => {
  issuesHandler.reset();
  componentsHandler.reset();
  branchHandler.reset();
  usersHandler.reset();
  modeHandler.reset();
  usersHandler.users = [mockLoggedInUser() as unknown as RestUserDetailed];
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

describe('issue app', () => {
  describe('rendering the open issue', () => {
    it('should always be able to render the open issue', async () => {
      renderProjectIssuesApp(
        'project/issues?issueStatuses=CONFIRMED&open=issue2&id=myproject&why=1',
      );

      expect(await ui.conciseIssueTotal.find(undefined, { timeout: 10_000 })).toHaveTextContent(
        '5',
      );
      expect(ui.conciseIssueItem4.get()).toBeInTheDocument();
      expect(ui.conciseIssueItem2.get()).toBeInTheDocument();
    });

    it('shows code variants and the prioritized rule badge under Properties in the sidebar', async () => {
      renderProjectIssuesApp(`project/issues?issues=${ISSUE_5}&open=${ISSUE_5}&id=myproject`);

      expect(
        await screen.findByRole(
          'heading',
          { name: 'Issue with prioritized rule' },
          { timeout: 10_000 },
        ),
      ).toBeInTheDocument();

      expect(byText('issue.details.properties').get()).toBeInTheDocument();
      expect(byText('variant 1').get()).toBeInTheDocument();
      expect(byText('variant 2').get()).toBeInTheDocument();
      expect(byText('prioritized').get()).toBeInTheDocument();
    });

    it('shows the external rule key when it differs from the rule name', async () => {
      const issueKey = 'hunterAgentIssue';
      issuesHandler.setIssueList([
        {
          issue: mockRawIssue(false, {
            key: issueKey,
            component: REGISTERED_COMPONENT,
            rule: HUNTER_AGENT_RULE,
          }),
          snippets: {},
        },
      ]);

      renderProjectIssuesApp(`project/issues?issues=${issueKey}&open=${issueKey}&id=myproject`);

      expect(
        await screen.findByText('Hunter agent rule', undefined, { timeout: 10_000 }),
      ).toBeInTheDocument();
      expect(byText('(hunterAgentRuleId)').get()).toBeInTheDocument();
    });

    it('does not show the external rule key when it matches the rule name', async () => {
      const issueKey = 'externalRuleIssue';
      issuesHandler.setIssueList([
        {
          issue: mockRawIssue(false, {
            key: issueKey,
            component: REGISTERED_COMPONENT,
            rule: EXTERNAL_RULE,
          }),
          snippets: {},
        },
      ]);

      renderProjectIssuesApp(`project/issues?issues=${issueKey}&open=${issueKey}&id=myproject`);

      expect(
        await screen.findByText('eslint:no-unused-vars', undefined, { timeout: 10_000 }),
      ).toBeInTheDocument();
      expect(byText('(eslint:no-unused-vars)').query()).not.toBeInTheDocument();
    });

    it('should show the advanced SAST badge for issues with taint and advanced internal tags', async () => {
      const issueKey = 'advancedSastIssue';
      issuesHandler.setIssueList([
        {
          issue: mockRawIssue(false, {
            key: issueKey,
            component: REGISTERED_COMPONENT,
            message: 'Fix that',
            internalTags: ['taint', 'advanced'],
          }),
          snippets: {},
        },
      ]);

      renderProjectIssuesApp(
        `project/issues?issueStatuses=CONFIRMED&open=${issueKey}&id=myproject`,
      );

      expect(
        await screen.findByText('ADVANCED SAST', undefined, { timeout: 10_000 }),
      ).toBeVisible();
    });

    it('should not show the advanced SAST badge for issues without both required internal tags', async () => {
      const issueKey = 'advancedSastIssue';
      issuesHandler.setIssueList([
        {
          issue: mockRawIssue(false, {
            key: issueKey,
            component: REGISTERED_COMPONENT,
            message: 'Fix that',
            internalTags: ['taint'],
          }),
          snippets: {},
        },
      ]);

      renderProjectIssuesApp(
        `project/issues?issueStatuses=CONFIRMED&open=${issueKey}&id=myproject`,
      );

      await screen.findByRole('heading', { name: 'Fix that' }, { timeout: 10_000 });
      expect(screen.queryByText('ADVANCED SAST')).not.toBeInTheDocument();
    });

    it('should show sonarlint badge if applicable', async () => {
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      renderIssueApp();

      // Select an issue with quick fix available
      await user.click(await ui.issueItemAction7.find(undefined, { timeout: 10_000 }));

      await expect(screen.getByText('issue.quick_fix')).toHaveATooltipWithContent(
        'issue.quick_fix_available_with_sonarlint',
      );
    });
  });

  describe('flows and locations', () => {
    it('should interact with flows and locations', async () => {
      const user = userEvent.setup();
      renderProjectIssuesApp('project/issues?id=myproject');

      await user.click(await ui.issueItemAction2.find(undefined, { timeout: 10_000 }));

      expect(await screen.findByLabelText('list_of_issues')).toBeInTheDocument();

      const dataFlowButton = await screen.findByRole('button', {
        name: 'issue.flow.x_steps.2 Backtracking 1',
      });
      const exectionFlowButton = screen.getByRole('button', {
        name: 'issue.show_full_execution_flow.3',
      });

      let dataLocation1Button = screen.getByLabelText('Data location 1');
      let dataLocation2Button = screen.getByLabelText('Data location 2');

      expect(dataFlowButton).toBeInTheDocument();
      expect(dataLocation1Button).toBeInTheDocument();
      expect(dataLocation2Button).toBeInTheDocument();

      await user.click(dataFlowButton);
      // Colapsing flow
      expect(dataLocation1Button).not.toBeInTheDocument();
      expect(dataLocation2Button).not.toBeInTheDocument();

      await user.click(exectionFlowButton);
      expect(screen.getByLabelText('Execution location 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Execution location 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Execution location 3')).toBeInTheDocument();

      // Keyboard interaction
      await user.click(dataFlowButton);
      dataLocation1Button = screen.getByLabelText('Data location 1');
      dataLocation2Button = screen.getByLabelText('Data location 2');

      // Location navigation
      await user.keyboard('{Alt>}{ArrowDown}{/Alt}');

      expect(dataLocation1Button).toHaveAttribute('aria-current', 'true');
      await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
      expect(dataLocation1Button).toHaveAttribute('aria-current', 'false');
      expect(dataLocation2Button).toHaveAttribute('aria-current', 'true');
      await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
      expect(dataLocation1Button).toHaveAttribute('aria-current', 'false');
      expect(dataLocation2Button).toHaveAttribute('aria-current', 'false');
      await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
      expect(dataLocation1Button).toHaveAttribute('aria-current', 'false');

      expect(dataLocation2Button).toHaveAttribute('aria-current', 'true');

      // Flow navigation
      await user.keyboard('{Alt>}{ArrowRight}{/Alt}');
      expect(screen.getByLabelText('Execution location 3')).toHaveAttribute('aria-current', 'true');
      await user.keyboard('{Alt>}{ArrowLeft}{/Alt}');
      expect(screen.getByLabelText('Data location 1')).toHaveAttribute('aria-current', 'true');
    });

    it('should show code tabs when any secondary location is selected', async () => {
      const user = userEvent.setup();
      renderIssueApp();

      await user.click(await ui.issueItemAction4.find(undefined, { timeout: 10_000 }));

      expect(screen.getByRole('button', { name: 'location 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'location 2' })).toBeInTheDocument();

      // Select the "why is this an issue" tab
      await user.click(
        screen.getByRole('tab', { name: 'coding_rules.description_section.title.root_cause' }),
      );

      expect(
        screen.queryByRole('tab', {
          name: `issue.tabs.${TabKeys.Code}`,
        }),
      ).toHaveAttribute('aria-current', 'false');

      await user.click(screen.getByRole('button', { name: 'location 1' }));

      expect(
        screen.queryByRole('tab', {
          name: `issue.tabs.${TabKeys.Code}`,
        }),
      ).toHaveAttribute('aria-current', 'true');

      // Select the same selected hotspot location should also navigate back to code page
      await user.click(
        screen.getByRole('tab', { name: 'coding_rules.description_section.title.root_cause' }),
      );

      expect(
        screen.queryByRole('tab', {
          name: `issue.tabs.${TabKeys.Code}`,
        }),
      ).toHaveAttribute('aria-current', 'false');

      await user.click(screen.getByRole('button', { name: 'location 1' }));

      expect(
        screen.queryByRole('tab', {
          name: `issue.tabs.${TabKeys.Code}`,
        }),
      ).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('actions', () => {
    it('should be able to change the issue status', async () => {
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      renderIssueApp();

      const issueContainer = await byLabelText('Fix that').find(); // Get a specific issue list item
      expect(ui.statusBtn(IssueStatus.Open).get(issueContainer)).toBeInTheDocument();

      await user.click(ui.statusBtn(IssueStatus.Open).get(issueContainer));

      expect(byText('issue.transition.title').get()).toBeInTheDocument();
      expect(ui.issueTransitionItem(IssueTransition.Accept).get()).toBeInTheDocument();
      expect(ui.issueTransitionItem(IssueTransition.Confirm).get()).toBeInTheDocument();

      // test add comment dialog (cancel)
      await user.click(ui.issueTransitionItem(IssueTransition.FalsePositive).get());
      expect(ui.commentDialogTitle.get()).toBeInTheDocument();
      expect(byRole('heading', { name: 'issue.transition.title' }).query()).not.toBeInTheDocument();

      await user.click(byRole('button', { name: 'cancel' }).get());
      expect(ui.statusBtn(IssueStatus.Open).get(issueContainer)).toBeInTheDocument();

      // test add comment dialog (confirm)
      await user.click(ui.statusBtn(IssueStatus.Open).get(issueContainer));
      await user.click(ui.issueTransitionItem(IssueTransition.FalsePositive).get());
      await user.click(ui.changeStatusBtn.get());

      expect(ui.statusBtn(IssueStatus.FalsePositive).get(issueContainer)).toBeInTheDocument();

      // Change back to open
      await user.click(ui.statusBtn(IssueStatus.FalsePositive).get(issueContainer));
      await user.click(ui.issueTransitionItem(IssueTransition.Reopen).get());

      expect(await ui.statusBtn(IssueStatus.Open).find(issueContainer)).toBeInTheDocument();

      // Accept issue
      await user.click(ui.statusBtn(IssueStatus.Open).get(issueContainer));
      await user.click(ui.issueTransitionItem(IssueTransition.Accept).get());
      await user.click(ui.changeStatusBtn.get());

      expect(ui.statusBtn(IssueStatus.Accepted).get(issueContainer)).toBeInTheDocument();
    });

    it('should be able to assign issue to a different user', async () => {
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      renderIssueApp();

      // Get a specific issue list item
      const listItem = within(
        await screen.findByLabelText('Fix that', undefined, { timeout: 10_000 }),
      );

      await user.click(
        listItem.getByRole('combobox', { name: 'issue.assign.unassigned_click_to_assign' }),
      );

      await user.keyboard('luke');

      expect(await screen.findByText('Skywalker')).toBeInTheDocument();

      await user.click(screen.getByText('Skywalker'));

      expect(
        listItem.getByRole('combobox', { name: 'issue.assign.assigned_to_x_click_to_change.luke' }),
      ).toBeInTheDocument();
    });

    it('should assign the issue to self when pressing the m keyboard shortcut', async () => {
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      // The "assign to me" shortcut requires a logged-in user.
      renderIssueApp(
        mockLoggedInUser({
          dismissedNotices: {
            [NoticeType.ISSUE_GUIDE]: true,
            [NoticeType.ISSUE_NEW_STATUS_AND_TRANSITION_GUIDE]: true,
          },
        }),
      );

      // Select the issue so the keyboard shortcut listener is attached.
      await user.click(await ui.issueItemAction5.find(undefined, { timeout: 10_000 }));

      expect(
        await screen.findByRole(
          'combobox',
          { name: 'issue.assign.unassigned_click_to_assign' },
          { timeout: 10_000 },
        ),
      ).toBeInTheDocument();

      await user.keyboard('m');

      expect(
        await screen.findByRole('combobox', {
          name: 'issue.assign.assigned_to_x_click_to_change.luke',
        }),
      ).toBeInTheDocument();
    });

    it('should not let the user assign an issue via click or keyboard shortcut when they are not entitled to assign', async () => {
      const user = userEvent.setup();
      renderIssueApp();

      // ISSUE_1 ("Fix this") has no actions, so assignment should be disabled.
      await user.click(await ui.issueItemAction4.find(undefined, { timeout: 10_000 }));

      expect(
        await screen.findByRole('heading', { name: 'Fix this' }, { timeout: 10_000 }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('combobox', { name: /^issue\.assign/ })).not.toBeInTheDocument();

      await user.keyboard('m');

      expect(screen.queryByRole('combobox', { name: /^issue\.assign/ })).not.toBeInTheDocument();
    });

    it('should be able to change tags on a issue', async () => {
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      renderIssueApp();

      // Get a specific issue list item
      const listItem = within(
        await screen.findByLabelText('Fix that', undefined, { timeout: 10_000 }),
      );

      // Change tags
      expect(listItem.getByText('no_tags')).toBeInTheDocument();

      await user.click(listItem.getByText('no_tags'));

      expect(byLabelText('search.search_for_tags').get()).toBeInTheDocument();
      expect(byText('android').get()).toBeInTheDocument();
      expect(byText('accessibility').get()).toBeInTheDocument();

      await user.click(screen.getByText('accessibility'));
      await user.click(screen.getByText('android'));

      await user.keyboard('{Escape}');
      expect(
        await byRole('button', { name: 'tags.edit_button_label.accessibility, android' }).find(),
      ).toBeInTheDocument();

      await user.click(listItem.getByRole('button', { name: /tags.edit_button_label/ }));

      // Unselect
      await user.click(byLabelText('accessibility').get());

      await user.keyboard('{Escape}');
      expect(
        await byRole('button', { name: 'tags.edit_button_label.android' }).find(),
      ).toBeInTheDocument();

      await user.click(listItem.getByRole('button', { name: /tags.edit_button_label/ }));

      await user.click(byLabelText('search.search_for_tags').get());
      await user.keyboard('addNewTag');

      expect(byLabelText('issue.create_tag: addnewtag').get()).toBeInTheDocument();
    });

    it('should not allow performing actions when user does not have permission', async () => {
      const user = userEvent.setup();
      renderIssueApp();

      await user.click(await ui.issueItem4.find(undefined, { timeout: 10_000 }));

      expect(
        screen.queryByRole('button', {
          name: `issue.assign.unassigned_click_to_assign`,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: `issue.type.type_x_click_to_change.issue.type.CODE_SMELL`,
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('button', {
          name: `transition_status.status_x_click_to_change.issue.status.OPEN`,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: `issue.severity.severity_x_click_to_change.severity.MAJOR`,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('side panel navigation', () => {
    it('should close the issue detail view when clicking the back-to-list button in the header', async () => {
      const user = userEvent.setup();
      renderProjectIssuesApp(`project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`);

      expect(
        await screen.findByRole('heading', { name: 'Fix that' }, { timeout: 10_000 }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'issue.back_to_issues_list' }));

      expect(screen.queryByRole('heading', { name: 'Fix that' })).not.toBeInTheDocument();
    });

    it('should reset any open popup in the side panel when switching to a different open issue', async () => {
      const user = userEvent.setup();
      renderProjectIssuesApp(`project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`);

      await user.click(
        await screen.findByRole('button', { name: 'tags.add_tags' }, { timeout: 10_000 }),
      );
      expect(await byLabelText('search.search_for_tags').find()).toBeInTheDocument();

      // Switch to a different open issue via the nav bar, without closing the tags popup first.
      await user.click(ui.conciseIssueItem4.get());

      expect(
        await screen.findByRole('heading', { name: 'Issue with tags' }, { timeout: 10_000 }),
      ).toBeInTheDocument();
      expect(byLabelText('search.search_for_tags').query()).not.toBeInTheDocument();
    });
  });

  describe('keyboard shortcuts', () => {
    it('should open the actions popup using keyboard shortcut', async () => {
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      renderIssueApp();

      // Select an issue with an advanced rule
      await user.click(await ui.issueItemAction5.find(undefined, { timeout: 10_000 }));

      // Open status popup on key press 'f'
      await user.keyboard('f');

      expect(await ui.issueTransitionItem(IssueTransition.Confirm).find()).toBeInTheDocument();

      // Open tags popup on key press 't'
      await user.keyboard('t');
      expect(
        await screen.findByRole('searchbox', { name: 'search.search_for_tags' }),
      ).toBeInTheDocument();

      expect(screen.getByText('android')).toBeInTheDocument();
      expect(screen.getByText('accessibility')).toBeInTheDocument();

      // Close tags popup
      await user.keyboard(`{${KeyboardKeys.Escape}}`);

      // Open assign popup on key press 'a'
      await user.keyboard('a');

      expect(
        await screen.findByRole('combobox', {
          expanded: true,
          name: 'issue.assign.unassigned_click_to_assign',
        }),
      ).toBeInTheDocument();
    });

    it('should not open the actions popup using keyboard shortcut when keyboard shortcut flag is disabled', async () => {
      localStorage.setItem('sonarqube.preferences.keyboard_shortcuts_enabled', 'false');
      const user = userEvent.setup();
      issuesHandler.setIsAdmin(true);
      renderIssueApp();

      // Select an issue with an advanced rule
      await user.click(await ui.issueItem5.find(undefined, { timeout: 10_000 }));

      // open status popup on key press 'f'
      await user.keyboard('f');
      expect(screen.queryByText('status_transition.confirm')).not.toBeInTheDocument();
      expect(screen.queryByText('status_transition.resolve')).not.toBeInTheDocument();

      // open comment popup on key press 'c'
      await user.keyboard('c');
      expect(screen.queryByText('issue.comment.submit')).not.toBeInTheDocument();
      localStorage.setItem('sonarqube.preferences.keyboard_shortcuts_enabled', 'true');
    });
  });
});
