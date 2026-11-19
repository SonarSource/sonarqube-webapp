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
import { noop } from 'lodash';
import { reportError } from '~adapters/helpers/report-error';
import { lazyLoadComponent } from '../lazyLoadComponent';
import { render, renderWithContext } from '../test-utils';

jest.mock('~shared/helpers/request', () => ({
  requestTryAndRepeatUntil: jest.fn((factory: () => Promise<unknown>) => factory()),
}));

jest.mock('~adapters/helpers/report-error', () => ({ reportError: jest.fn() }));

function TestComponent() {
  return <div>Test Component</div>;
}

it('should load the component successfully', async () => {
  const LazyComponent = lazyLoadComponent<typeof TestComponent>(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ default: TestComponent });
        }, 50);
      }),
  );

  const { container } = render(<LazyComponent />);

  expect(container).toBeEmptyDOMElement();
  expect(await screen.findByText('Test Component')).toBeInTheDocument();
});

it('should display an error message when lazy loading fails', async () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  const LazyComponent = lazyLoadComponent<typeof TestComponent>(
    () =>
      new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Test Error'));
        }, 50);
      }),
  );

  renderWithContext(<LazyComponent />);

  expect(await screen.findByText('default_component_error_message')).toBeInTheDocument();
  expect(consoleErrorSpy).toHaveBeenCalled();
});

it('keeps a supplied fallback visible until the component code is ready', async () => {
  let finishLoading = noop;
  const component = new Promise<{ default: typeof TestComponent }>((resolve) => {
    finishLoading = () => {
      resolve({ default: TestComponent });
    };
  });
  const LazyComponent = lazyLoadComponent(
    () => component,
    'TestComponent',
    <div role="status">Loading content</div>,
  );

  render(<LazyComponent />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading content');
  expect(screen.queryByText('Test Component')).not.toBeInTheDocument();

  finishLoading();
  expect(await screen.findByText('Test Component')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('should report a render crash with its component stack', async () => {
  jest.spyOn(console, 'error').mockImplementation();

  function CrashingComponent(): React.ReactNode {
    throw new Error('Render crash');
  }

  const LazyComponent = lazyLoadComponent<typeof CrashingComponent>(() =>
    Promise.resolve({ default: CrashingComponent }),
  );

  renderWithContext(<LazyComponent />);

  expect(await screen.findByText('default_component_error_message')).toBeInTheDocument();
  // Earlier tests report through the same mock: read this test's (last) call.
  const { calls } = jest.mocked(reportError).mock;
  const [reported, context] = calls[calls.length - 1];
  expect(reported).toEqual(new Error('Render crash'));
  expect(context).toMatchObject({ tags: { errorBoundary: 'LazyErrorBoundary' } });
  expect(JSON.stringify(context)).toContain('CrashingComponent');
});
