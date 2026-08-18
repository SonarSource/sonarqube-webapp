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
import { DashboardLayoutValidationError } from '../../helpers/dashboard-layout-validation-reporting';
import {
  DashboardCustomDashboardGenericError,
  DashboardCustomDashboardInvalidLayout,
  DashboardCustomDashboardLoading,
  DashboardCustomDashboardNotFound,
  DashboardCustomDashboardState,
  getDashboardCustomDashboardState,
} from '../DashboardCustomDashboardViews';

const dashboard = {};

describe('getDashboardCustomDashboardState', () => {
  it('prioritizes loading over all other states', () => {
    expect(
      getDashboardCustomDashboardState({ dashboard, error: new Error('failed'), isLoading: true }),
    ).toBe(DashboardCustomDashboardState.Loading);
  });

  it('maps 404 responses to not found', () => {
    const error = Object.assign(new Error('not found'), {
      isAxiosError: true,
      response: { status: 404 },
    });

    expect(
      getDashboardCustomDashboardState({ dashboard: undefined, error, isLoading: false }),
    ).toBe(DashboardCustomDashboardState.NotFound);
  });

  it('maps invalid layouts to the dedicated error state', () => {
    expect(
      getDashboardCustomDashboardState({
        dashboard: undefined,
        error: new DashboardLayoutValidationError('invalid'),
        isLoading: false,
      }),
    ).toBe(DashboardCustomDashboardState.InvalidLayout);
  });

  it.each([
    [{ dashboard: undefined, error: undefined }, DashboardCustomDashboardState.Error],
    [{ dashboard, error: new Error('failed') }, DashboardCustomDashboardState.Error],
    [{ dashboard, error: undefined }, DashboardCustomDashboardState.Ready],
  ])('maps the remaining state %s', (input, expected) => {
    expect(getDashboardCustomDashboardState({ ...input, isLoading: false })).toBe(expected);
  });
});

describe('dashboard state views', () => {
  it('renders the loading view', () => {
    renderWithRouter(<DashboardCustomDashboardLoading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it.each([
    [DashboardCustomDashboardNotFound, 'not-found-title', 'not-found-description'],
    [DashboardCustomDashboardInvalidLayout, 'invalid-title', 'invalid-description'],
  ])('renders a state view with a link back to the list', (StateView, titleId, descriptionId) => {
    renderWithRouter(
      <StateView
        backToListLabelId="back-to-list"
        descriptionId={descriptionId}
        listUrl="/dashboards"
        titleId={titleId}
      />,
    );

    expect(screen.getByText(titleId)).toBeInTheDocument();
    expect(screen.getByText(descriptionId)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'back-to-list' })).toHaveAttribute(
      'href',
      '/dashboards',
    );
  });

  it('renders a retry button for a generic error', async () => {
    const onRetry = jest.fn();
    const { user } = renderWithRouter(
      <DashboardCustomDashboardGenericError
        descriptionId="error-description"
        onRetry={onRetry}
        titleId="error-title"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
