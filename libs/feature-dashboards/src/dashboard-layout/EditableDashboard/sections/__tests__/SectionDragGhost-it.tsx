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
import { ExplicitSectionInstance } from '../../../logic/types';
import { SectionDragGhost } from '../SectionDragGhost';

// Mock DragHandle component
jest.mock('../../DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle">Drag Handle</div>,
}));

type TestWidgetPropMap = Record<string, never>;

const mockSection: ExplicitSectionInstance<TestWidgetPropMap> = {
  type: 'explicit',
  key: 'test-section-1',
  name: 'Test Section Name',
  description: 'This is a test section description',
  children: [],
};

describe('SectionDragGhost', () => {
  it('should render section content and drag handle at specified position', () => {
    const mousePosition = { x: 100, y: 200 };

    render(<SectionDragGhost mousePosition={mousePosition} section={mockSection} />);

    // Verify section content is rendered
    expect(screen.getByText('Test Section Name')).toBeInTheDocument();
    expect(screen.getByText('This is a test section description')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });

  it('should handle different section content and mouse positions', () => {
    const differentSection: ExplicitSectionInstance<TestWidgetPropMap> = {
      type: 'explicit',
      key: 'test-section-2',
      name: 'Another Section',
      description: 'Different description content',
      children: [],
    };

    const differentPosition = { x: 50, y: 300 };

    render(<SectionDragGhost mousePosition={differentPosition} section={differentSection} />);

    expect(screen.getByText('Another Section')).toBeInTheDocument();
    expect(screen.getByText('Different description content')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });
});
