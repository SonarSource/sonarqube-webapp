/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import * as React from 'react';

export type FacetItemsListProps =
  | {
      children?: React.ReactNode;
      label?: never;
      labelledby: string;
    }
  | {
      children?: React.ReactNode;
      label: string;
      labelledby?: never;
    };

export function FacetItemsList({ children, labelledby, label }: FacetItemsListProps) {
  const props = labelledby ? { 'aria-labelledby': labelledby } : { 'aria-label': label };

  return (
    <ul className="sw-flex sw-flex-col sw-gap-1" {...props}>
      {children}
    </ul>
  );
}
