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

import { Divider, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { getIssueEngineBadgeName } from '../../helpers/issues';
import { IssueProducer } from '../../types/issues';
import { RuleStatus } from '../../types/rules';
import { RuleStatusBadge } from '../coding-rules/RuleStatusBadge';
import { AdvancedSastBadge, hasAdvancedSastTags } from './AdvancedSastBadge';
import { ExternalRuleEngineBadge } from './ExternalRuleEngineBadge';

interface IssuePropertiesIssue {
  externalRuleEngine?: string;
  internalTags?: string[];
  producer?: IssueProducer;
  rule?: string;
}

interface Props {
  issue: IssuePropertiesIssue;
  properties?: ReactNode;
  rule?: { status: RuleStatus; isExternal?: boolean };
  externalRulesRepoNames?: Record<string, string>;
}

export function IssueProperties({
  issue,
  properties,
  rule,
  externalRulesRepoNames = {},
}: Readonly<Props>) {
  const hasAdvancedSast = hasAdvancedSastTags(issue.internalTags);
  const engineBadgeName = getIssueEngineBadgeName(issue);
  const hasExternalRuleEngine = Boolean(engineBadgeName);
  const hasProperties = Boolean(properties);
  const isBeta = !rule?.isExternal && rule?.status === RuleStatus.Beta;

  if (!hasAdvancedSast && !hasExternalRuleEngine && !hasProperties && !isBeta) {
    return null;
  }

  const externalRuleEngineLabel = engineBadgeName
    ? externalRulesRepoNames[engineBadgeName] || engineBadgeName
    : engineBadgeName;

  return (
    <>
      <dt>
        <Text isHighlighted>
          <FormattedMessage id="issue.details.properties" />
        </Text>
      </dt>
      <dd>
        {hasAdvancedSast && <AdvancedSastBadge />}
        {engineBadgeName && (
          <ExternalRuleEngineBadge
            externalRuleEngine={engineBadgeName}
            label={externalRuleEngineLabel}
          />
        )}
        {isBeta && (
          <span className="sw:ml-1">
            <RuleStatusBadge rule={rule} />
          </span>
        )}
        {properties}
      </dd>
      <Divider className="sw:my-1" />
    </>
  );
}
