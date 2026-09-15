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

import classNames from 'classnames';
import { useMemo } from 'react';
import { SoftwareQuality, SoftwareQualityImpact } from '../../types/clean-code-taxonomy';
import SoftwareImpactPill, { Props as SoftwareImpactPillProps } from './SoftwareImpactPill';

interface SoftwareImpactPillListProps {
  className?: string;
  'data-guiding-id'?: string;
  'data-spotlight-id'?: string;
  learnMoreUrl?: string;
  onSetSeverity?: SoftwareImpactPillProps['onSetSeverity'];
  softwareImpacts?: SoftwareQualityImpact[];
  tooltipMessageId?: string;
  type?: SoftwareImpactPillProps['type'];
}

const sqOrderMap = {
  [SoftwareQuality.Security]: 3,
  [SoftwareQuality.Reliability]: 2,
  [SoftwareQuality.Maintainability]: 1,
};

export function SoftwareImpactPillList({
  className,
  'data-guiding-id': dataGuidingId,
  'data-spotlight-id': dataSpotlightId,
  learnMoreUrl,
  onSetSeverity,
  softwareImpacts,
  tooltipMessageId,
  type,
}: Readonly<SoftwareImpactPillListProps>) {
  const sortedSoftwareImpacts = useMemo(
    () =>
      softwareImpacts
        ?.slice()
        .sort((a, b) => sqOrderMap[b.softwareQuality] - sqOrderMap[a.softwareQuality]),
    [softwareImpacts],
  );

  if (!sortedSoftwareImpacts?.length) {
    return null;
  }

  return (
    <ul
      className={classNames('sw-flex sw-gap-2', className)}
      data-guiding-id={dataGuidingId}
      data-spotlight-id={dataSpotlightId}
    >
      {sortedSoftwareImpacts.map(({ severity, softwareQuality }) => {
        return (
          <li key={softwareQuality}>
            <SoftwareImpactPill
              learnMoreUrl={learnMoreUrl}
              onSetSeverity={onSetSeverity}
              quality={softwareQuality}
              severity={severity}
              tooltipMessageId={tooltipMessageId}
              type={type}
            />
          </li>
        );
      })}
    </ul>
  );
}
