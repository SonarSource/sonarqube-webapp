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

import * as React from 'react';
import { FacetBox, FacetItem } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import { RawQuery } from '~shared/types/router';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { translate } from '~sq-server-commons/helpers/l10n';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';
import { Facet } from '../types';

export interface QualifierFacetProps {
  facet?: Facet;
  maxFacetValue?: number;
  onQueryChange: (change: RawQuery) => void;
  value: ComponentQualifier | undefined;
}

const HEADER_ID = `facet_qualifier`;

const options = [ComponentQualifier.Project, ComponentQualifier.Application];

export default function QualifierFacet(props: QualifierFacetProps) {
  const { facet, maxFacetValue, onQueryChange, value } = props;

  const onItemClick = React.useCallback(
    (itemValue: string) => {
      const active = value === itemValue;

      onQueryChange({
        qualifier: active ? '' : itemValue,
      });
    },
    [onQueryChange, value],
  );

  return (
    <FacetBox id={HEADER_ID} name={translate('projects.facets.qualifier')} open>
      <FacetItemsList labelledby={HEADER_ID}>
        {options.map((option) => {
          const facetValue = facet?.[option];

          const statBarPercent =
            isDefined(facetValue) && isDefined(maxFacetValue) && maxFacetValue > 0
              ? facetValue / maxFacetValue
              : undefined;

          return (
            <FacetItem
              active={value === option}
              disableZero={false}
              key={option}
              name={renderOption(option)}
              onClick={onItemClick}
              stat={formatFacetStat(facet?.[option]) ?? 0}
              statBarPercent={statBarPercent}
              value={option}
            />
          );
        })}
      </FacetItemsList>
    </FacetBox>
  );
}

function renderOption(option: string) {
  return <div className="sw-flex sw-items-center">{translate('qualifier', option)}</div>;
}
