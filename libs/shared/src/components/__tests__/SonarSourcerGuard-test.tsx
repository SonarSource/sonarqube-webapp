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
import { useCurrentUser } from '~adapters/helpers/users';
import { renderWithRouter } from '../../helpers/test-utils';
import { LoggedInUserShared } from '../../types/users';
import { SonarSourcerGuard } from '../SonarSourcerGuard';

jest.mock('~adapters/helpers/users', () => ({
  useCurrentUser: jest.fn(),
}));

const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>;

describe('SonarSourcerGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner while checking user status', () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { email: undefined } as LoggedInUserShared,
      isLoggedIn: false,
    });

    renderWithRouter(
      <SonarSourcerGuard>
        <div>Protected Content</div>
      </SonarSourcerGuard>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has @sonarsource.com email', () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { email: 'test@sonarsource.com' } as LoggedInUserShared,
      isLoggedIn: true,
    });

    renderWithRouter(
      <SonarSourcerGuard>
        <div>Protected Content</div>
      </SonarSourcerGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('page_not_found')).not.toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });

  it('should show NotFound page when user does not have @sonarsource.com email', () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { email: 'test@external.com' } as LoggedInUserShared,
      isLoggedIn: true,
    });

    renderWithRouter(
      <SonarSourcerGuard>
        <div>Protected Content</div>
      </SonarSourcerGuard>,
    );

    expect(screen.getByText('page_not_found')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });

  it('should show NotFound page when user email is undefined', () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { email: undefined } as LoggedInUserShared,
      isLoggedIn: true,
    });

    renderWithRouter(
      <SonarSourcerGuard>
        <div>Protected Content</div>
      </SonarSourcerGuard>,
    );

    expect(screen.getByText('page_not_found')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });

  it('should accept emails with @sonarsource.com anywhere in the string', () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { email: 'user+test@sonarsource.com.invalid' } as LoggedInUserShared,
      isLoggedIn: true,
    });

    renderWithRouter(
      <SonarSourcerGuard>
        <div>Protected Content</div>
      </SonarSourcerGuard>,
    );

    // This tests the current implementation which uses .includes()
    // The email contains @sonarsource.com so it passes
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
