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

import { screen } from '@testing-library/react';
import { mockIssue } from '../../../../helpers/testMocks';
import { renderComponent } from '../../../../helpers/testReactTestingUtils';
import { Issue } from '../../../../types/types';
import IssueActionsBar from '../IssueActionsBar';

jest.mock('../IssueTransition', () => ({
  __esModule: true,
  default: () => <span>transition</span>,
}));

jest.mock('../IssueAssign', () => ({
  __esModule: true,
  default: () => <span>assign</span>,
}));

function AgentAction() {
  return <button type="button">fix with agent</button>;
}

function HiddenAction() {
  return null;
}

/** The additional-action items, skipping the built-in transition and assign items. */
function getAdditionalActionItems() {
  return Array.from(screen.getByRole('list').children).slice(2);
}

it('collapses the item of an action that renders nothing', () => {
  renderActionsBar([HiddenAction]);

  const [item] = getAdditionalActionItems();
  // The <li> stays in the DOM (the parent owns it), so `empty:sw-hidden` is what stops it
  // from consuming a flex gap. jsdom loads no Tailwind stylesheet, hence asserting the hook
  // rather than a computed display value.
  expect(item).toBeEmptyDOMElement();
  expect(item).toHaveClass('empty:sw-hidden');
});

it('renders a visible action inside its own list item without needing the action to emit one', () => {
  renderActionsBar([AgentAction]);

  const [item] = getAdditionalActionItems();
  expect(item.tagName).toBe('LI');
  expect(screen.getByRole('button', { name: 'fix with agent' })).toBeInTheDocument();
});

function renderActionsBar(
  additionalIssueActions: React.ComponentType<{ issue: Issue }>[] | undefined = undefined,
) {
  return renderComponent(
    <IssueActionsBar
      additionalIssueActions={additionalIssueActions}
      issue={mockIssue()}
      onAssign={jest.fn()}
      onChange={jest.fn()}
      togglePopup={jest.fn()}
    />,
  );
}
