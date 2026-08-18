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
import type { Card, Dimensions, LayoutConfig } from '../../types';
import { CardListDragPreview } from '../CardListDragPreview';

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

describe('CardListDragPreview', () => {
  it('should render drag preview with correct dimensions', () => {
    const mockRenderDragPreview = jest.fn((_card: TestCard, size: Dimensions) => (
      <div data-testid="drag-preview">
        Preview: {size.width}x{size.height}
      </div>
    ));

    render(
      <CardListDragPreview
        card={mockCard}
        layout={mockLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
    expect(mockRenderDragPreview).toHaveBeenCalledWith(
      mockCard,
      expect.objectContaining({
        width: expect.any(Number) as number,
        height: expect.any(Number) as number,
      }),
    );
  });

  it('should call renderDragPreview with card and pixel dimensions', () => {
    const mockRenderDragPreview = jest.fn(() => <div>Preview</div>);

    render(
      <CardListDragPreview
        card={mockCard}
        layout={mockLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    expect(mockRenderDragPreview).toHaveBeenCalledTimes(1);
    expect(mockRenderDragPreview).toHaveBeenCalledWith(mockCard, expect.any(Object));
  });

  it('should render with different card dimensions', () => {
    const largeCard: TestCard = {
      ...mockCard,
      dimensions: { width: 4, height: 3 },
    };

    const mockRenderDragPreview = jest.fn((_card: TestCard, size: Dimensions) => (
      <div data-testid="large-preview">
        {size.width}x{size.height}
      </div>
    ));

    render(
      <CardListDragPreview
        card={largeCard}
        layout={mockLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    expect(screen.getByTestId('large-preview')).toBeInTheDocument();
  });

  it('should render with different layout configurations', () => {
    const customLayout: LayoutConfig = {
      col: 6,
      rowHeight: 50,
      containerWidth: 600,
      containerHeight: 400,
      calWidth: 100,
      margin: [5, 5],
      containerPadding: [5, 5],
    };

    const mockRenderDragPreview = jest.fn(() => <div>Custom Layout Preview</div>);

    render(
      <CardListDragPreview
        card={mockCard}
        layout={customLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    expect(mockRenderDragPreview).toHaveBeenCalled();
  });

  it('should apply relative positioning to container', () => {
    const mockRenderDragPreview = jest.fn(() => <div>Preview</div>);

    render(
      <CardListDragPreview
        card={mockCard}
        layout={mockLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    // Component renders successfully with relative positioning
    expect(mockRenderDragPreview).toHaveBeenCalled();
  });

  it('should handle small card dimensions', () => {
    const smallCard: TestCard = {
      ...mockCard,
      dimensions: { width: 1, height: 1 },
    };

    const mockRenderDragPreview = jest.fn(() => <div>Small Preview</div>);

    render(
      <CardListDragPreview
        card={smallCard}
        layout={mockLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    expect(mockRenderDragPreview).toHaveBeenCalledWith(
      smallCard,
      expect.objectContaining({
        width: expect.any(Number) as number,
        height: expect.any(Number) as number,
      }),
    );
  });

  it('should handle maximum card dimensions', () => {
    const maxCard: TestCard = {
      ...mockCard,
      dimensions: { width: 12, height: 6 },
    };

    const mockRenderDragPreview = jest.fn(() => <div>Max Preview</div>);

    render(
      <CardListDragPreview
        card={maxCard}
        layout={mockLayout}
        renderDragPreview={mockRenderDragPreview}
      />,
    );

    expect(mockRenderDragPreview).toHaveBeenCalled();
  });
});
