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
import { lazyLoadComponent } from '../lazyLoadComponent';
import { render, renderWithContext } from '../test-utils';

jest.mock('~shared/helpers/request', () => ({
  requestTryAndRepeatUntil: jest.fn((factory) => factory()),
}));

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

it('should display an error message when an error occurs', async () => {
  const ErrorComponent = () => {
    throw new Error('Test Error');
  };
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  const LazyComponent = lazyLoadComponent<typeof ErrorComponent>(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ default: ErrorComponent });
        }, 50);
      }),
  );

  renderWithContext(<LazyComponent />);

  expect(await screen.findByText('default_component_error_message')).toBeInTheDocument();
  expect(consoleErrorSpy).toHaveBeenCalled();
});
