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
import { renderWithRouter } from '../../helpers/test-utils';
import { withOrganizationFeatureFlagGuard } from '../withOrganizationFeatureFlagGuard';

import { useFlags } from '~adapters/helpers/feature-flags';
import { shouldWaitForOrganizationContext } from '~adapters/helpers/organization';

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: jest.fn(),
}));

jest.mock('~adapters/helpers/organization', () => ({
  shouldWaitForOrganizationContext: jest.fn(),
}));

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>;
const mockshouldWaitForOrganizationContext =
  shouldWaitForOrganizationContext as jest.MockedFunction<typeof shouldWaitForOrganizationContext>;

describe('withOrganizationFeatureFlagGuard', () => {
  function TestComponent({ message }: { message: string }) {
    return <div data-testid="test-component">{message}</div>;
  }

  const TestComponentWithGuard = withOrganizationFeatureFlagGuard(TestComponent, {
    requiredFlags: ['testFlag'],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state when context is not available yet but the feature flag is true', () => {
    mockshouldWaitForOrganizationContext.mockReturnValue(true);
    mockUseFlags.mockReturnValue({ testFlag: true } as unknown as Parameters<
      typeof mockUseFlags.mockReturnValue
    >[0]);

    renderWithRouter(<TestComponentWithGuard message="Hello World" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    expect(screen.queryByText('page_not_found')).not.toBeInTheDocument();
  });

  it('should render wrapped component when context is available and the feature flag is true', () => {
    mockshouldWaitForOrganizationContext.mockReturnValue(false);
    mockUseFlags.mockReturnValue({ testFlag: true } as unknown as Parameters<
      typeof mockUseFlags.mockReturnValue
    >[0]);

    renderWithRouter(<TestComponentWithGuard message="Hello World" />);

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('page_not_found')).not.toBeInTheDocument();
  });

  it('should show NotFound when the feature flag is false but context is true', () => {
    mockshouldWaitForOrganizationContext.mockReturnValue(false);
    mockUseFlags.mockReturnValue({ testFlag: false } as unknown as Parameters<
      typeof mockUseFlags.mockReturnValue
    >[0]);

    renderWithRouter(<TestComponentWithGuard message="Hello World" />);

    expect(screen.getByText('page_not_found')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should handle undefined feature flag values as false', () => {
    mockshouldWaitForOrganizationContext.mockReturnValue(false);
    mockUseFlags.mockReturnValue({ testFlag: undefined } as unknown as Parameters<
      typeof mockUseFlags.mockReturnValue
    >[0]);

    renderWithRouter(<TestComponentWithGuard message="Undefined flag" />);

    expect(screen.getByText('page_not_found')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
