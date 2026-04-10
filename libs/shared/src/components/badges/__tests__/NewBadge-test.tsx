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
import { renderWithContext } from '../../../helpers/test-utils';
import { NewBadge } from '../NewBadge';

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-04-10T12:00:00.000Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

it('should render before expiration date', () => {
  renderWithContext(<NewBadge expirationDate="2026-05-02T23:59:59.999Z" />);

  expect(screen.getByText('new')).toBeVisible();
});

it('should not render after expiration date', () => {
  renderWithContext(<NewBadge expirationDate="2026-04-09T23:59:59.999Z" />);

  expect(screen.queryByText('new')).not.toBeInTheDocument();
});
