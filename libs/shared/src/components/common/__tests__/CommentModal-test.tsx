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

import { act, screen } from '@testing-library/react';
import { renderWithRouter } from '../../../helpers/test-utils';
import { CommentModal, CommentModalProps } from '../CommentModal';

it('should render correctly', async () => {
  setupWithProps({ comment: '' });
  expect(await screen.findByRole('textbox')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'save' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'cancel' })).toBeVisible();
});

it('should render correctly with comment', async () => {
  setupWithProps({ comment: 'testing' });
  expect(await screen.findByRole('textbox')).toHaveValue('testing');
});

it('should render correctly with comment header', async () => {
  setupWithProps({ commentHeader: 'comment header' });
  await screen.findByRole('textbox');
  expect(screen.getByText('comment header')).toBeVisible();
});

it('submit button should be disabled if comment is empty', async () => {
  const { user } = setupWithProps();
  const textField = await screen.findByRole('textbox');
  await user.clear(textField);
  expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
});

it('should trigger update comment', async () => {
  const onSubmit = jest.fn();
  const { user } = setupWithProps({ onSubmit, comment: '' });
  const textField = await screen.findByRole('textbox');
  await user.type(textField, 'test');
  await user.click(screen.getByRole('button', { name: 'save' }));
  expect(onSubmit).toHaveBeenCalledWith('test');
});

it('should trigger cancel update comment', async () => {
  const onCancel = jest.fn();
  const { user } = setupWithProps({ onCancel });
  await user.click(screen.getByRole('button', { name: 'cancel' }));
  expect(onCancel).toHaveBeenCalled();
});

it('should submit comment using keyboard shortcut', async () => {
  const onSubmit = jest.fn();
  const { user } = setupWithProps({ onSubmit });
  const commentBox = screen.getByRole('textbox');

  expect(commentBox).toBeVisible();

  await user.click(commentBox);
  await user.keyboard('{control>}{enter}{/control}}');
  await user.keyboard('{meta>}{enter}{/meta}');

  expect(onSubmit).toHaveBeenCalledTimes(2);
});

it('should not submit comment using keyboard shortcut if there is no text in comment', async () => {
  const onSubmit = jest.fn();
  const { user } = setupWithProps({ onSubmit, comment: '' });
  const commentBox = screen.getByRole('textbox');

  expect(commentBox).toBeVisible();

  await user.click(commentBox);
  await user.keyboard('{control>}{enter}{/control}');
  await user.keyboard('{meta>}{enter}{/meta}');

  expect(onSubmit).toHaveBeenCalledTimes(0);
});

it('should dismiss the comment box with escape keyboard shortcut', async () => {
  const onCancel = jest.fn();
  const { user } = setupWithProps({ onCancel, comment: '' });
  const commentBox = screen.getByRole('textbox');

  expect(commentBox).toBeVisible();

  await user.click(commentBox);
  await user.keyboard('{escape}');
  expect(onCancel).toHaveBeenCalledTimes(1);
});

describe('A11y', () => {
  it('should have no violations', async () => {
    const { baseElement } = setupWithProps();

    await act(async () => {
      await expect(baseElement).toHaveNoA11yViolations();
    });
  });
});

function setupWithProps(props: Partial<CommentModalProps> = {}) {
  return renderWithRouter(
    <CommentModal
      comment="test"
      commentHeader="test"
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
      {...props}
    />,
  );
}
