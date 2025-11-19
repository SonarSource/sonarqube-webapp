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

import { Heading, HeadingSize, Link, LinkHighlight, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { isDefined } from '~shared/helpers/types';
import { useGetIntegrationConfigurationQuery } from '~sq-server-commons/queries/integrations';
import { IntegrationType } from '~sq-server-commons/types/integrations';
import { SlackIntegrationConfigured } from './SlackIntegrationConfigured';
import { SlackIntegrationNotConfigured } from './SlackIntegrationNotConfigured';
import { SlackIntegrationStatusBadgge } from './SlackIntegrationStatusBadge';

export function SlackIntegrationConfiguration() {
  const docUrl = useSharedDocUrl();

  const { data: slackConfiguration } = useGetIntegrationConfigurationQuery(IntegrationType.Slack);
  const isBound = isDefined(slackConfiguration);

  return (
    <div className="sw-flex sw-flex-col sw-gap-4">
      <div className="sw-flex sw-items-center sw-gap-2">
        <Heading as="h2" size={HeadingSize.Large}>
          <FormattedMessage id="settings.slack.header" />
        </Heading>
        <SlackIntegrationStatusBadgge isBound={isBound} />
      </div>

      <Text as="p">
        <FormattedMessage
          id="settings.slack.description"
          values={{
            link: (text) => (
              <Link
                enableOpenInNewTab
                highlight={LinkHighlight.Default}
                to={docUrl(SharedDocLink.SlackIntegration)}
              >
                {text}
              </Link>
            ),
          }}
        />
      </Text>

      {isBound ? (
        <SlackIntegrationConfigured className="sw-mt-4" slackConfiguration={slackConfiguration} />
      ) : (
        <SlackIntegrationNotConfigured />
      )}
    </div>
  );
}
