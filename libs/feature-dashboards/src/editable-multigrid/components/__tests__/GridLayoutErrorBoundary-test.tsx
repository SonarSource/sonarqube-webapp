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

import { render, screen } from '@testing-library/react';
import { GridLayoutErrorBoundary } from '../GridLayoutErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('GridLayoutErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error for these tests since we're intentionally throwing errors
    // This includes both React's error boundary warnings and our custom logging
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty - we're suppressing console errors in tests
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render children when there is no error', () => {
    render(
      <GridLayoutErrorBoundary>
        <div>Test content</div>
      </GridLayoutErrorBoundary>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render default fallback UI when an error occurs', () => {
    render(
      <GridLayoutErrorBoundary>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    expect(screen.getByText('editable_multigrid.error.title')).toBeInTheDocument();
    expect(screen.getByText('editable_multigrid.error.description')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <GridLayoutErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('editable_multigrid.error.title')).not.toBeInTheDocument();
  });

  it('should call onError callback when an error occurs', () => {
    const onError = jest.fn();

    render(
      <GridLayoutErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      }),
      expect.objectContaining({
        componentStack: expect.any(String) as string,
      }),
    );
  });

  it('should display error details in default fallback', () => {
    render(
      <GridLayoutErrorBoundary>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    expect(screen.getByText('editable_multigrid.error.details')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('should reset error when children change and resetOnPropsChange is true', () => {
    const { rerender } = render(
      <GridLayoutErrorBoundary resetOnPropsChange>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    // Error boundary should be showing error
    expect(screen.getByText('editable_multigrid.error.title')).toBeInTheDocument();

    // Update children - error should be reset
    rerender(
      <GridLayoutErrorBoundary resetOnPropsChange>
        <ThrowError shouldThrow={false} />
      </GridLayoutErrorBoundary>,
    );

    expect(screen.queryByText('editable_multigrid.error.title')).not.toBeInTheDocument();
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should not reset error when children change and resetOnPropsChange is false', () => {
    const { rerender } = render(
      <GridLayoutErrorBoundary resetOnPropsChange={false}>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    // Error boundary should be showing error
    expect(screen.getByText('editable_multigrid.error.title')).toBeInTheDocument();

    // Update children - error should NOT be reset
    rerender(
      <GridLayoutErrorBoundary resetOnPropsChange={false}>
        <ThrowError shouldThrow={false} />
      </GridLayoutErrorBoundary>,
    );

    // Should still show error
    expect(screen.getByText('editable_multigrid.error.title')).toBeInTheDocument();
    expect(screen.queryByText('No error')).not.toBeInTheDocument();
  });

  it('should not reset error when resetOnPropsChange is undefined', () => {
    const { rerender } = render(
      <GridLayoutErrorBoundary>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    // Error boundary should be showing error
    expect(screen.getByText('editable_multigrid.error.title')).toBeInTheDocument();

    // Update children - error should NOT be reset (default behavior)
    rerender(
      <GridLayoutErrorBoundary>
        <ThrowError shouldThrow={false} />
      </GridLayoutErrorBoundary>,
    );

    // Should still show error
    expect(screen.getByText('editable_multigrid.error.title')).toBeInTheDocument();
  });

  it('should delegate to onError without logging when onError is provided', () => {
    const onError = jest.fn();
    const localConsoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <GridLayoutErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    expect(onError).toHaveBeenCalled();
    expect(localConsoleError).not.toHaveBeenCalledWith('GridLayout Error:', expect.any(String));

    localConsoleError.mockRestore();
  });

  it('should log serialized errors to the console when onError is not provided', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <GridLayoutErrorBoundary>
        <ThrowError shouldThrow />
      </GridLayoutErrorBoundary>,
    );

    expect(consoleError).toHaveBeenCalledWith(
      'GridLayout Error:',
      expect.stringContaining('Test error'),
    );

    consoleError.mockRestore();
  });

  it('should handle errors with stack traces', () => {
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at Component\n    at ErrorBoundary';

    function ThrowErrorWithStack(): React.ReactElement<any> {
      throw errorWithStack;
    }

    render(
      <GridLayoutErrorBoundary>
        <ThrowErrorWithStack />
      </GridLayoutErrorBoundary>,
    );

    expect(screen.getByText(/Error with stack/)).toBeInTheDocument();
    expect(screen.getByText(/at Component/)).toBeInTheDocument();
  });
});
