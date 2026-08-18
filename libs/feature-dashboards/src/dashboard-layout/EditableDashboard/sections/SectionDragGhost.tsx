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

import { cssVar, Heading } from '@sonarsource/echoes-react';
import { ExplicitSectionInstance } from '../../logic/types';
import { GRID_CONSTANTS } from '../../ReadonlyDashboard/constants';
import { SectionHeaderTitleAndDescriptionColumn } from '../../SectionHeaderTitleAndDescriptionColumn';
import { DragHandle } from '../DragHandle';

interface Props<WidgetPropMap extends {}> {
  /** Container rect for fixed positioning (multigrid). If not provided, uses absolute positioning (legacy). */
  containerRect?: DOMRect;
  mousePosition: { x: number; y: number };
  section: ExplicitSectionInstance<WidgetPropMap>;
}

export function SectionDragGhost<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { section, mousePosition, containerRect } = props;
  // Use fixed positioning with containerRect (multigrid) or absolute positioning (legacy)
  const positionStyle = containerRect
    ? {
        position: 'fixed' as const,
        left: `${containerRect.left}px`,
        width: `${containerRect.width}px`,
      }
    : {
        position: 'absolute' as const,
        left: '0px',
        width: '100%',
      };

  return (
    <div
      style={{
        ...positionStyle,
        top: `${mousePosition.y - 30}px`,
        backgroundColor: cssVar('color-surface-default'),
        border: `2px solid ${cssVar('color-border-accent-default')}`,
        borderRadius: GRID_CONSTANTS.BORDER_RADIUS,
        boxShadow: cssVar('box-shadow-large'),
        zIndex: 1000,
        opacity: 0.9,
        pointerEvents: 'none',
      }}
    >
      <div>
        <div
          style={{
            padding: GRID_CONSTANTS.PADDING,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 'none',
          }}
        >
          <SectionHeaderTitleAndDescriptionColumn
            sectionDescription={section.description}
            titleRow={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: cssVar('dimension-space-150'),
                }}
              >
                <DragHandle titleMessageId="dashboard.drag_section_to_reorder" />
                <Heading as="h3">{section.name}</Heading>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
