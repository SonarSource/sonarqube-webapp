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

import { DashboardInstance } from '../logic/types';
import { ExplicitSection } from './ExplicitSection';
import { ImplicitSection } from './ImplicitSection';

interface Props<WidgetPropMap extends {}> {
  dashboard: DashboardInstance<WidgetPropMap>;
  width: number;
}

export function ReadonlyDashboard<WidgetPropMap extends {}>(props: Readonly<Props<WidgetPropMap>>) {
  const { dashboard, width } = props;

  return (
    <div className="sw-py-4">
      {dashboard.children.map((section) => {
        if (section.type === 'explicit') {
          return <ExplicitSection gridWidth={width} key={section.key} section={section} />;
        }
        return <ImplicitSection gridWidth={width} key="implicit" section={section} />;
      })}
    </div>
  );
}
