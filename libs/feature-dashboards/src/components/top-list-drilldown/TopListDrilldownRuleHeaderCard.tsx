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

import { Button, ButtonVariety, Card, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { getRuleUrl } from '~shared/helpers/urls';

interface Props {
  langName?: string;
  name?: string;
  organization?: string;
  ruleKey: string;
}

export function TopListDrilldownRuleHeaderCard(props: Readonly<Props>) {
  const { langName, name, organization, ruleKey } = props;
  const { formatMessage } = useIntl();
  const title = name ?? ruleKey;
  const subtitle = langName
    ? formatMessage(
        { id: 'portfolio_dashboard.breakdown.top_list.rule_details.subtitle' },
        { language: langName, ruleKey },
      )
    : formatMessage(
        { id: 'portfolio_dashboard.breakdown.top_list.rule_details.subtitle_no_language' },
        { ruleKey },
      );

  return (
    <Card data-testid="top-list-drilldown-rule-header-card">
      <Card.Header
        description={
          <Text as="div" isSubtle size="small">
            {subtitle}
          </Text>
        }
        rightContent={
          organization === undefined ? undefined : (
            <Button to={getRuleUrl(ruleKey, organization)} variety={ButtonVariety.DefaultGhost}>
              {formatMessage({
                id: 'portfolio_dashboard.breakdown.top_list.rule_details.view_rule',
              })}
            </Button>
          )
        }
        title={title}
      />
    </Card>
  );
}
