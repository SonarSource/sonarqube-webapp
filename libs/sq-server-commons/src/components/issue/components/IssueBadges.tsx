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

import { Badge, Tooltip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { Issue } from '../../../types/types';

interface IssueBadgesProps {
  issue: Issue;
}

function hasIssueBadges(issue: Issue) {
  return (issue.codeVariants?.length ?? 0) > 0 || Boolean(issue.prioritizedRule);
}

function IssueBadges(props: Readonly<IssueBadgesProps>) {
  const { issue } = props;

  const isPrioritizedRule = Boolean(issue.prioritizedRule);

  if (!hasIssueBadges(issue)) {
    return null;
  }

  return (
    <div className="sw-flex sw-gap-2">
      {isPrioritizedRule && (
        <Tooltip content={<FormattedMessage id="issue.prioritized_rule.description" />}>
          <Badge variety="highlight">
            <FormattedMessage id="prioritized" />
          </Badge>
        </Tooltip>
      )}
      {issue.codeVariants?.map((codeVariant) => (
        <Badge key={codeVariant} variety="neutral">
          {codeVariant}
        </Badge>
      ))}
    </div>
  );
}

export { hasIssueBadges, IssueBadges };
