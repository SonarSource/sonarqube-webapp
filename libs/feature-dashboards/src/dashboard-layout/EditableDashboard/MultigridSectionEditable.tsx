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

import styled from '@emotion/styled';
import {
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  cssVar,
  DropdownMenu,
  Heading,
  IconMoreVertical,
  IconPlus,
  Text,
} from '@sonarsource/echoes-react';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { DeleteSectionModal } from '../modals/DeleteSectionModal';
import { EditSectionModal } from '../modals/EditSectionModal';
import {
  GRID_CONSTANTS,
  implicitSectionDragMinimizeClipHeightPx,
} from '../ReadonlyDashboard/constants';
import { getImplicitSectionMinimizeFadeGradient } from '../ReadonlyDashboard/ImplicitSection';
import { SectionHeaderTitleAndDescriptionColumn } from '../SectionHeaderTitleAndDescriptionColumn';
import {
  DashboardSectionCardChrome,
  ImplicitDashboardSectionShell,
} from '../shared/dashboardSectionCardChrome';
import { DragHandle } from './DragHandle';

// Styled component for the add widget button - sized like a card
const AddWidgetButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  margin-bottom: 1rem;
  min-height: 120px;
  max-width: 400px;
  width: 100%;
  border: 2px dashed;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: ${cssVar('color-background-neutral-subtle-default')};
  border-color: ${cssVar('color-border-weak')};
  color: ${cssVar('color-text-subtle')};
  transition: all 0.1s ease-in-out;

  &:hover {
    background-color: ${cssVar('color-background-accent-weak-hover')};
    border-color: ${cssVar('color-border-accent-default')};
    color: ${cssVar('color-text-default')};
  }

  &:active {
    background-color: ${cssVar('color-background-accent-weak-active')};
    border-color: ${cssVar('color-border-accent-default')};
    color: ${cssVar('color-text-default')};
  }
`;

const IconWrapper = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Props {
  children: ReactNode;
  forceMinimized?: boolean;
  isCollapsed?: boolean;
  isDragging?: boolean;
  onAddWidget: () => void;
  onDelete?: () => void;
  onDragEnd?: () => void;
  onDragMove?: (mousePos: { x: number; y: number }) => void;
  onDragStart?: (mousePos: { x: number; y: number }) => void;
  onEdit?: (name: string, description: string) => void;
  onToggleCollapse?: () => void;
  sectionDescription: string;
  sectionIndex: number;
  sectionName: string;
  /** Ref callback to register this section's DOM element */
  sectionRef?: (element: HTMLDivElement | null) => void;
  /** Type of section — explicit has full header; implicit uses shared implicit chrome (no header) */
  sectionType: 'explicit' | 'implicit';
}

/**
 * Section wrapper for multigrid layout.
 * Provides section header with drag handle, name, description, and actions.
 * Implicit sections share readonly chrome (solid border, surface fill, no header).
 */
export function MultigridSectionEditable(props: Readonly<Props>) {
  const {
    children,
    forceMinimized = false,
    isCollapsed = false,
    isDragging = false,
    onAddWidget,
    onDelete,
    onDragEnd,
    onDragMove,
    onDragStart,
    onEdit,
    onToggleCollapse,
    sectionDescription,
    sectionIndex,
    sectionName,
    sectionRef,
    sectionType,
  } = props;

  const isImplicit = sectionType === 'implicit';

  const intl = useIntl();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Explicit sections fully collapse; implicit sections show partial content with fade
  const shouldBeCollapsed = forceMinimized || isCollapsed;

  const handleMouseDown = (event: React.MouseEvent) => {
    // Prevent dragging if clicking on interactive elements
    const { target } = event;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    event.preventDefault();
    const mousePos = {
      x: event.clientX,
      y: event.clientY,
    };

    onDragStart?.(mousePos);

    // Set up global mouse move and up listeners
    const handleMouseMove = (e: MouseEvent) => {
      onDragMove?.({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      onDragEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleEditSection = (name: string, description: string) => {
    onEdit?.(name, description);
  };

  const handleDeleteSection = () => {
    onDelete?.();
  };

  // Implicit sections: same outer chrome as readonly; grid + add-widget affordances inside
  if (isImplicit) {
    // Determine height and overflow for implicit sections
    const isMinimizedDuringDrag = forceMinimized;
    const clipMaxHeight = isMinimizedDuringDrag
      ? `${implicitSectionDragMinimizeClipHeightPx()}px`
      : 'none';
    const showFade = isMinimizedDuringDrag;

    return (
      <ImplicitDashboardSectionShell
        data-testid="dashboard-implicit-section-shell"
        ref={sectionRef}
      >
        {/*
         * SC-47124: While reordering an explicit section, every implicit section gets `forceMinimized`.
         * The grid and the inline “add widget” control share one clipped column so the CTA is truncated
         * and faded like real widgets; reorder is not the primary add-widget moment.
         */}
        <div
          data-testid="dashboard-implicit-section-clip-region"
          style={{
            /* Width containment only — horizontal inset comes from grid margin, not containerPadding. */
            boxSizing: 'border-box',
            contain: 'inline-size',
            maxHeight: clipMaxHeight,
            overflow: isMinimizedDuringDrag ? 'hidden' : 'visible',
            position: 'relative',
            transition: `max-height ${GRID_CONSTANTS.TRANSITION_DURATION} ${GRID_CONSTANTS.TRANSITION_EASING}`,
          }}
        >
          {children}

          {/* Add Widget Button - marginLeft matches first grid column inset (grid margin[0]) */}
          <div style={{ marginLeft: GRID_CONSTANTS.PADDING }}>
            <AddWidgetButton
              data-testid={`inline-add-widget-button-section-${sectionIndex}`}
              onClick={onAddWidget}
              type="button"
            >
              <IconWrapper>
                <IconPlus />
              </IconWrapper>
              <Text>{intl.formatMessage({ id: 'dashboard.add_widget' })}</Text>
            </AddWidgetButton>
          </div>

          {showFade && (
            <div
              data-testid="dashboard-implicit-section-minimize-fade"
              style={{
                background: getImplicitSectionMinimizeFadeGradient(),
                bottom: 0,
                height: '60px',
                left: 0,
                pointerEvents: 'none',
                position: 'absolute',
                right: 0,
              }}
            />
          )}
        </div>
      </ImplicitDashboardSectionShell>
    );
  }

  // Explicit sections render with full header and actions
  return (
    <div
      ref={sectionRef}
      style={{
        // Remove from layout when dragging - target preview takes its place
        display: isDragging ? 'none' : 'block',
      }}
    >
      <DashboardSectionCardChrome>
        {/* Section Header */}
        <div
          style={{
            alignItems: 'center',
            borderBottom: `1px solid ${shouldBeCollapsed ? 'transparent' : cssVar('color-border-weak')}`,
            display: 'flex',
            justifyContent: 'space-between',
            padding: GRID_CONSTANTS.PADDING,
            transition: `border-color ${GRID_CONSTANTS.TRANSITION_DURATION} ${GRID_CONSTANTS.TRANSITION_EASING}`,
          }}
        >
          <SectionHeaderTitleAndDescriptionColumn
            sectionDescription={sectionDescription}
            titleRow={
              <div
                aria-label={intl.formatMessage({ id: 'dashboard.drag_section_to_reorder' })}
                onMouseDown={handleMouseDown}
                role="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: cssVar('dimension-space-150'),
                  cursor: 'grab',
                }}
                tabIndex={0}
              >
                <DragHandle />
                <Heading as="h3">{sectionName}</Heading>
              </div>
            }
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: cssVar('dimension-space-50') }}>
            <Button onClick={onToggleCollapse} variety={ButtonVariety.DefaultGhost}>
              {isCollapsed
                ? intl.formatMessage({ id: 'dashboard.expand' })
                : intl.formatMessage({ id: 'dashboard.collapse' })}
            </Button>

            <DropdownMenu
              items={
                <>
                  <DropdownMenu.ItemButton
                    onClick={() => {
                      setIsEditModalOpen(true);
                    }}
                  >
                    {intl.formatMessage({ id: 'dashboard.edit_section' })}
                  </DropdownMenu.ItemButton>

                  <DropdownMenu.Separator />

                  <DropdownMenu.ItemButtonDestructive
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    {intl.formatMessage({ id: 'dashboard.delete_section' })}
                  </DropdownMenu.ItemButtonDestructive>
                </>
              }
            >
              <ButtonIcon
                Icon={IconMoreVertical}
                ariaLabel={intl.formatMessage({ id: 'dashboard.section_actions' })}
                size={ButtonSize.Medium}
                variety={ButtonVariety.DefaultGhost}
              />
            </DropdownMenu>
          </div>
        </div>

        {/* Section Content */}
        <div
          style={{
            maxHeight: shouldBeCollapsed ? '0px' : 'none',
            overflow: shouldBeCollapsed ? 'hidden' : 'visible',
            transition: `max-height ${GRID_CONSTANTS.TRANSITION_DURATION} ${GRID_CONSTANTS.TRANSITION_EASING}`,
          }}
        >
          <div style={{ contain: 'inline-size' }}>
            {children}

            {/* Add Widget Button - marginLeft matches first grid column inset (grid margin[0]) */}
            <div style={{ marginLeft: GRID_CONSTANTS.PADDING }}>
              <AddWidgetButton
                data-testid={`inline-add-widget-button-section-${sectionIndex}`}
                onClick={onAddWidget}
                type="button"
              >
                <IconWrapper>
                  <IconPlus />
                </IconWrapper>
                <Text>{intl.formatMessage({ id: 'dashboard.add_widget' })}</Text>
              </AddWidgetButton>
            </div>
          </div>
        </div>
      </DashboardSectionCardChrome>

      {/* Edit Section Modal */}
      <EditSectionModal
        initialDescription={sectionDescription}
        initialName={sectionName}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        onConfirm={handleEditSection}
      />

      {/* Delete Section Modal */}
      <DeleteSectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
