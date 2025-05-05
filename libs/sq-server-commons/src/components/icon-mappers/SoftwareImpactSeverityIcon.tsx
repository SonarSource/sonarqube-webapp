/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import {
  IconProps,
  SoftwareImpactSeverityBlockerIcon,
  SoftwareImpactSeverityHighIcon,
  SoftwareImpactSeverityInfoIcon,
  SoftwareImpactSeverityLowIcon,
  SoftwareImpactSeverityMediumIcon,
} from '../../design-system';
import { translate } from '../../helpers/l10n';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import { IssueSeverity } from '../../types/issues';

interface Props extends IconProps {
  disabled?: boolean;
  severity: string | null | undefined;
}

const defaultIconSize = 14;

const severityIcons: Record<string, (props: IconProps) => React.ReactElement> = {
  [SoftwareImpactSeverity.Blocker]: SoftwareImpactSeverityBlockerIcon,
  [SoftwareImpactSeverity.High]: SoftwareImpactSeverityHighIcon,
  [IssueSeverity.Critical]: SoftwareImpactSeverityHighIcon,
  [SoftwareImpactSeverity.Medium]: SoftwareImpactSeverityMediumIcon,
  [IssueSeverity.Major]: SoftwareImpactSeverityMediumIcon,
  [SoftwareImpactSeverity.Low]: SoftwareImpactSeverityLowIcon,
  [IssueSeverity.Minor]: SoftwareImpactSeverityLowIcon,
  [SoftwareImpactSeverity.Info]: SoftwareImpactSeverityInfoIcon,
};

export default function SoftwareImpactSeverityIcon({ severity, ...iconProps }: Readonly<Props>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  if (typeof severity !== 'string' || !severityIcons[severity]) {
    return null;
  }

  const DesiredIcon = severityIcons[severity];
  return (
    <DesiredIcon
      {...iconProps}
      aria-label={translate(isStandardMode ? 'severity' : 'severity_impact', severity)}
      height={iconProps?.height ?? defaultIconSize}
      width={iconProps?.width ?? defaultIconSize}
    />
  );
}
