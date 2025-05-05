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

import { fireEvent, screen } from '@testing-library/react';
import { getValues } from '~sq-server-commons/api/settings';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import SystemAnnouncement from '../SystemAnnouncement';

jest.mock('~sq-server-commons/api/settings', () => ({
  getValues: jest.fn(),
}));

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  lodash.throttle = (fn: any) => () => fn();
  return lodash;
});

it('should display system announcement', async () => {
  jest
    .mocked(getValues)
    .mockResolvedValueOnce([
      {
        key: 'sonar.announcement.displayMessage',
        value: 'false',
        inherited: true,
      },
    ])
    .mockResolvedValueOnce([
      {
        key: 'sonar.announcement.displayMessage',
        value: 'false',
        inherited: true,
      },
    ])
    .mockResolvedValueOnce([
      {
        key: 'sonar.announcement.displayMessage',
        value: 'true',
      },
    ])
    .mockResolvedValueOnce([
      {
        key: 'sonar.announcement.displayMessage',
        value: 'true',
      },
      {
        key: 'sonar.announcement.message',
        value: '',
      },
    ])
    .mockResolvedValueOnce([
      {
        key: 'sonar.announcement.displayMessage',
        value: 'true',
      },
      {
        key: 'sonar.announcement.message',
        value: 'Foo',
      },
    ]);

  renderSystemAnnouncement();

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent(window, new Event('focus'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent(window, new Event('focus'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent(window, new Event('focus'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent(window, new Event('focus'));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('Foo')).toBeInTheDocument();
});

function renderSystemAnnouncement() {
  return renderComponent(
    <AvailableFeaturesContext.Provider value={[Feature.Announcement]}>
      <SystemAnnouncement />
    </AvailableFeaturesContext.Provider>,
  );
}
