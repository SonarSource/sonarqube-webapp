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

import { useIntl } from 'react-intl';
import { IssuesQuery } from '~sq-server-commons/types/issues';
import { BooleanFacet, BooleanFacetOption } from './BooleanFacet';

export interface PrioritizedRuleFacetProps {
  fetching: boolean;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  stats: Record<string, number> | undefined;
  value: true | undefined;
}

export function PrioritizedRuleFacet(props: Readonly<PrioritizedRuleFacetProps>) {
  const { fetching, onChange, onToggle, open, value, stats } = props;
  const intl = useIntl();

  const property = 'prioritizedRule';

  const options: BooleanFacetOption[] = [
    {
      nameKey: 'issues.facet.prioritized_rule',
      value: true,
    },
  ];

  return (
    <BooleanFacet
      fetching={fetching}
      name={intl.formatMessage({ id: 'issues.facet.prioritized_rule.category' })}
      onChange={onChange}
      onToggle={onToggle}
      open={open}
      options={options}
      property={property}
      stats={stats}
      value={value}
    />
  );
}
