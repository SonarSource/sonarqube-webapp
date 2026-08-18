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

import { matchers as emotionMatchers } from '@emotion/jest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '~shared/helpers/test-utils';
import { byTestId } from '~shared/helpers/testSelector';
import { WidgetMode } from '../../../types/widget-common';
import {
  DashboardInstance,
  ExplicitSectionInstance,
  ImplicitSectionInstance,
  WidgetBodyMap,
  WidgetEditBehaviorMap,
  WidgetHeaderMap,
  WidgetInstance,
} from '../../logic/types';
import { implicitSectionDragMinimizeClipHeightPx } from '../../ReadonlyDashboard/constants';
import {
  getImplicitSectionContainerStyle,
  getImplicitSectionMinimizeFadeGradient,
} from '../../ReadonlyDashboard/ImplicitSection';
import { WidgetMapsProvider } from '../../shared/WidgetMapsContext';
import { EditableDashboard } from '../EditableDashboard';

jest.mock('../DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle">Drag Handle</div>,
}));

jest.mock('../ResizeHandle', () => ({
  ResizeHandle: () => <div data-testid="resize-handle">Resize Handle</div>,
}));

expect.extend(emotionMatchers);

type TestWidgetPropMap = {
  testWidget: { label: string };
};

function MockWidgetHeader({ label, mode }: Readonly<{ label: string; mode?: WidgetMode }>) {
  return (
    <div data-testid="widget-header">
      {label} ({mode})
    </div>
  );
}

function MockWidgetBody({ label }: Readonly<{ label: string }>) {
  return <div data-testid="widget-body">{label}</div>;
}

const mockWidget1: WidgetInstance<TestWidgetPropMap> = {
  key: 'widget-1',
  type: 'testWidget',
  position: { x: 0, y: 0 },
  dimensions: { width: 2, height: 2 },
  props: { label: 'Widget 1' },
};

const mockWidget2: WidgetInstance<TestWidgetPropMap> = {
  key: 'widget-2',
  type: 'testWidget',
  position: { x: 2, y: 0 },
  dimensions: { width: 2, height: 2 },
  props: { label: 'Widget 2' },
};

const mockWidget3: WidgetInstance<TestWidgetPropMap> = {
  key: 'widget-3',
  type: 'testWidget',
  position: { x: 0, y: 0 },
  dimensions: { width: 3, height: 2 },
  props: { label: 'Widget 3' },
};

const mockExplicitSection1: ExplicitSectionInstance<TestWidgetPropMap> = {
  type: 'explicit',
  key: 'test-section-1',
  name: 'Quality Metrics',
  description: 'Track code quality metrics',
  children: [mockWidget1, mockWidget2],
};

const mockExplicitSection2: ExplicitSectionInstance<TestWidgetPropMap> = {
  type: 'explicit',
  key: 'test-section-2',
  name: 'Security',
  description: 'Security related metrics',
  children: [mockWidget3],
};

const mockImplicitSection: ImplicitSectionInstance<TestWidgetPropMap> = {
  type: 'implicit',
  children: [],
};

const mockDashboard: DashboardInstance<TestWidgetPropMap> = {
  version: 0,
  children: [mockExplicitSection1, mockExplicitSection2, mockImplicitSection],
};

/** Same as `mockDashboard`, but implicit section (index 2) contains a widget — used for minimize/clip tests */
const mockDashboardImplicitWithWidget: DashboardInstance<TestWidgetPropMap> = {
  children: [
    mockExplicitSection1,
    mockExplicitSection2,
    {
      type: 'implicit',
      children: [{ ...mockWidget1, key: 'implicit-widget-1' }],
    },
  ],
};

const bodyMap: WidgetBodyMap<TestWidgetPropMap> = {
  testWidget: MockWidgetBody,
};

const headerMap: WidgetHeaderMap<TestWidgetPropMap> = {
  testWidget: MockWidgetHeader,
};

const editBehaviorMap: WidgetEditBehaviorMap<TestWidgetPropMap> = {
  testWidget: {
    defaultProps: { label: 'Default' },
    defaultSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 4 },
    minSize: { width: 1, height: 1 },
  },
};

describe('EditableDashboard', () => {
  describe('rendering', () => {
    it('should render all sections from dashboard', () => {
      renderEditableDashboard();

      expect(screen.getByText('Quality Metrics')).toBeInTheDocument();
      expect(screen.getByText('Track code quality metrics')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Security related metrics')).toBeInTheDocument();
    });

    it('should render all widgets within sections', () => {
      renderEditableDashboard();

      expect(screen.getByText('Widget 1 (edit)')).toBeInTheDocument();
      expect(screen.getByText('Widget 2 (edit)')).toBeInTheDocument();
      expect(screen.getByText('Widget 3 (edit)')).toBeInTheDocument();
    });

    it('should render drag handles for widgets', () => {
      renderEditableDashboard();

      const dragHandles = screen.getAllByTestId('drag-handle');
      expect(dragHandles.length).toBeGreaterThan(0);
    });

    it('should render resize handles for resizable widgets', () => {
      renderEditableDashboard();

      const resizeHandles = screen.getAllByTestId('resize-handle');
      expect(resizeHandles.length).toBeGreaterThan(0);
    });

    it('should convert dashboard to groups correctly', () => {
      renderEditableDashboard();

      expect(screen.getByText('Quality Metrics')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  describe('dashboard variations', () => {
    it('should handle empty dashboard', () => {
      renderEditableDashboard({ dashboard: { children: [] } });

      expect(screen.queryByText('Quality Metrics')).not.toBeInTheDocument();
      expect(screen.queryByText('Security')).not.toBeInTheDocument();
    });

    it('should handle dashboard with only explicit sections', () => {
      renderEditableDashboard({ dashboard: { children: [mockExplicitSection1] } });

      expect(screen.getByText('Quality Metrics')).toBeInTheDocument();
      expect(screen.queryByText('Security')).not.toBeInTheDocument();
    });

    it('should handle dashboard with only implicit sections', () => {
      renderEditableDashboard({ dashboard: { children: [mockImplicitSection] } });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should handle dashboard updates', () => {
      const { rerender } = renderEditableDashboard();

      expect(screen.getByText('Quality Metrics')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();

      rerender(
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={editBehaviorMap}
          headerMap={headerMap}
        >
          <EditableDashboard
            dashboard={{ children: [mockExplicitSection2] }}
            onAddWidgetToSection={jest.fn()}
            onDashboardChange={jest.fn()}
            onWidgetEdit={jest.fn()}
          />
        </WidgetMapsProvider>,
      );

      expect(screen.queryByText('Quality Metrics')).not.toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('should handle widgets with different configurations', () => {
      const widgetWithLongLabel: WidgetInstance<TestWidgetPropMap> = {
        key: 'widget-long',
        type: 'testWidget',
        position: { x: 0, y: 0 },
        dimensions: { width: 6, height: 4 },
        props: { label: 'This is a very long widget label for testing' },
      };

      renderEditableDashboard({
        dashboard: {
          children: [
            {
              type: 'explicit',
              key: 'test-custom-section',
              name: 'Custom Section',
              description: 'Section with custom widget',
              children: [widgetWithLongLabel],
            },
          ],
        },
      });

      expect(screen.getByText('This is a very long widget label for testing')).toBeInTheDocument();
    });

    it('should handle multiple sections with same widget types', () => {
      renderEditableDashboard({
        dashboard: {
          children: [
            {
              type: 'explicit',
              key: 'test-section-a',
              name: 'Section A',
              description: 'First section',
              children: [mockWidget1],
            },
            {
              type: 'explicit',
              key: 'test-section-b',
              name: 'Section B',
              description: 'Second section',
              children: [mockWidget2],
            },
            {
              type: 'explicit',
              key: 'test-section-c',
              name: 'Section C',
              description: 'Third section',
              children: [mockWidget3],
            },
          ],
        },
      });

      expect(screen.getByText('Section A')).toBeInTheDocument();
      expect(screen.getByText('Section B')).toBeInTheDocument();
      expect(screen.getByText('Section C')).toBeInTheDocument();
      expect(screen.getByText('Widget 1 (edit)')).toBeInTheDocument();
      expect(screen.getByText('Widget 2 (edit)')).toBeInTheDocument();
      expect(screen.getByText('Widget 3 (edit)')).toBeInTheDocument();
    });
  });

  describe('section interactions', () => {
    it('should handle section collapse and expand', async () => {
      const user = userEvent.setup();
      renderEditableDashboard();

      const collapseButtons = screen.getAllByRole('button', { name: 'dashboard.collapse' });

      expect(screen.getByText('Widget 1 (edit)')).toBeInTheDocument();
      expect(screen.getByText('Widget 2 (edit)')).toBeInTheDocument();

      await user.click(collapseButtons[0]);

      const expandButtons = screen.getAllByRole('button', { name: 'dashboard.expand' });
      expect(expandButtons[0]).toBeInTheDocument();
    });

    it('should have section actions menu', async () => {
      const user = userEvent.setup();
      renderEditableDashboard();

      const sectionMenuButtons = screen.getAllByRole('button', {
        name: 'dashboard.section_actions',
      });

      expect(sectionMenuButtons[0]).toBeInTheDocument();

      await user.click(sectionMenuButtons[0]);

      expect(sectionMenuButtons[0]).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows minimize fade on implicit section while dragging a section', async () => {
      renderEditableDashboard();

      const implicitShell = screen.getByTestId('dashboard-implicit-section-shell');
      const implicitChrome = getImplicitSectionContainerStyle();
      expect(implicitShell).toHaveStyle({
        overflow: implicitChrome.overflow,
        position: implicitChrome.position,
        borderRadius: implicitChrome.borderRadius,
        marginBottom: implicitChrome.marginBottom,
      });
      expect(implicitShell).toHaveStyleRule(
        'background-color',
        String(implicitChrome.backgroundColor),
      );
      expect(implicitShell).toHaveStyleRule('border', String(implicitChrome.border));
      expect(implicitShell).toHaveStyleRule('box-shadow', String(implicitChrome.boxShadow));

      const dragControls = screen.getAllByRole('button', {
        name: 'dashboard.drag_section_to_reorder',
      });
      fireEvent.mouseDown(dragControls[0], { clientX: 10, clientY: 10 });

      const fade = await screen.findByTestId('dashboard-implicit-section-minimize-fade');
      expect(fade.style.background).toBe(getImplicitSectionMinimizeFadeGradient());

      fireEvent.mouseUp(document);
    });

    it('applies drag minimize clip to implicit widget grid and add-widget control', () => {
      renderEditableDashboard({ dashboard: mockDashboardImplicitWithWidget });

      const implicitShell = screen.getByTestId('dashboard-implicit-section-shell');
      const clipRegion = screen.getByTestId('dashboard-implicit-section-clip-region');
      expect(implicitShell).toContainElement(clipRegion);
      expect(clipRegion).toHaveStyle({ maxHeight: 'none', overflow: 'visible' });

      const dragControls = screen.getAllByRole('button', {
        name: 'dashboard.drag_section_to_reorder',
      });
      fireEvent.mouseDown(dragControls[0], { clientX: 10, clientY: 10 });

      expect(clipRegion).toHaveStyle({
        maxHeight: `${implicitSectionDragMinimizeClipHeightPx()}px`,
        overflow: 'hidden',
      });

      expect(
        byTestId('dashboard-implicit-section-clip-region').byTestId('widget-body').get(),
      ).toBeInTheDocument();
      expect(
        byTestId('dashboard-implicit-section-clip-region')
          .byTestId('inline-add-widget-button-section-2')
          .get(),
      ).toBeInTheDocument();

      fireEvent.mouseUp(document);
    });

    it('should handle section deletion', async () => {
      const user = userEvent.setup();
      const { mockOnDashboardChange } = renderEditableDashboard();

      const sectionMenuButtons = screen.getAllByRole('button', {
        name: 'dashboard.section_actions',
      });
      await user.click(sectionMenuButtons[0]);

      await user.click(screen.getByText('dashboard.delete_section'));

      const confirmButton = await screen.findByRole('button', { name: 'delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDashboardChange).toHaveBeenCalled();
      });
      expect(mockOnDashboardChange).toHaveBeenCalledWith(expect.objectContaining({ version: 0 }));
    });

    it('should handle section edit', async () => {
      const user = userEvent.setup();
      const { mockOnDashboardChange } = renderEditableDashboard();

      const sectionMenuButtons = screen.getAllByRole('button', {
        name: 'dashboard.section_actions',
      });
      await user.click(sectionMenuButtons[0]);

      await user.click(screen.getByText('dashboard.edit_section'));

      const nameInput = await screen.findByDisplayValue('Quality Metrics');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Section Name');

      await user.click(screen.getByRole('button', { name: 'save' }));

      await waitFor(() => {
        expect(mockOnDashboardChange).toHaveBeenCalled();
      });
    });
  });

  describe('widget interactions', () => {
    it('should handle widget deletion', async () => {
      const user = userEvent.setup();
      const { mockOnDashboardChange } = renderEditableDashboard();

      const widgetActionsButtons = screen.getAllByRole('button', {
        name: 'dashboard.widget_actions',
      });
      await user.click(widgetActionsButtons[0]);

      await user.click(screen.getByText('dashboard.delete_widget'));

      await waitFor(() => {
        expect(mockOnDashboardChange).toHaveBeenCalled();
      });
    });
  });
});

function renderEditableDashboard(
  props: {
    dashboard?: DashboardInstance<TestWidgetPropMap>;
    onDashboardChange?: (dashboard: DashboardInstance<TestWidgetPropMap>) => void;
    onWidgetEdit?: (sectionIndex: number, widget: WidgetInstance<TestWidgetPropMap>) => void;
  } = {},
) {
  const mockOnDashboardChange = jest.fn();
  const mockOnWidgetEdit = jest.fn();

  return {
    ...renderWithContext(
      <WidgetMapsProvider bodyMap={bodyMap} editBehaviorMap={editBehaviorMap} headerMap={headerMap}>
        <EditableDashboard
          dashboard={props.dashboard ?? mockDashboard}
          onAddWidgetToSection={jest.fn()}
          onDashboardChange={props.onDashboardChange ?? mockOnDashboardChange}
          onWidgetEdit={props.onWidgetEdit ?? mockOnWidgetEdit}
        />
      </WidgetMapsProvider>,
    ),
    mockOnDashboardChange: props.onDashboardChange ?? mockOnDashboardChange,
  };
}
