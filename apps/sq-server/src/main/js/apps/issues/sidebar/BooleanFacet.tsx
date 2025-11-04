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
import { FacetBox, FacetItem } from '~design-system';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { IssuesQuery } from '~sq-server-commons/types/issues';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';

export interface BooleanFacetOption {
  nameKey: string;
  value: boolean;
}

export interface BooleanFacetProps {
  fetching: boolean;
  help?: React.ReactNode;
  name: string;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  options: BooleanFacetOption[];
  property: string;
  stats: Record<string, number> | undefined;
  value: boolean | undefined;
}

export function BooleanFacet(props: Readonly<BooleanFacetProps>) {
  const { fetching, help, name, onToggle, open, options, property, value, stats = {} } = props;
  const intl = useIntl();

  const headerId = `facet_${property}`;

  return (
    <FacetBox
      className="it__search-navigator-facet-box it__search-navigator-facet-header"
      count={value !== undefined ? 1 : 0}
      data-property={property}
      help={help}
      id={headerId}
      loading={fetching}
      name={name}
      onClear={() => {
        props.onChange({ [property]: undefined });
      }}
      onClick={() => {
        onToggle(property);
      }}
      open={open}
    >
      <FacetItemsList labelledby={headerId}>
        {options.map(({ nameKey, value: optionValue }) => (
          <FacetItem
            active={value === optionValue}
            key={String(optionValue)}
            name={intl.formatMessage({ id: nameKey })}
            onClick={() => {
              props.onChange({
                [property]: value === optionValue ? undefined : optionValue,
              });
            }}
            stat={formatFacetStat(stats[String(optionValue)]) ?? 0}
            value={String(optionValue)}
          />
        ))}
      </FacetItemsList>
    </FacetBox>
  );
}
