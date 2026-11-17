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
import userEvent from '@testing-library/user-event';
import { FCProps } from '../../../types/misc';
import { render } from '../../helpers/testUtils';
import { LineFinding } from '../code-line/LineFinding';

it('should render a selected finding as plain text, even when onIssueSelect is provided', async () => {
  const onIssueSelect = jest.fn();
  const user = userEvent.setup();
  setupWithProps({ onIssueSelect, selected: true });

  expect(screen.getByText('message')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();

  await user.tab();
  expect(document.body).toHaveFocus();
  expect(onIssueSelect).not.toHaveBeenCalled();
});

it('should render a selected finding with its fix button as the only interactive element', () => {
  setupWithProps({ getFixButton: <button type="button">fix</button>, selected: true });

  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'fix' })).toBeInTheDocument();
});

it('should render a non-selected finding as an actionable button', async () => {
  const onIssueSelect = jest.fn();
  const user = userEvent.setup();
  setupWithProps({ onIssueSelect, selected: false });

  await user.click(screen.getByRole('button', { name: 'message' }));
  expect(onIssueSelect).toHaveBeenCalledWith('key');
});

it('should render as non-button when "as" is a div', () => {
  setupWithProps({ as: 'div', onIssueSelect: undefined, selected: false });
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

function setupWithProps(props?: Partial<FCProps<typeof LineFinding>>) {
  return render(
    <LineFinding issueKey="key" message="message" onIssueSelect={jest.fn()} {...props} />,
  );
}
