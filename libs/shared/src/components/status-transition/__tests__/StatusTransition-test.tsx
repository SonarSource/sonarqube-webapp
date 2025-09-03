/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

  expect(onTransite).toHaveBeenLastCalledWith('transition-2', 'This is a comment');
});

function renderStatusTransition(props: Partial<StatusTransitionProps> = {}) {
  return renderWithContext(
    <StatusTransition
      buttonTooltipContent="tooltip-text"
      isOpen
      onTransite={onTransite}
      status="transition-status"
      transitions={defaultTransitions}
      {...props}
    />,
  );
}
