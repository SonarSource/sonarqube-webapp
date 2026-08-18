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
import { SectionTargetPreview } from '../SectionTargetPreview';

type TestWidgetPropMap = Record<string, never>;

const mockSection: ExplicitSectionInstance<TestWidgetPropMap> = {
  type: 'explicit',
  key: 'test-section-1',
  name: 'Test Section',
  description: 'This is a test section description',
  children: [],
};

describe('SectionTargetPreview', () => {
  it('should render section name and description with expected heading spacing', () => {
    render(<SectionTargetPreview section={mockSection} />);

    // Verify content is rendered
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Section');
    expect(screen.getByText('This is a test section description')).toBeInTheDocument();

    // With a description, title–description spacing uses the column gap, not heading padding.
    expect(screen.getByRole('heading', { level: 3 })).not.toHaveClass('sw-pb-2');
  });

  it('should handle different section content correctly', () => {
    const differentSection: ExplicitSectionInstance<TestWidgetPropMap> = {
      type: 'explicit',
      key: 'test-section-2',
      name: 'Analytics Dashboard',
      description: 'Comprehensive analytics and metrics overview',
      children: [],
    };

    render(<SectionTargetPreview section={differentSection} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Analytics Dashboard');
    expect(screen.getByText('Comprehensive analytics and metrics overview')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).not.toHaveClass('sw-pb-2');
  });

  it('should handle empty or minimal section content', () => {
    const minimalSection: ExplicitSectionInstance<TestWidgetPropMap> = {
      type: 'explicit',
      key: 'test-section-3',
      name: '',
      description: '',
      children: [],
    };

    render(<SectionTargetPreview section={minimalSection} />);

    // Empty description: no heading bottom padding (SC-47131; header row vertically centered).
    expect(screen.getByRole('heading', { level: 3 })).not.toHaveClass('sw-pb-2');
  });
});
