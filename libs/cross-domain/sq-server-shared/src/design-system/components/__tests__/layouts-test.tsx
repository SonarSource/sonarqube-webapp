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

import { render, screen } from '@testing-library/react';
import { CenteredLayout, LargeCenteredLayout } from '../layouts';

describe('CenteredLayout', () => {
  it('should render as expected', () => {
    render(<CenteredLayout>content</CenteredLayout>);

    expect(screen.getByText('content')).toHaveStyle({
      'min-width': '1280px',
      'max-width': '1280px',
    });
  });
});

describe('LargeCenteredLayout', () => {
  it('should render as expected', () => {
    render(<LargeCenteredLayout>content</LargeCenteredLayout>);

    expect(screen.getByText('content')).toHaveStyle({
      'min-width': '1280px',
      'max-width': '1680px',
    });
  });
});
