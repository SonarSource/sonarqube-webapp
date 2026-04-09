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
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import FormattingTipsWithLink from '../FormattingTipsWithLink';

const originalOpen = window.open;
const originalBaseUrl = (window as any).baseUrl;

beforeAll(() => {
  Object.defineProperty(window, 'open', {
    writable: true,
    value: jest.fn(),
  });
});

afterEach(() => {
  (window as any).baseUrl = originalBaseUrl;
  (window.open as jest.Mock).mockClear();
});

afterAll(() => {
  Object.defineProperty(window, 'open', {
    writable: true,
    value: originalOpen,
  });
});

it('should render correctly and open the formatting help using the base URL', async () => {
  const user = userEvent.setup();
  (window as any).baseUrl = '/sonarqube';

  renderFormattingTipsWithLink();

  expect(screen.getByText('formatting.helplink')).toBeInTheDocument();
  expect(screen.getByText('formatting.example.link')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/sonarqube/formatting/help');

  await user.click(screen.getByRole('link'));

  expect(window.open).toHaveBeenCalledWith(
    '/sonarqube/formatting/help',
    'Formatting',
    'height=300,width=600,scrollbars=1,resizable=1',
  );
});

function renderFormattingTipsWithLink(props: Partial<FormattingTipsWithLink['props']> = {}) {
  renderComponent(<FormattingTipsWithLink {...props} />);
}
