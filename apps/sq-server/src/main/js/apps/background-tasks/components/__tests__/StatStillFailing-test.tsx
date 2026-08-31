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
import { ComponentProps } from 'react';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import StatStillFailing from '../StatStillFailing';

it('should render nothing when the failing count is missing', () => {
  const { container } = renderStatStillFailing();

  expect(container).toBeEmptyDOMElement();
});

it('should render a link when there are failing tasks', async () => {
  const user = userEvent.setup();

  const onShowFailingHandler: ComponentProps<typeof StatStillFailing>['onShowFailing'] = (
    event,
  ) => {
    event.preventDefault();
  };

  const onShowFailing = jest.fn(onShowFailingHandler);

  renderStatStillFailing({ failingCount: 3, onShowFailing });

  await user.click(screen.getByRole('link', { name: '3' }));

  expect(onShowFailing).toHaveBeenCalledTimes(1);

  await expect(screen.getByRole('button', { name: 'toggletip.help' })).toHaveAPopoverWithContent(
    'background_tasks.failing_count',
  );
});

it('should render plain text when there are no failing tasks', () => {
  renderStatStillFailing({ failingCount: 0 });

  expect(screen.queryByRole('link', { name: '0' })).not.toBeInTheDocument();
  expect(screen.getByText('0')).toBeInTheDocument();
});

function renderStatStillFailing(overrides: Partial<ComponentProps<typeof StatStillFailing>> = {}) {
  return renderComponent(<StatStillFailing onShowFailing={jest.fn()} {...overrides} />);
}
