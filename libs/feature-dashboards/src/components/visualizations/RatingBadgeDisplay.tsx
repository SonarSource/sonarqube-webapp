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

import { LinkStandalone, RatingBadgeSize } from '@sonarsource/echoes-react';
import type { To } from 'react-router-dom';
import Measure from '~adapters/components/measure/Measure';
import { MetricKey, MetricType } from '~shared/types/metrics';

export interface RatingBadgeDisplayProps {
  badgeSize?: `${RatingBadgeSize}`;
  className?: string;
  componentKey?: string;
  linkTo?: To;
  metricKey: MetricKey;
  value: string;
}

function isNonEmptyLinkTarget(linkTo: To | undefined): linkTo is To {
  if (linkTo === undefined) {
    return false;
  }
  if (typeof linkTo === 'string') {
    return linkTo !== '';
  }
  return true;
}

export function RatingBadgeDisplay({
  badgeSize = RatingBadgeSize.Small,
  className,
  componentKey,
  linkTo,
  metricKey,
  value,
}: Readonly<RatingBadgeDisplayProps>) {
  const badge = (
    <Measure
      badgeSize={badgeSize}
      componentKey={componentKey}
      metricKey={metricKey}
      metricType={MetricType.Rating}
      useProvidedRatingValue
      value={value}
    />
  );

  if (!isNonEmptyLinkTarget(linkTo)) {
    return <span className={className}>{badge}</span>;
  }

  return (
    <LinkStandalone className={className} to={linkTo}>
      {badge}
    </LinkStandalone>
  );
}
