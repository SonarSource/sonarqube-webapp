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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../helpers/test-utils';
import FiltersHeader, { FiltersHeaderProps } from '../FiltersHeader';

describe('FiltersHeader', () => {
  it('should render default labels and button', () => {
    renderFiltersHeader({ displayReset: true });
    expect(screen.getByText('filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'clear_all_filters' })).toBeInTheDocument();
  });

  it('should render provided labels', () => {
    renderFiltersHeader({ displayReset: true, title: 'title', clearAllButtonLabel: 'label' });
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'label' })).toBeInTheDocument();
  });

  it('should trigger reset', async () => {
    const onReset = jest.fn();
    const user = userEvent.setup();

    renderFiltersHeader({ displayReset: true, onReset });
    await user.click(screen.getByRole('button'));

    expect(onReset).toHaveBeenCalled();
  });

  function renderFiltersHeader(props: Partial<FiltersHeaderProps> = {}) {
    return renderWithContext(<FiltersHeader displayReset={false} onReset={() => {}} {...props} />); // eslint-disable-line @typescript-eslint/no-empty-function
  }
});
