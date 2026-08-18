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
import { renderWithRouter } from '~shared/helpers/test-utils';
import { EmptyDashboard } from '../EmptyDashboard';

describe('EmptyDashboard', () => {
  it('renders the documentation link', () => {
    renderEmptyDashboard('https://docs.example.com/dashboards');

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://docs.example.com/dashboards');
  });
});

function renderEmptyDashboard(documentationUrl: string) {
  renderWithRouter(
    <EmptyDashboard
      canEdit
      editDescriptionDocUrl={documentationUrl}
      isEditing={false}
      nonEditDescriptionDocUrl={documentationUrl}
      setIsEditing={jest.fn()}
    />,
  );
}
