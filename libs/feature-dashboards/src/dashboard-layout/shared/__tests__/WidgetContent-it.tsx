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

import { act, screen } from '@testing-library/react';
import { reportError } from '~adapters/helpers/report-error';
import { renderWithContext } from '~shared/helpers/test-utils';
import { WidgetMode } from '../../../types/widget-common';
import {
  WidgetBodyMap,
  WidgetEditBehaviorMap,
  WidgetHeaderMap,
  WidgetInstance,
} from '../../logic/types';
import { WidgetContent } from '../WidgetContent';
import { WidgetMapsProvider } from '../WidgetMapsContext';

jest.mock('~adapters/helpers/report-error', () => ({
  reportError: jest.fn(),
}));

// Test widget prop types
type TestWidgetProps = {
  testWidget: {
    testProp?: string;
  };
};

// Mock body component with a link
function MockBodyWithLink() {
  return (
    <div>
      <a href="/test">Test Link</a>
      <button type="button">Test Button</button>
    </div>
  );
}

// Test data
const mockWidget: WidgetInstance<TestWidgetProps> = {
  key: 'test-widget',
  type: 'testWidget',
  position: { x: 1, y: 2 },
  dimensions: { width: 3, height: 2 },
  props: { testProp: 'value' },
};

const mockBodyMap: WidgetBodyMap<TestWidgetProps> = {
  testWidget: () => <MockBodyWithLink />,
};

const mockHeaderMap: WidgetHeaderMap<TestWidgetProps> = {
  testWidget: () => <div>Mock Header</div>,
};

const mockEditBehaviorMap: WidgetEditBehaviorMap<TestWidgetProps> = {
  testWidget: {
    defaultProps: {},
    defaultSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 4 },
    minSize: { width: 1, height: 1 },
  },
};

function ThrowingWidgetBody(): null {
  throw new Error('widget render failed');
}

const renderWidgetContent = (bodyMap: WidgetBodyMap<TestWidgetProps> = mockBodyMap) => {
  return renderWithContext(
    <WidgetMapsProvider
      bodyMap={bodyMap}
      editBehaviorMap={mockEditBehaviorMap}
      headerMap={mockHeaderMap}
    >
      <WidgetContent mode={WidgetMode.Edit} widget={mockWidget} />
    </WidgetMapsProvider>,
  );
};

describe('WidgetContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should render widget body content', () => {
    renderWidgetContent();

    expect(screen.getByRole('link', { name: 'Test Link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('should render the content wrapper', () => {
    renderWidgetContent();

    const wrapper = screen.getByTestId('widget-content');
    expect(wrapper).toBeInTheDocument();
  });

  it('reports widget errors to Sentry with widget context', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const throwingBodyMap: WidgetBodyMap<TestWidgetProps> = {
      testWidget: () => <ThrowingWidgetBody />,
    };

    renderWidgetContent(throwingBodyMap);

    expect(screen.getByText('dashboard.widget.error')).toBeInTheDocument();
    expect(jest.mocked(reportError)).toHaveBeenCalledWith(
      'Dashboard widget rendering error: widget render failed',
      expect.objectContaining({
        widgetKey: 'test-widget',
        widgetType: 'testWidget',
      }),
    );
  });

  describe('visibility-gated body rendering', () => {
    const originalIntersectionObserver = window.IntersectionObserver;
    let observerCallback: IntersectionObserverCallback | null;
    let disconnect: jest.Mock;

    beforeEach(() => {
      observerCallback = null;
      disconnect = jest.fn();
      (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest
        .fn()
        .mockImplementation((cb: IntersectionObserverCallback) => {
          observerCallback = cb;
          return { observe: jest.fn(), disconnect, unobserve: jest.fn() };
        });
    });

    afterEach(() => {
      (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
        originalIntersectionObserver;
    });

    it('renders a loading spinner while the widget body is not yet visible', () => {
      renderWidgetContent();

      expect(screen.getByText('dashboard.widget.loading_visualization')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Test Link' })).not.toBeInTheDocument();
    });

    it('renders the widget body once the widget becomes visible', () => {
      renderWidgetContent();

      act(() => {
        observerCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });

      expect(screen.getByRole('link', { name: 'Test Link' })).toBeInTheDocument();
      expect(screen.queryByText('dashboard.widget.loading_visualization')).not.toBeInTheDocument();
    });

    it('disconnects the observer after first intersection (freezeOnceVisible)', () => {
      renderWidgetContent();

      act(() => {
        observerCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });

      expect(disconnect).toHaveBeenCalled();
      expect(screen.getByRole('link', { name: 'Test Link' })).toBeInTheDocument();
    });
  });
});
