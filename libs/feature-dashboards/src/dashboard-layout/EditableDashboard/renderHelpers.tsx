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

import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  cssVar,
  DropdownMenu,
  IconMoreVertical,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import type {
  CardHeaderElementProps,
  ResizeHandleElementProps,
} from '../../editable-multigrid/types';
import { WidgetMode } from '../../types/widget-common';
import type { WidgetInstance } from '../logic/types';
import { WidgetBox } from '../shared/WidgetBox';
import { WidgetContent } from '../shared/WidgetContent';
import { WidgetHeader } from '../shared/WidgetHeader';
import { DragHandle } from './DragHandle';
import { ResizeHandle } from './ResizeHandle';

/**
 * Renders the content of a widget card (without header).
 *
 * @param widget - The widget instance to render
 * @param isDragging - Whether the widget is currently being dragged
 */
export function renderCardContent<WPM extends {}>(
  widget: WidgetInstance<WPM>,
  isDragging: boolean,
) {
  return (
    <div
      data-widget-key={widget.key}
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minHeight: 0, // Allow flex item to shrink below content size
        opacity: isDragging ? 0.5 : 1,
        pointerEvents: 'none', // Disable clicks on widget content during edit mode
      }}
    >
      <WidgetContent mode={WidgetMode.Edit} widget={widget} />
    </div>
  );
}

/**
 * Widget card header component with drag handle and actions dropdown.
 *
 * Internal component used by renderCardHeaderContent.
 */
function WidgetCardHeader<WPM extends {}>(
  headerProps: Readonly<CardHeaderElementProps<WidgetInstance<WPM>>>,
) {
  const {
    card: widget,
    dragHandleRef,
    isKeyboardDragging,
    onDelete,
    onEdit,
    onKeyDown,
  } = headerProps;
  const intl = useIntl();

  // Pass WidgetMode.Edit to the header for edit-mode styling
  const widgetWithEditMode = {
    ...widget,
    props: { ...widget.props, mode: WidgetMode.Edit },
  } as WidgetInstance<WPM>;

  return (
    <div
      className="sw-flex sw-items-start sw-justify-between sw-w-full sw-gap-2"
      style={{ marginBottom: cssVar('dimension-space-100'), position: 'relative' }}
    >
      <div
        className="drag-handle-container sw-flex sw-justify-center sw-items-start"
        style={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <button
          aria-label="Drag widget. Press Enter to start dragging, arrow keys to move, Enter to confirm, Escape to cancel."
          aria-pressed={isKeyboardDragging}
          className="sw-flex sw-flex-1 sw-min-w-0 sw-items-start sw-gap-2 sw-mt-1.5 sw-border-none sw-bg-transparent"
          onKeyDown={onKeyDown}
          ref={dragHandleRef}
          style={{
            padding: '2px 60px 30px 60px',
            cursor: isKeyboardDragging ? 'grabbing' : 'grab',
            // @ts-expect-error - WebkitUserDrag is needed for Safari drag support but not in standard CSS types
            WebkitUserDrag: 'element',
          }}
          type="button"
        >
          <DragHandle isHorizontal titleMessageId="dashboard.drag_to_reorder" />
        </button>
      </div>

      <div className="sw-flex-1 sw-min-w-0">
        <WidgetHeader widget={widgetWithEditMode} />
      </div>
      <DropdownMenu
        items={
          <>
            {onEdit && (
              <DropdownMenu.ItemButton onClick={onEdit}>
                {intl.formatMessage({ id: 'dashboard.edit_widget' })}
              </DropdownMenu.ItemButton>
            )}
            <DropdownMenu.ItemButtonDestructive onClick={onDelete}>
              {intl.formatMessage({ id: 'dashboard.delete_widget' })}
            </DropdownMenu.ItemButtonDestructive>
          </>
        }
      >
        <ButtonIcon
          Icon={IconMoreVertical}
          ariaLabel={intl.formatMessage({ id: 'dashboard.widget_actions' })}
          size={ButtonSize.Medium}
          variety={ButtonVariety.DefaultGhost}
        />
      </DropdownMenu>
    </div>
  );
}

/**
 * Renders the header of a widget card (drag handle and actions).
 *
 * @param headerProps - Props provided by the GridLayout library
 */
export function renderCardHeaderContent<WPM extends {}>(
  headerProps: CardHeaderElementProps<WidgetInstance<WPM>>,
) {
  return <WidgetCardHeader {...headerProps} />;
}

/**
 * Renders the drag preview for a widget being dragged.
 *
 * @param widget - The widget being dragged
 * @param pixelDimensions - The size of the preview in pixels
 */
export function renderDragPreviewContent<WPM extends {}>(
  widget: WidgetInstance<WPM>,
  pixelDimensions: { height: number; width: number },
) {
  return (
    <WidgetBox
      style={{
        border: `2px solid ${cssVar('color-border-accent-default')}`,
        boxShadow: cssVar('box-shadow-large'),
        boxSizing: 'border-box',
        height: `${pixelDimensions.height}px`,
        opacity: 0.9,
        width: `${pixelDimensions.width}px`,
      }}
    >
      <div
        className="sw-flex sw-w-full sw-items-start sw-gap-2"
        style={{ marginBottom: cssVar('dimension-space-100'), position: 'relative' }}
      >
        <div
          className="drag-handle-container sw-flex sw-justify-center sw-items-start"
          style={{
            position: 'absolute',
            top: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 60px 30px 60px',
            opacity: 1,
          }}
        >
          <DragHandle isHorizontal titleMessageId="dashboard.drag_to_reorder" />
        </div>
        <div className="sw-flex-1 sw-min-w-0">
          <WidgetHeader widget={widget} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          pointerEvents: 'none',
        }}
      >
        <WidgetContent mode={WidgetMode.Edit} widget={widget} />
      </div>
      <div
        style={{
          bottom: 0,
          padding: cssVar('dimension-space-50'),
          position: 'absolute',
          right: 0,
        }}
      >
        <ResizeHandle />
      </div>
    </WidgetBox>
  );
}

/**
 * Renders the resize handle for a widget.
 *
 * @param handleProps - Props provided by the GridLayout library
 */
export function renderResizeHandleContent(handleProps: ResizeHandleElementProps) {
  return (
    <button
      aria-label="Resize widget. Press Enter to start resizing, arrow keys to adjust size, Enter to confirm, Escape to cancel."
      aria-pressed={handleProps.isResizing}
      className="sw-border-none sw-bg-transparent sw-p-0"
      onKeyDown={handleProps.onKeyDown}
      ref={handleProps.resizeHandleRef}
      style={{
        bottom: cssVar('dimension-space-50'),
        cursor: handleProps.isResizing ? 'nwse-resize' : 'se-resize',
        lineHeight: 0,
        position: 'absolute',
        right: cssVar('dimension-space-50'),
      }}
      type="button"
    >
      <ResizeHandle />
    </button>
  );
}
