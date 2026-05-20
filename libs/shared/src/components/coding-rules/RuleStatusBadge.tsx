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

import { Badge, BadgeVariety, Tooltip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { RuleStatus } from '../../types/rules';

const RuleStatusDescriptions: Record<RuleStatus, string> = {
  [RuleStatus.Beta]: 'rules.status.BETA.help',
  [RuleStatus.Deprecated]: 'rules.status.DEPRECATED.help',
  [RuleStatus.Removed]: 'rules.status.REMOVED.help',
  [RuleStatus.Ready]: 'status',
};

const RuleStatusLabels: Record<RuleStatus, string> = {
  [RuleStatus.Beta]: 'rules.status.BETA',
  [RuleStatus.Deprecated]: 'rules.status.DEPRECATED',
  [RuleStatus.Removed]: 'rules.status.REMOVED',
  [RuleStatus.Ready]: 'rules.status.READY',
};

const RuleStatusVarieties: Partial<Record<RuleStatus, BadgeVariety>> = {
  [RuleStatus.Beta]: BadgeVariety.Info,
  [RuleStatus.Deprecated]: BadgeVariety.Danger,
  [RuleStatus.Removed]: BadgeVariety.Danger,
};

interface RuleStatusBadgeProps {
  rule: {
    status: string;
  };
}

export function RuleStatusBadge({ rule }: Readonly<RuleStatusBadgeProps>) {
  const description = RuleStatusDescriptions[rule.status as RuleStatus] || 'status';
  const label = RuleStatusLabels[rule.status as RuleStatus];
  const variety = RuleStatusVarieties[rule.status as RuleStatus];

  if (!label || !variety) {
    return null;
  }

  return (
    <Tooltip content={<FormattedMessage id={description} />}>
      <Badge variety={variety}>
        <FormattedMessage id={label} />
      </Badge>
    </Tooltip>
  );
}
