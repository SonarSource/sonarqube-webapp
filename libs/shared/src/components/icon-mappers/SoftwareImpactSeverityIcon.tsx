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

import {
  IconInfo,
  IconProps,
  IconSeverityBlocker,
  IconSeverityHigh,
  IconSeverityLow,
  IconSeverityMedium,
} from '@sonarsource/echoes-react';
import { DesignTokensColorsIcons } from '@sonarsource/echoes-react/dist/types/design-tokens';
import { useIntl } from 'react-intl';
import { SoftwareImpactSeverity } from '../../types/clean-code-taxonomy';
import { IssueSeverity } from '../../types/issues';

interface Props extends IconProps {
  disabled?: boolean;
  severity: string | null | undefined;
}

const severityIcons: Record<
  string,
  {
    Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<HTMLSpanElement>>;
    color: DesignTokensColorsIcons;
  }
> = {
  [SoftwareImpactSeverity.Blocker]: {
    Icon: IconSeverityBlocker,
    color: 'echoes-severity-badge-colors-foreground-blocker-icon-default',
  },
  [SoftwareImpactSeverity.High]: {
    Icon: IconSeverityHigh,
    color: 'echoes-severity-badge-colors-foreground-high-icon-default',
  },
  [IssueSeverity.Critical]: {
    Icon: IconSeverityHigh,
    color: 'echoes-severity-badge-colors-foreground-high-icon-default',
  },
  [SoftwareImpactSeverity.Medium]: {
    Icon: IconSeverityMedium,
    color: 'echoes-severity-badge-colors-foreground-medium-icon-default',
  },
  [IssueSeverity.Major]: {
    Icon: IconSeverityMedium,
    color: 'echoes-severity-badge-colors-foreground-medium-icon-default',
  },
  [SoftwareImpactSeverity.Low]: {
    Icon: IconSeverityLow,
    color: 'echoes-severity-badge-colors-foreground-low-icon-default',
  },
  [IssueSeverity.Minor]: {
    Icon: IconSeverityLow,
    color: 'echoes-severity-badge-colors-foreground-low-icon-default',
  },
  [SoftwareImpactSeverity.Info]: {
    Icon: IconInfo,
    color: 'echoes-severity-badge-colors-foreground-info-icon-default',
  },
};

export default function SoftwareImpactSeverityIcon({
  disabled,
  severity,
  ...iconProps
}: Readonly<Props>) {
  const intl = useIntl();

  if (typeof severity !== 'string' || !severityIcons[severity]) {
    return null;
  }

  const { Icon, color } = severityIcons[severity];
  return (
    <Icon
      {...iconProps}
      aria-label={intl.formatMessage(
        { id: 'severity.icon.label' },
        { severity: intl.formatMessage({ id: `severity.${severity}` }) },
      )}
      color={disabled ? 'echoes-color-icon-disabled' : color}
    />
  );
}
