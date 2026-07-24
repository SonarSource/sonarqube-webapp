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

import { IconSeverityHigh, IconSeverityLow, IconSeverityMedium } from '@sonarsource/echoes-react';
import { HotspotRatingEnum, HotspotRatingLabel } from '../types/measures';

interface Props extends React.AriaAttributes {
  className?: string;
  rating?: HotspotRatingLabel;
}

export function HotspotRating({ className, rating = HotspotRatingEnum.LOW, ...rest }: Props) {
  const ratings = {
    [HotspotRatingEnum.HIGH]: HotspotRatingHigh,
    [HotspotRatingEnum.MEDIUM]: HotspotRatingMedium,
    [HotspotRatingEnum.LOW]: HotspotRatingLow,
  };

  const Rating = ratings[rating];

  return <Rating className={className} {...rest} />;
}

function HotspotRatingHigh(props: Props) {
  return (
    <IconSeverityHigh
      {...props}
      color="echoes-severity-badge-colors-foreground-high-icon-default"
    />
  );
}

function HotspotRatingMedium(props: Props) {
  return (
    <IconSeverityMedium
      {...props}
      color="echoes-severity-badge-colors-foreground-medium-icon-default"
    />
  );
}

function HotspotRatingLow(props: Props) {
  return (
    <IconSeverityLow {...props} color="echoes-severity-badge-colors-foreground-low-icon-default" />
  );
}
