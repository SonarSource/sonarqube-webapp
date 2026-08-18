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

import { cssVar } from '@sonarsource/echoes-react';
import { WidgetMode } from '../../types/widget-common';
import { WidgetInstance } from '../logic/types';
import { WidgetBox } from '../shared/WidgetBox';
import { WidgetContent } from '../shared/WidgetContent';
import { WidgetHeader } from '../shared/WidgetHeader';
import { WidgetInstanceProvider } from '../shared/WidgetInstanceContext';

interface Props<WidgetPropMap extends {}> {
  widget: WidgetInstance<WidgetPropMap>;
}

export function WidgetReadonly<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { widget } = props;

  // Calculate grid area: grid-row-start / grid-column-start / grid-row-end / grid-column-end
  const gridArea = `${widget.position.y + 1} / ${widget.position.x + 1} / ${widget.position.y + widget.dimensions.height + 1} / ${widget.position.x + widget.dimensions.width + 1}`;

  return (
    <WidgetBox
      style={{
        border: `1px solid ${cssVar('color-border-weak')}`,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        gridArea,
      }}
    >
      <WidgetInstanceProvider dimensions={widget.dimensions} widgetKey={widget.key}>
        <div
          className="sw-w-full"
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            marginBottom: cssVar('dimension-space-100'),
          }}
        >
          <WidgetHeader widget={{ ...widget, props: { ...widget.props, mode: WidgetMode.View } }} />
        </div>
        <WidgetContent mode={WidgetMode.View} widget={widget} />
      </WidgetInstanceProvider>
    </WidgetBox>
  );
}
