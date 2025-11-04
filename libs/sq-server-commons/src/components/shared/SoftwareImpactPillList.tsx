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
import React, { useMemo } from 'react';
import {
  SoftwareImpactSeverity,
  SoftwareQuality,
  SoftwareQualityImpact,
} from '~shared/types/clean-code-taxonomy';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import { IssueSeverity } from '../../types/issues';
import IssueTypePill from './IssueTypePill';
import SoftwareImpactPill from './SoftwareImpactPill';

interface SoftwareImpactPillListProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  issueSeverity?: IssueSeverity;
  issueType?: string;
  onSetSeverity?: ((severity: IssueSeverity) => Promise<void>) &
    ((severity: SoftwareImpactSeverity, quality: SoftwareQuality) => Promise<void>);
  softwareImpacts?: SoftwareQualityImpact[];
  tooltipMessageId?: string;
  type?: Parameters<typeof SoftwareImpactPill>[0]['type'];
}

const sqOrderMap = {
  [SoftwareQuality.Security]: 3,
  [SoftwareQuality.Reliability]: 2,
  [SoftwareQuality.Maintainability]: 1,
};

export default function SoftwareImpactPillList({
  softwareImpacts,
  onSetSeverity,
  issueSeverity,
  issueType,
  tooltipMessageId,
  type,
  className,
  ...props
}: Readonly<SoftwareImpactPillListProps>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const sortedSoftwareImpacts = useMemo(
    () =>
      softwareImpacts
        ?.slice()
        .sort((a, b) => sqOrderMap[b.softwareQuality] - sqOrderMap[a.softwareQuality]),
    [softwareImpacts],
  );

  return (
    <ul className={classNames('sw-flex sw-gap-2', className)} {...props}>
      {!isStandardMode &&
        sortedSoftwareImpacts?.map(({ severity, softwareQuality }) => (
          <li key={softwareQuality}>
            <SoftwareImpactPill
              onSetSeverity={onSetSeverity}
              severity={severity}
              softwareQuality={softwareQuality}
              tooltipMessageId={tooltipMessageId}
              type={type}
            />
          </li>
        ))}
      {!isStandardMode &&
        (softwareImpacts?.length ?? 0) === 0 &&
        issueType === 'SECURITY_HOTSPOT' && (
          <IssueTypePill issueType={issueType} severity={issueSeverity ?? IssueSeverity.Info} />
        )}
      {isStandardMode && issueType && issueSeverity && (
        <IssueTypePill
          issueType={issueType}
          onSetSeverity={onSetSeverity}
          severity={issueSeverity}
          tooltipMessageId={tooltipMessageId}
        />
      )}
    </ul>
  );
}
