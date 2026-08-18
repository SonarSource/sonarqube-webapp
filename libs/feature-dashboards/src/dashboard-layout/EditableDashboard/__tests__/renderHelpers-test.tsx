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

import { TooltipProvider } from '@sonarsource/echoes-react';
import { render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { IntlProvider } from 'react-intl';
import type { CardHeaderElementProps } from '../../../editable-multigrid/types';
import { WidgetMode } from '../../../types/widget-common';
import type {
  WidgetBodyMap,
  WidgetEditBehaviorMap,
  WidgetHeaderMap,
  WidgetInstance,
} from '../../logic/types';
import { WidgetMapsProvider } from '../../shared/WidgetMapsContext';
import { renderCardContent, renderCardHeaderContent } from '../renderHelpers';

type TestWidgetProps = {
  mode?: WidgetMode;
  title: string;
};

type TestWidgetPropMap = {
  testWidget: TestWidgetProps;
};

function createMockWidget(): WidgetInstance<TestWidgetPropMap> {
  return {
    dimensions: { height: 2, width: 4 },
    key: 'test-widget-key',
    position: { x: 0, y: 0 },
    props: { title: 'Test Widget' },
    type: 'testWidget',
  };
}

function createMockHeaderProps(
  overrides: Partial<CardHeaderElementProps<WidgetInstance<TestWidgetPropMap>>> = {},
): CardHeaderElementProps<WidgetInstance<TestWidgetPropMap>> {
  const dragHandleRef = jest.fn();
  return {
    card: createMockWidget(),
    dragHandleRef,
    isDragging: false,
    isKeyboardDragging: false,
    onDelete: jest.fn(),
    onEdit: undefined,
    onKeyDown: jest.fn(),
    ...overrides,
  };
}

function createMockWidgetMaps() {
  const headerMap: WidgetHeaderMap<TestWidgetPropMap> = {
    testWidget: ({ title }) => <div>{title}</div>,
  };

  const bodyMap: WidgetBodyMap<TestWidgetPropMap> = {
    testWidget: () => <div>Widget Body</div>,
  };

  const editBehaviorMap: WidgetEditBehaviorMap<TestWidgetPropMap> = {
    testWidget: {
      defaultProps: { title: 'Default Title' },
      defaultSize: { height: 2, width: 4 },
      maxSize: { height: 4, width: 8 },
      minSize: { height: 1, width: 2 },
    },
  };

  return { bodyMap, editBehaviorMap, headerMap };
}

function renderWithProviders(component: ReactElement) {
  const { bodyMap, editBehaviorMap, headerMap } = createMockWidgetMaps();

  return render(
    <TooltipProvider>
      <IntlProvider locale="en">
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={editBehaviorMap}
          headerMap={headerMap}
        >
          {component}
        </WidgetMapsProvider>
      </IntlProvider>
    </TooltipProvider>,
  );
}

describe('renderCardContent', () => {
  it('identifies the widget element used as the autoscroll target', () => {
    const widget = createMockWidget();
    const { container } = renderWithProviders(renderCardContent(widget, false));

    expect(container.firstChild).toHaveAttribute('data-widget-key', widget.key);
  });
});

describe('renderCardHeaderContent', () => {
  it('should apply WebkitUserDrag style for Safari drag compatibility', () => {
    const headerProps = createMockHeaderProps();
    renderWithProviders(renderCardHeaderContent(headerProps));

    const dragButton = screen.getByRole('button', { name: /drag widget/i });
    expect(dragButton).toBeInTheDocument();
    expect(dragButton).toHaveStyle({ WebkitUserDrag: 'element' });
  });

  it('should have grab cursor when not dragging', () => {
    const headerProps = createMockHeaderProps({ isKeyboardDragging: false });
    renderWithProviders(renderCardHeaderContent(headerProps));

    const dragButton = screen.getByRole('button', { name: /drag widget/i });
    expect(dragButton).toHaveStyle({ cursor: 'grab' });
  });

  it('should have grabbing cursor when keyboard dragging', () => {
    const headerProps = createMockHeaderProps({ isKeyboardDragging: true });
    renderWithProviders(renderCardHeaderContent(headerProps));

    const dragButton = screen.getByRole('button', { name: /drag widget/i });
    expect(dragButton).toHaveStyle({ cursor: 'grabbing' });
  });

  it('should attach dragHandleRef to button', () => {
    const dragHandleRef = jest.fn() as React.RefCallback<HTMLElement>;
    const headerProps = createMockHeaderProps({ dragHandleRef });
    renderWithProviders(renderCardHeaderContent(headerProps));

    expect(dragHandleRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    const mockedRef = jest.mocked(dragHandleRef);
    const buttonElement = mockedRef.mock.calls[0]?.[0];
    expect(buttonElement).toBeDefined();
    expect(buttonElement).toBeInstanceOf(HTMLButtonElement);
    expect(buttonElement).toHaveAttribute('aria-label');
  });

  it('should set aria-pressed to true when keyboard dragging', () => {
    const headerProps = createMockHeaderProps({ isKeyboardDragging: true });
    renderWithProviders(renderCardHeaderContent(headerProps));

    const dragButton = screen.getByRole('button', { name: /drag widget/i });
    expect(dragButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should set aria-pressed to false when not keyboard dragging', () => {
    const headerProps = createMockHeaderProps({ isKeyboardDragging: false });
    renderWithProviders(renderCardHeaderContent(headerProps));

    const dragButton = screen.getByRole('button', { name: /drag widget/i });
    expect(dragButton).toHaveAttribute('aria-pressed', 'false');
  });
});
