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

import { cssVar } from '@sonarsource/echoes-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  getDashboardErrorReportingPayload,
  normalizeUnknownError,
} from '~shared/helpers/dashboard-error-reporting';

interface GridLayoutErrorBoundaryProps {
  children: ReactNode;
  /**
   * Fallback UI to display when an error occurs.
   * If not provided, displays a default error message.
   */
  fallback?: ReactNode;
  /**
   * Callback invoked when an error is caught.
   * Useful for error logging/telemetry.
   */
  onError?: (error: unknown, errorInfo: ErrorInfo) => void;
  /**
   * Whether to reset the error boundary when children change.
   * Useful for recovering from transient errors.
   */
  resetOnPropsChange?: boolean;
}

interface GridLayoutErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

/**
 * Error boundary for the editable multigrid component.
 *
 * Catches errors in:
 * - Collision detection
 * - Compaction algorithms
 * - Drag/drop operations
 * - Resize operations
 *
 * Prevents the entire dashboard from crashing when a single widget operation fails.
 */
export class GridLayoutErrorBoundary extends Component<
  GridLayoutErrorBoundaryProps,
  GridLayoutErrorBoundaryState
> {
  static getDerivedStateFromError(caught: unknown): GridLayoutErrorBoundaryState {
    return { error: normalizeUnknownError(caught), hasError: true };
  }

  constructor(props: GridLayoutErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  componentDidUpdate(prevProps: GridLayoutErrorBoundaryProps) {
    // Reset error boundary when children change (allows recovery from transient errors)
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.setState({ error: null, hasError: false });
    }
  }

  componentDidCatch(caught: unknown, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(caught, errorInfo);
      return;
    }

    const { serialized } = getDashboardErrorReportingPayload(caught, errorInfo, {
      source: 'GridLayoutErrorBoundary',
    });

    // eslint-disable-next-line no-console
    console.error('GridLayout Error:', serialized);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            alignItems: 'center',
            backgroundColor: cssVar('color-background-neutral-subtle-default'),
            border: `1px solid ${cssVar('color-border-weak')}`,
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'center',
            minHeight: '200px',
            padding: '24px',
          }}
        >
          <div
            style={{
              color: cssVar('color-text-danger'),
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            <FormattedMessage id="editable_multigrid.error.title" />
          </div>
          <div
            style={{
              color: cssVar('color-text-subtle'),
              fontSize: '14px',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <FormattedMessage id="editable_multigrid.error.description" />
          </div>
          {this.state.error && (
            <details style={{ fontSize: '12px', maxWidth: '500px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                <FormattedMessage id="editable_multigrid.error.details" />
              </summary>
              <pre
                style={{
                  backgroundColor: cssVar('color-surface-default'),
                  borderRadius: '4px',
                  color: cssVar('color-text-default'),
                  overflow: 'auto',
                  padding: '8px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
