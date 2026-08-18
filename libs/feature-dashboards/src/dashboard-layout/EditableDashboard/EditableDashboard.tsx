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

import { useCallback, useMemo, useRef, useState } from 'react';
import { reportError } from '~adapters/helpers/report-error';
import { getDashboardErrorReportingPayload } from '~shared/helpers/dashboard-error-reporting';
import { GridLayout } from '../../editable-multigrid/components/GridLayout';
import { GridLayoutErrorBoundary } from '../../editable-multigrid/components/GridLayoutErrorBoundary';
import { DEFAULT_CONTAINER_PADDING, DEFAULT_GRID_MARGIN } from '../../editable-multigrid/constants';
import type { Card, Dimensions, Group } from '../../editable-multigrid/types';
import {
  DashboardInstance,
  ExplicitSectionInstance,
  SectionInstance,
  WidgetInstance,
} from '../logic/types';
import { GRID_CONSTANTS } from '../ReadonlyDashboard/constants';
import { useWidgetMaps } from '../shared/WidgetMapsContext';
import { useSectionDrag } from './hooks/useSectionDrag';
import { useWidgetHandlers } from './hooks/useWidgetHandlers';
import { MultigridSectionEditable } from './MultigridSectionEditable';
import {
  renderCardContent,
  renderCardHeaderContent,
  renderDragPreviewContent,
  renderResizeHandleContent,
} from './renderHelpers';
import { SectionDragGhost } from './sections/SectionDragGhost';
import { SectionTargetPreview } from './sections/SectionTargetPreview';

interface Props<WidgetPropMap extends {}> {
  dashboard: DashboardInstance<WidgetPropMap>;
  onAddWidgetToSection: (sectionIndex: number) => void;
  onDashboardChange: (dashboard: DashboardInstance<WidgetPropMap>) => void;
  onWidgetEdit: (sectionIndex: number, widget: WidgetInstance<WidgetPropMap>) => void;
}

// Grid configuration - matches legacy dashboard
const GRID_COLUMNS = 12;

/**
 * Type assertion: WidgetInstance as Card
 *
 * WidgetInstance has all required Card properties (key, position, dimensions) plus
 * additional widget-specific properties (props, type). The multigrid library only
 * uses the Card subset, so we can safely use WidgetInstance where Card is expected.
 *
 * This explicit type definition makes the relationship clear and provides a single
 * point to update if either interface changes.
 */
type WidgetAsCard<WPM extends {}> = WidgetInstance<WPM> & Card;

/**
 * Adapter interface: Dashboard Section to Multigrid Group
 *
 * Extends the library's Group interface with dashboard-specific properties.
 * The children are WidgetInstances that satisfy the Card interface.
 */
interface SectionGroup<WidgetPropMap extends {}> extends Group<WidgetAsCard<WidgetPropMap>> {
  description: string;
  sectionType: 'explicit' | 'implicit';
  title: string;
}

// Fallback dimensions if widget type not found in editBehaviorMap
const DEFAULT_MIN_DIMENSIONS: Dimensions = { width: 1, height: 1 };
const DEFAULT_MAX_DIMENSIONS: Dimensions = { width: 6, height: 4 };

/**
 * Convert Dashboard sections to Multigrid groups.
 *
 * This adapter function translates between our dashboard domain model (sections with widgets)
 * and the multigrid library's model (groups with cards). Since WidgetInstance satisfies the
 * Card interface, widgets can be used directly as cards without data transformation.
 */
function dashboardToGroups<WidgetPropMap extends {}>(
  dashboard: DashboardInstance<WidgetPropMap>,
): SectionGroup<WidgetPropMap>[] {
  return dashboard.children.map((section, index) => {
    const key = section.type === 'explicit' ? section.key : `implicit-${index}`;
    const title = section.type === 'explicit' ? section.name : `Section ${index + 1}`;
    const description = section.type === 'explicit' ? section.description : '';

    return {
      key,
      title,
      description,
      sectionType: section.type,
      // Widgets are used directly as cards (they satisfy the Card interface)
      children: section.children as WidgetAsCard<WidgetPropMap>[],
    };
  });
}

/**
 * Convert Multigrid groups back to Dashboard sections.
 *
 * Translates from the library's group model back to our dashboard domain model.
 * Children are WidgetInstances throughout (no data transformation needed), but we
 * need to rebuild the section structure with its explicit/implicit distinction.
 */
function groupsToDashboard<WidgetPropMap extends {}>(
  dashboard: DashboardInstance<WidgetPropMap>,
  groups: SectionGroup<WidgetPropMap>[],
): DashboardInstance<WidgetPropMap> {
  return {
    ...dashboard,
    children: groups.map((group): SectionInstance<WidgetPropMap> => {
      // Cast children back to WidgetInstance (they never changed, just typed as Card)
      const widgets = group.children as unknown as WidgetInstance<WidgetPropMap>[];

      if (group.sectionType === 'explicit') {
        return {
          type: 'explicit',
          key: group.key,
          name: group.title,
          description: group.description,
          children: widgets,
        };
      }
      return {
        type: 'implicit',
        children: widgets,
      };
    }),
  };
}

export function EditableDashboard<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { dashboard, onAddWidgetToSection, onDashboardChange, onWidgetEdit } = props;
  const { editBehaviorMap } = useWidgetMaps<WidgetPropMap>();

  // Derive groups from dashboard
  const groups = useMemo(() => dashboardToGroups(dashboard), [dashboard]);

  // Get min/max size from editBehaviorMap based on widget type
  const getMinSize = useCallback(
    (widget: WidgetInstance<WidgetPropMap>): Dimensions => {
      const behavior = editBehaviorMap[widget.type];
      return behavior?.minSize ?? DEFAULT_MIN_DIMENSIONS;
    },
    [editBehaviorMap],
  );

  const getMaxSize = useCallback(
    (widget: WidgetInstance<WidgetPropMap>): Dimensions => {
      const behavior = editBehaviorMap[widget.type];
      return behavior?.maxSize ?? DEFAULT_MAX_DIMENSIONS;
    },
    [editBehaviorMap],
  );

  // Report grid layout errors to Sentry
  const handleGridLayoutError = useCallback((caught: unknown, errorInfo: React.ErrorInfo) => {
    const { context, message } = getDashboardErrorReportingPayload(caught, errorInfo, {
      source: 'GridLayoutErrorBoundary',
    });
    reportError(`Dashboard grid layout error: ${message}`, context);
  }, []);

  // Collapsed sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert groups back to dashboard format
  const handleGroupsChange = useCallback(
    (newGroups: SectionGroup<WidgetPropMap>[]) => {
      const newDashboard = groupsToDashboard(dashboard, newGroups);
      onDashboardChange(newDashboard);
    },
    [dashboard, onDashboardChange],
  );

  // Section drag handlers
  const {
    sectionDragState,
    draggedSection,
    sectionRefsMap,
    handleSectionDragStart,
    handleSectionDragMove,
    handleSectionDragEnd,
  } = useSectionDrag(groups, handleGroupsChange);

  // Widget operation handlers
  const { handleWidgetDelete, handleWidgetEdit } = useWidgetHandlers(
    groups,
    handleGroupsChange,
    onWidgetEdit,
  );

  // Section edit and delete handlers
  const handleToggleCollapse = (groupKey: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleSectionEdit = useCallback(
    (groupKey: string, name: string, description: string) => {
      const newGroups = groups.map((g) =>
        g.key === groupKey ? { ...g, title: name, description } : g,
      );
      handleGroupsChange(newGroups);
    },
    [groups, handleGroupsChange],
  );

  const handleSectionDelete = useCallback(
    (groupKey: string) => {
      const newGroups = groups.filter((g) => g.key !== groupKey);
      handleGroupsChange(newGroups);
    },
    [groups, handleGroupsChange],
  );

  const draggedExplicitSection = useMemo((): ExplicitSectionInstance<WidgetPropMap> | null => {
    if (draggedSection?.sectionType !== 'explicit') {
      return null;
    }
    return {
      type: 'explicit',
      key: draggedSection.key,
      name: draggedSection.title,
      description: draggedSection.description,
      children: [],
    };
  }, [draggedSection]);

  return (
    <div
      className="sw-py-4"
      ref={containerRef}
      style={{
        contain: 'inline-size',
        position: 'relative',
        width: '100%',
      }}
    >
      <GridLayoutErrorBoundary onError={handleGridLayoutError} resetOnPropsChange>
        <GridLayout<WidgetInstance<WidgetPropMap>, SectionGroup<WidgetPropMap>>
          getMaxSize={getMaxSize}
          getMinSize={getMinSize}
          groups={groups}
          layout={{
            // Actual configuration values:
            col: GRID_COLUMNS,
            // Inset matches readonly WidgetGrid via grid margin + section chrome; non-zero
            // containerPadding shrinks calculated width without CSS inset (right-side gap).
            containerPadding: DEFAULT_CONTAINER_PADDING,
            margin: DEFAULT_GRID_MARGIN,
            rowHeight: GRID_CONSTANTS.ROW_HEIGHT,
            // Placeholder values - will be calculated by GridLayout on mount:
            calWidth: 0,
            containerHeight: 0,
            containerWidth: 0,
          }}
          onCardDelete={handleWidgetDelete}
          onCardEdit={handleWidgetEdit}
          onGroupsChange={handleGroupsChange}
          renderCard={renderCardContent}
          renderCardHeader={renderCardHeaderContent}
          renderDragPreview={renderDragPreviewContent}
          renderGroup={(group, children, index) => {
            const isExplicit = group.sectionType === 'explicit';
            const isDragging = isExplicit && sectionDragState?.draggedKey === group.key;
            // Show preview before this section if it's the target AND not the dragged section
            const showPreviewBefore =
              sectionDragState?.targetKey === group.key &&
              sectionDragState?.targetKey !== sectionDragState?.draggedKey;
            const isLastSection = index === groups.length - 1;
            const showPreviewAfter =
              sectionDragState && isLastSection && !sectionDragState.targetKey;

            // Create handlers only for explicit sections
            const explicitHandlers = isExplicit
              ? {
                  onDelete: () => {
                    handleSectionDelete(group.key);
                  },
                  onDragEnd: handleSectionDragEnd,
                  onDragMove: handleSectionDragMove,
                  onDragStart: (mousePos: { x: number; y: number }) => {
                    handleSectionDragStart(group.key, mousePos);
                  },
                  onEdit: (name: string, desc: string) => {
                    handleSectionEdit(group.key, name, desc);
                  },
                  onToggleCollapse: () => {
                    handleToggleCollapse(group.key);
                  },
                }
              : {};

            return (
              <>
                {showPreviewBefore && draggedExplicitSection && (
                  <SectionTargetPreview section={draggedExplicitSection} />
                )}
                <MultigridSectionEditable
                  forceMinimized={!!sectionDragState}
                  isCollapsed={collapsedSections.has(group.key)}
                  isDragging={isDragging}
                  key={group.key}
                  onAddWidget={() => {
                    onAddWidgetToSection(index);
                  }}
                  sectionDescription={group.description}
                  sectionIndex={index}
                  sectionName={group.title}
                  sectionRef={(el) => {
                    sectionRefsMap.current.set(group.key, el);
                  }}
                  sectionType={group.sectionType}
                  {...explicitHandlers}
                >
                  {children}
                </MultigridSectionEditable>
                {showPreviewAfter && draggedExplicitSection && (
                  <SectionTargetPreview section={draggedExplicitSection} />
                )}
              </>
            );
          }}
          renderResizeHandle={renderResizeHandleContent}
        />
      </GridLayoutErrorBoundary>

      {/* Section drag ghost - follows mouse (only for explicit sections) */}
      {sectionDragState && draggedExplicitSection && containerRef.current && (
        <SectionDragGhost
          containerRect={containerRef.current.getBoundingClientRect()}
          mousePosition={sectionDragState.mousePosition}
          section={draggedExplicitSection}
        />
      )}
    </div>
  );
}
