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

import { SectionInstance } from '../logic/types';
import { GRID_CONSTANTS } from './constants';
import { WidgetReadonly } from './WidgetReadonly';

interface Props<WidgetPropMap extends {}> {
  gridWidth: number;
  maxRows: number;
  section: SectionInstance<WidgetPropMap>;
}

export function WidgetGrid<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { gridWidth, maxRows, section } = props;
  return (
    <div
      style={{
        display: 'grid',
        gap: GRID_CONSTANTS.GAP,
        gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
        gridTemplateRows: `repeat(${maxRows}, ${GRID_CONSTANTS.ROW_HEIGHT}px)`,
        padding: GRID_CONSTANTS.PADDING,
      }}
    >
      {section.children.map((widget) => (
        <WidgetReadonly key={widget.key} widget={widget} />
      ))}
    </div>
  );
}
