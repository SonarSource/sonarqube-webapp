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
  Heading,
  IconChevronDown,
  IconChevronRight,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { getSectionHeight } from '../logic/positioning';
import { ExplicitSectionInstance } from '../logic/types';
import { SectionHeaderTitleAndDescriptionColumn } from '../SectionHeaderTitleAndDescriptionColumn';
import { DashboardSectionCardChrome } from '../shared/dashboardSectionCardChrome';
import { calculateSectionHeight, GRID_CONSTANTS } from './constants';
import { WidgetGrid } from './WidgetGrid';

interface Props<WidgetPropMap extends {}> {
  gridWidth: number;
  section: ExplicitSectionInstance<WidgetPropMap>;
}

export function ExplicitSection<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { gridWidth, section } = props;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const maxRow = getSectionHeight(section);
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <DashboardSectionCardChrome>
      <div
        style={{
          alignItems: 'center',
          borderBottom: `1px solid ${isCollapsed ? 'transparent' : cssVar('color-border-weak')}`,
          display: 'flex',
          justifyContent: 'space-between',
          padding: GRID_CONSTANTS.PADDING,
          transition: `border-color ${GRID_CONSTANTS.TRANSITION_DURATION} ${GRID_CONSTANTS.TRANSITION_EASING}`,
        }}
      >
        <SectionHeaderTitleAndDescriptionColumn
          sectionDescription={section.description}
          titleRow={<Heading as="h3">{section.name}</Heading>}
        />
        <ButtonIcon
          Icon={isCollapsed ? IconChevronRight : IconChevronDown}
          aria-expanded={!isCollapsed}
          ariaLabel={`Toggle ${section.name} section`}
          onClick={handleToggleCollapse}
          size={ButtonSize.Medium}
          variety={ButtonVariety.DefaultGhost}
        />
      </div>

      {/* Widgets stay mounted so the max-height collapse animation keeps working, but the collapsed
      content must not stay reachable by assistive technologies (WCAG 4.1.2). visibility: hidden removes
      it from the accessibility tree and from focus order; delaying the visibility flip by the transition
      duration keeps the content visible while it is being clipped during the collapse animation. */}
      <div
        style={{
          maxHeight: isCollapsed ? '0px' : `${calculateSectionHeight(maxRow)}px`,
          overflow: 'hidden',
          transition: `max-height ${GRID_CONSTANTS.TRANSITION_DURATION} ${GRID_CONSTANTS.TRANSITION_EASING}, visibility 0s linear ${isCollapsed ? GRID_CONSTANTS.TRANSITION_DURATION : '0s'}`,
          visibility: isCollapsed ? 'hidden' : 'visible',
        }}
      >
        <WidgetGrid gridWidth={gridWidth} maxRows={maxRow} section={section} />
      </div>
    </DashboardSectionCardChrome>
  );
}
