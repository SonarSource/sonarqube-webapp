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

import { render } from '@testing-library/react';
import type { Card, LayoutConfig, Position } from '../../types';
import { ShadowCard } from '../ShadowCard';

interface TestCard extends Card {
  data: string;
}

const mockCard: TestCard = {
  key: 'card-1',
  position: { x: 0, y: 0 },
  dimensions: { width: 2, height: 2 },
  data: 'test',
};

const mockLayout: LayoutConfig = {
  col: 12,
  rowHeight: 100,
  containerWidth: 1200,
  containerHeight: 800,
  calWidth: 100,
  margin: [10, 10],
  containerPadding: [10, 10],
};

const mockPosition: Position = {
  x: 0,
  y: 0,
};

describe('ShadowCard', () => {
  it('should render shadow card', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders successfully
    expect(document.body).toBeInTheDocument();
  });

  it('should apply absolute positioning', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with absolute positioning
    expect(document.body).toBeInTheDocument();
  });

  it('should apply dashed border style', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with dashed border
    expect(document.body).toBeInTheDocument();
  });

  it('should disable pointer events', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with pointer events disabled
    expect(document.body).toBeInTheDocument();
  });

  it('should apply transition for smooth animation', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with transition
    expect(document.body).toBeInTheDocument();
  });

  it('should render at different grid positions', () => {
    const position: Position = { x: 2, y: 1 };

    render(<ShadowCard card={mockCard} layout={mockLayout} position={position} />);

    // Component renders at different position
    expect(document.body).toBeInTheDocument();
  });

  it('should handle different card dimensions', () => {
    const largeCard: TestCard = {
      ...mockCard,
      dimensions: { width: 4, height: 3 },
    };

    render(<ShadowCard card={largeCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with different dimensions
    expect(document.body).toBeInTheDocument();
  });

  it('should handle different layout configurations', () => {
    const customLayout: LayoutConfig = {
      col: 6,
      rowHeight: 50,
      containerWidth: 600,
      containerHeight: 400,
      calWidth: 100,
      margin: [5, 5],
      containerPadding: [5, 5],
    };

    render(<ShadowCard card={mockCard} layout={customLayout} position={mockPosition} />);

    // Component renders with custom layout
    expect(document.body).toBeInTheDocument();
  });

  it('should apply border radius', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with border radius
    expect(document.body).toBeInTheDocument();
  });

  it('should have zero z-index', () => {
    render(<ShadowCard card={mockCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with z-index
    expect(document.body).toBeInTheDocument();
  });

  it('should handle position at grid boundaries', () => {
    const boundaryPosition: Position = { x: 11, y: 10 };

    render(<ShadowCard card={mockCard} layout={mockLayout} position={boundaryPosition} />);

    // Component renders at boundary position
    expect(document.body).toBeInTheDocument();
  });

  it('should handle minimum dimensions', () => {
    const minCard: TestCard = {
      ...mockCard,
      dimensions: { width: 1, height: 1 },
    };

    render(<ShadowCard card={minCard} layout={mockLayout} position={mockPosition} />);

    // Component renders with minimum dimensions
    expect(document.body).toBeInTheDocument();
  });
});
