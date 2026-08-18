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

import { Heading, cssVar } from '@sonarsource/echoes-react';
import { ExplicitSectionInstance } from '../../logic/types';
import { GRID_CONSTANTS } from '../../ReadonlyDashboard/constants';
import { SectionHeaderTitleAndDescriptionColumn } from '../../SectionHeaderTitleAndDescriptionColumn';

interface Props<WidgetPropMap extends {}> {
  section: ExplicitSectionInstance<WidgetPropMap>;
}

export function SectionTargetPreview<WidgetPropMap extends {}>(
  props: Readonly<Props<WidgetPropMap>>,
) {
  const { section } = props;

  return (
    <div
      data-target-preview
      style={{
        border: `2px dashed ${cssVar('color-border-accent-default')}`,
        borderRadius: GRID_CONSTANTS.BORDER_RADIUS,
        margin: `${cssVar('dimension-space-100')} 0`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <div
        style={{
          padding: GRID_CONSTANTS.PADDING,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: 0.7,
        }}
      >
        <SectionHeaderTitleAndDescriptionColumn
          sectionDescription={section.description}
          titleRow={<Heading as="h3">{section.name}</Heading>}
        />
      </div>
    </div>
  );
}
