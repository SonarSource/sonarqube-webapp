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

import {
  RatingBadge,
  RatingBadgeRating,
  RatingBadgeSize,
  Spinner,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { MetricType } from '~shared/types/metrics';
import { RawQuery } from '~shared/types/router';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { Facet } from '../types';
import RangeFacetBase from './RangeFacetBase';

interface Props {
  facet?: Facet;
  maxFacetValue?: number;
  name: string;
  onQueryChange: (change: RawQuery) => void;
  property: string;
  value?: any;
}

export default function RatingFacet(props: Readonly<Props>) {
  const { facet, maxFacetValue, name, property, value } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const renderAccessibleLabel = React.useCallback(
    (option: number) => {
      if (option === 1) {
        return translateWithParameters(
          'projects.facets.rating_label_single_x',
          translate('metric_domain', name),
          formatMeasure(option, MetricType.Rating),
        );
      }

      return translateWithParameters(
        'projects.facets.rating_label_multi_x',
        translate('metric_domain', name),
        formatMeasure(option, MetricType.Rating),
      );
    },
    [name],
  );

  return (
    <RangeFacetBase
      description={
        hasDescription(property, isStandardMode)
          ? translate(`projects.facets.${property.replace('new_', '')}.description`)
          : undefined
      }
      facet={facet}
      header={translate('metric_domain', name)}
      highlightUnder={1}
      maxFacetValue={maxFacetValue}
      onQueryChange={props.onQueryChange}
      options={[1, 2, 3, 4, 5]}
      property={property}
      renderAccessibleLabel={renderAccessibleLabel}
      renderOption={(option) => renderOption(option, property)}
      value={value}
    />
  );
}

const hasDescription = (property: string, isStandardMode = false) => {
  return [
    'maintainability',
    'new_maintainability',
    'security_review',
    ...(isStandardMode ? ['security', 'new_security', 'reliability', 'new_reliability'] : []),
  ].includes(property);
};

function renderOption(option: string | number, property: string) {
  return <RatingOption option={option} property={property} />;
}

function RatingOption({
  option,
  property,
}: Readonly<{ option: string | number; property: string }>) {
  const { data: isStandardMode, isLoading } = useStandardExperienceModeQuery();
  const intl = useIntl();

  const ratingFormatted = formatMeasure(option, MetricType.Rating);
  const propertyWithoutPrefix = property.replace('new_', '');
  const isSecurityOrReliability = ['security', 'reliability'].includes(propertyWithoutPrefix);

  return (
    <Spinner isLoading={isLoading}>
      <RatingBadge
        rating={ratingFormatted as RatingBadgeRating}
        size={RatingBadgeSize.ExtraSmall}
      />

      <span className="sw-ml-2">
        {intl.formatMessage({
          id: `projects.facets.rating_option.${propertyWithoutPrefix}${isStandardMode && isSecurityOrReliability ? '.legacy' : ''}.${option}`,
        })}
      </span>
    </Spinner>
  );
}
