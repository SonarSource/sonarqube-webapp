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
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { FCProps } from '../../../types/misc';
import FormattingTips from '../FormattingTips';

const originalOpen = window.open;

beforeAll(() => {
  Object.defineProperty(window, 'open', {
    writable: true,
    value: jest.fn(),
  });
});

afterAll(() => {
  Object.defineProperty(window, 'open', {
    writable: true,
    value: originalOpen,
  });
});

it('should render correctly', async () => {
  const user = userEvent.setup();
  renderFormattingTips();
  const link = screen.getByRole('link', { name: 'formatting.helplink' });
  expect(link).toBeInTheDocument();
  await user.click(link);
  expect(window.open).toHaveBeenCalled();
});

function renderFormattingTips(props: Partial<FCProps<typeof FormattingTips>> = {}) {
  return renderComponent(<FormattingTips {...props} />);
}
