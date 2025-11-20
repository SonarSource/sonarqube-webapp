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

import { ReactNode } from 'react';
import { SimpleListStyleFacet } from '../../../components/facets/SimpleListStyleFacet';

interface SimpleListFacetProps {
  _disabled?: boolean;
  _disabledHelper?: string;
  fetching: boolean;
  helper?: ReactNode;
  needIssueSync?: boolean;
  onChange: (changes: Record<string, any>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  possibleValues: string[];
  property: string;
  renderIcon?: (value: string, disabled?: boolean) => React.ReactNode;
  secondLine?: string;
  stats: Record<string, number> | undefined;
  translationKey: string;
  values: string[];
}

export function SimpleListFacet({
  fetching,
  helper,
  needIssueSync,
  onChange,
  onToggle,
  open,
  possibleValues,
  property,
  renderIcon,
  secondLine,
  stats,
  translationKey,
  values,
}: Readonly<SimpleListFacetProps>) {
  return (
    <SimpleListStyleFacet
      fetching={fetching}
      help={helper}
      itemNamePrefix={translationKey}
      listItems={possibleValues}
      needIssueSync={needIssueSync}
      onChange={onChange}
      onToggle={onToggle}
      open={open}
      property={property}
      renderIcon={renderIcon}
      secondLine={secondLine}
      selectedItems={values}
      stats={stats}
    />
  );
}
