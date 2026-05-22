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

import { Link, LinkHighlight, Popover, ToggleTip, Tooltip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Path } from 'react-router-dom';
import { isScaMeasure } from '../../helpers/sca';

type Props = Readonly<{
  advancedSecurityDocsUrl: string;
  advancedSecuritySettingsUrl: Partial<Path>;
  isScaAvailable?: boolean;
  isScaEnabled?: boolean;
  metricKey: string;
  upgradeIcon: React.ReactNode;
}>;

export function ConditionScaSuffix({
  metricKey,
  isScaEnabled,
  isScaAvailable,
  advancedSecuritySettingsUrl,
  advancedSecurityDocsUrl,
  upgradeIcon,
}: Props) {
  const { formatMessage } = useIntl();

  if (!isScaMeasure(metricKey)) {
    return null;
  }

  if (!isScaAvailable) {
    return (
      <Popover
        description={
          <FormattedMessage
            id="quality_gates.upgrade_badge.tooltip"
            values={{
              a: (content) => (
                <Link
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={advancedSecurityDocsUrl}
                >
                  {content}
                </Link>
              ),
            }}
          />
        }
      >
        <Tooltip content={formatMessage({ id: 'toggle_tip.aria_label.sca_condition' })}>
          <span
            aria-label={formatMessage({ id: 'quality_gates.upgrade_badge.tooltip.aria' })}
            className="hover:sw-cursor-pointer"
            role="img"
          >
            {upgradeIcon}
          </span>
        </Tooltip>
      </Popover>
    );
  }

  if (!isScaEnabled) {
    return (
      <ToggleTip
        ariaLabel={formatMessage({ id: 'toggle_tip.aria_label.sca_condition' })}
        description={
          <FormattedMessage
            id="quality_gates.conditions.enable_sca_hint"
            values={{
              a: (content) => (
                <Link highlight={LinkHighlight.CurrentColor} to={advancedSecuritySettingsUrl}>
                  {content}
                </Link>
              ),
            }}
          />
        }
      />
    );
  }

  return null;
}
