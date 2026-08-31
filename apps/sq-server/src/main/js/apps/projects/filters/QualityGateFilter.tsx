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

import { ToggleTip } from '@sonarsource/echoes-react';
import { without } from 'lodash';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { FacetBox, FacetItem, QualityGateIndicator } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { QGStatus } from '~shared/types/common';
import { RawQuery } from '~shared/types/router';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { translate } from '~sq-server-commons/helpers/l10n';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';
import { Facet } from '../types';

export interface Props {
  facet?: Facet;
  maxFacetValue?: number;
  onQueryChange: (change: RawQuery) => void;
  value?: Array<string>;
}

const HEADER_ID = `facet_quality_gate`;

export default function QualityGateFacet(props: Props) {
  const { facet, maxFacetValue, onQueryChange, value } = props;
  const hasWarnStatus = isDefined(facet?.WARN);
  const options = hasWarnStatus ? ['OK', 'WARN', 'ERROR'] : ['OK', 'ERROR'];

  const onItemClick = useCallback(
    (itemValue: string, multiple: boolean) => {
      const active = value?.includes(itemValue);

      if (multiple) {
        onQueryChange({
          gate: (active ? without(value, itemValue) : [...(value ?? []), itemValue]).join(','),
        });
      } else {
        onQueryChange({
          gate: (active && value?.length === 1 ? [] : [itemValue]).join(','),
        });
      }
    },
    [onQueryChange, value],
  );

  return (
    <FacetBox id={HEADER_ID} name={translate('projects.facets.quality_gate')} open>
      <FacetItemsList labelledby={HEADER_ID}>
        {options.map((option) => {
          const facetValue = facet?.[option];

          const statBarPercent =
            isDefined(facetValue) && isDefined(maxFacetValue) && maxFacetValue > 0
              ? facetValue / maxFacetValue
              : undefined;

          return (
            <FacetItem
              active={value?.includes(option)}
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
  return (
    <div className="sw-flex sw-items-center">
      <QualityGateIndicator size="sm" status={option as QGStatus} />
      <span className="sw-ml-1">{translate('metric.level', option)}</span>
      {option === 'WARN' && (
        <ToggleTip
          className="sw-ml-1"
          description={<FormattedMessage id="projects.facets.quality_gate.warning_help" />}
        />
      )}
    </div>
  );
}
