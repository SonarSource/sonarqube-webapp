/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import * as React from 'react';
import { renderComponent } from '../../../../helpers/testReactTestingUtils';
import CommentPopup, { CommentPopupProps } from '../CommentPopup';

it('should trigger comment change', async () => {
  const user = userEvent.setup();
  const onComment = jest.fn();
  const toggleComment = jest.fn();
  shallowRender({ onComment, toggleComment });

  expect(await screen.findByRole('textbox')).toHaveFocus();
  await user.keyboard('test');
  await user.keyboard('{Control>}{Enter}{/Control}');
  expect(onComment).toHaveBeenCalledWith('test');

  await user.click(screen.getByRole('button', { name: 'issue.comment.add_comment.cancel' }));
  expect(toggleComment).toHaveBeenCalledWith(false);
});

function shallowRender(overrides: Partial<CommentPopupProps> = {}) {
  return renderComponent(
    <CommentPopup
      onComment={jest.fn()}
      placeholder="placeholder test"
      toggleComment={jest.fn()}
      {...overrides}
    />
  );
}
