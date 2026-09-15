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

import type { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole } from '../../../helpers/testSelector';
import { StatusTransition } from '../StatusTransition';

type StatusTransitionProps = ComponentProps<typeof StatusTransition>;

const onTransite = jest.fn();
const defaultTransitions = [
  { value: 'transition-1' },
  { value: 'transition-2', requiresComment: true },
  { value: 'transition-3', isDeprecated: true },
];

it('should behave correctly', async () => {
  const { user } = renderStatusTransition();

  // render
  expect(
    byRole('menuitem', {
      name: 'status_transition.transition-1 status_transition.transition-1.description',
    }).get(),
  ).toBeInTheDocument();

  expect(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  ).toBeInTheDocument();
  expect(
    byRole('menuitem', {
      name: 'status_transition.transition-3 status_transition.transition-3.description deprecated',
    }).get(),
  ).toBeInTheDocument();

  // actions
  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-1 status_transition.transition-1.description',
    }).get(),
  );

  expect(onTransite).toHaveBeenCalledWith('transition-1');

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );

  expect(byRole('heading', { name: 'status_transition.comment.title' }).get()).toBeInTheDocument();

  await user.type(byRole('textbox').get(), 'This is a comment');
  await user.click(byRole('button', { name: 'status_transition.change_status' }).get());

  expect(onTransite).toHaveBeenLastCalledWith('transition-2', 'This is a comment', false);
});

it('should pass isFeedback=true when checkbox is checked', async () => {
  const { user } = renderStatusTransition({
    showFeedbackCheckbox: true,
  });

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );

  await user.click(byRole('checkbox').get());
  await user.click(byRole('button', { name: 'status_transition.change_status' }).get());

  expect(onTransite).toHaveBeenLastCalledWith('transition-2', '', true);
});

it('should not pass isFeedback when the feedback checkbox is hidden', async () => {
  const { user } = renderStatusTransition({ defaultIsFeedback: true });

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );
  await user.click(byRole('button', { name: 'status_transition.change_status' }).get());

  expect(onTransite).toHaveBeenLastCalledWith('transition-2', '', false);
});

it('should reset isFeedback to its configured default after a transition', async () => {
  const { user } = renderStatusTransition({
    defaultIsFeedback: true,
    showFeedbackCheckbox: true,
  });

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );

  expect(byRole('checkbox').get()).toBeChecked();

  await user.click(byRole('checkbox').get());
  await user.click(byRole('button', { name: 'status_transition.change_status' }).get());

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );

  expect(byRole('checkbox').get()).toBeChecked();
});

it('should reset isFeedback to its configured default after cancelling a transition', async () => {
  const { user } = renderStatusTransition({
    defaultIsFeedback: true,
    showFeedbackCheckbox: true,
  });

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );
  await user.type(byRole('textbox').get(), 'A draft comment');
  await user.click(byRole('checkbox').get());
  await user.click(byRole('button', { name: 'cancel' }).get());

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );

  expect(byRole('checkbox').get()).toBeChecked();
  expect(byRole('textbox').get()).toHaveValue('');
});

it('should update isFeedback when its configured default changes', async () => {
  const { rerender, user } = renderStatusTransition({ showFeedbackCheckbox: true });

  rerender(
    renderStatusTransitionComponent({ defaultIsFeedback: true, showFeedbackCheckbox: true }),
  );

  await user.click(
    byRole('menuitem', {
      name: 'status_transition.transition-2 status_transition.transition-2.description',
    }).get(),
  );

  expect(byRole('checkbox').get()).toBeChecked();
});

function renderStatusTransition(props: Partial<StatusTransitionProps> = {}) {
  return renderWithContext(renderStatusTransitionComponent(props));
}

function renderStatusTransitionComponent(props: Partial<StatusTransitionProps> = {}) {
  return (
    <StatusTransition
      buttonTooltipContent="tooltip-text"
      isOpen
      onTransition={onTransite}
      status="transition-status"
      transitions={defaultTransitions}
      {...props}
    />
  );
}
