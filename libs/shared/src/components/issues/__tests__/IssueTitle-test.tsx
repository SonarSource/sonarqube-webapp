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
import { copy } from 'clipboard';
import { renderWithContext } from '../../../helpers/test-utils';
import { IssueTitle } from '../IssueTitle';

jest.mock('clipboard', () => ({
  copy: jest.fn().mockImplementation((a: string) => a),
}));

it('renders the permalink button next to the heading, not inside it', async () => {
  const { user } = renderWithContext(
    <IssueTitle closeIssue={jest.fn()} issuePermalink="/issues?open=abc" title="My issue title" />,
  );

  const heading = screen.getByRole('heading', { level: 3, name: 'My issue title' });
  const permalinkButton = screen.getByRole('button', { name: 'permalink' });

  expect(heading).not.toContainElement(permalinkButton);

  await user.click(permalinkButton);

  expect(copy).toHaveBeenCalledWith('/issues?open=abc');
});
