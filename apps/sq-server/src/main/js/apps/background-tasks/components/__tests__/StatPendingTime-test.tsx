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
import { ComponentProps } from 'react';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import StatPendingTime from '../StatPendingTime';

it('should render nothing when there are no pending tasks', () => {
  const { container } = renderStatPendingTime({ pendingCount: 0, pendingTime: 15000 });

  expect(container).toBeEmptyDOMElement();
});

it('should render nothing when the pending time is missing', () => {
  const { container } = renderStatPendingTime({ pendingCount: 3 });

  expect(container).toBeEmptyDOMElement();
});

it('should render nothing when the pending time is below the threshold', () => {
  const { container } = renderStatPendingTime({ pendingCount: 3, pendingTime: 999 });

  expect(container).toBeEmptyDOMElement();
});

it('should render the age of the oldest pending task', () => {
  renderStatPendingTime({ pendingCount: 3, pendingTime: 15000 });

  expect(screen.getByText('background_tasks.pending_time')).toHaveTextContent(
    'background_tasks.pending_time 15s',
  );
});

it('should explain the pending time in a tooltip', async () => {
  renderStatPendingTime({ pendingCount: 3, pendingTime: 15000 });

  await expect(screen.getByRole('button', { name: 'toggletip.help' })).toHaveAPopoverWithContent(
    'background_tasks.pending_time.description',
  );
});

function renderStatPendingTime(overrides: Partial<ComponentProps<typeof StatPendingTime>> = {}) {
  return renderComponent(<StatPendingTime {...overrides} />);
}
