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

import { Text } from '@sonarsource/echoes-react';

export interface ChartLegendItem {
  color: string;
  label: string;
  value: number;
}

interface Props {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: Readonly<Props>) {
  return (
    <div className="sw-flex sw-flex-col sw-gap-3">
      {items.map((item) => (
        <div className="sw-flex sw-items-center sw-gap-2" key={item.label}>
          <span
            aria-hidden
            className="sw-inline-block sw-shrink-0 sw-rounded-pill"
            style={{ backgroundColor: item.color, height: '0.75rem', width: '0.75rem' }}
          />
          <Text>{item.label}</Text>
        </div>
      ))}
    </div>
  );
}
