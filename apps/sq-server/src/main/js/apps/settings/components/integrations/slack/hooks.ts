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

import { useMemo } from 'react';
import { uuidv4 } from '~shared/helpers/crypto';
import { save } from '~shared/helpers/storage';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import { useGetIntegrationConfigurationQuery } from '~sq-server-commons/queries/integrations';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { IntegrationType } from '~sq-server-commons/types/integrations';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { SLACK_OAUTH_STATE_LS_KEY } from '../../../../oauth/utils';

const SLACK_APP_DIRECT_INSTALL_URL =
  'https://slack.com/oauth/v2/authorize?scope=incoming-webhook&client_id=33336676.569200954261';
const SLACK_APP_DIRECT_INSTALL_URL_SCOPE_PARAM = 'scope';
const SLACK_APP_DIRECT_INSTALL_URL_CLIENT_ID_PARAM = 'client_id';
const SLACK_APP_SCOPES = [
  'channels:read',
  'chat:write',
  'chat:write.public',
  'commands',
  'groups:read',
  'im:read',
  'mpim:read',
  'team:read',
];

const SLACK_APP_CREATION_URL = 'https://api.slack.com/apps?new_app=1';
const SLACK_APP_CREATION_URL_MANIFEST_PARAM = 'manifest_json';

export function useSlackAppDirectInstallUrl() {
  const { data: clientId, isLoading: isLoadingClientId } = useGetIntegrationConfigurationQuery(
    IntegrationType.Slack,
    {
      select: (data) => data?.clientId,
    },
  );

  const slackAppDirectInstallUrl = useMemo(() => {
    if (!isStringDefined(clientId)) {
      return undefined;
    }

    const oauthState = uuidv4();
    save(SLACK_OAUTH_STATE_LS_KEY, oauthState); // This will be checked when coming back from Slack OAuth

    const url = new URL(SLACK_APP_DIRECT_INSTALL_URL);
    url.searchParams.set(SLACK_APP_DIRECT_INSTALL_URL_CLIENT_ID_PARAM, clientId);
    url.searchParams.set(SLACK_APP_DIRECT_INSTALL_URL_SCOPE_PARAM, SLACK_APP_SCOPES.join(','));
    url.searchParams.set('state', oauthState);

    return url.href;
  }, [clientId]);

  return useMemo(
    () => ({
      isLoading: isLoadingClientId,
      slackAppDirectInstallUrl,
    }),
    [isLoadingClientId, slackAppDirectInstallUrl],
  );
}

export function useSlackAppManifestUrl() {
  const { data: serverBaseUrl, isLoading: isLoadingServerBaseUrl } = useGetValueQuery(
    {
      key: SettingsKey.ServerBaseUrl,
    },
    {
      select: (data) => data?.value,
    },
  );

  const slackAppManifestUrl = useMemo(() => {
    if (!isDefined(serverBaseUrl)) {
      return undefined;
    }

    const slackAppManifest = JSON.stringify({
      /* eslint-disable camelcase */
      display_information: {
        background_color: '#290042',
        description:
          'Real-time SonarQube Server notifications in Slack - get instant alerts when Quality Gates fail or recover, directly in your team channels.',
        long_description: `*Stay Informed with code quality notifications in Slack*
SonarQube Server is an industry-standard on-premises automated code review and static analysis tool designed to detect coding issues. It empowers teams to deliver integrated code quality and security by providing actionable code intelligence that drives better development.
This integration for Slack seamlessly connects SonarQube Server's power directly to your team's workflows, transforming reactive fire drills into proactive quality control. It easily integrates with DevOps platforms to deliver continuous quality improvements without slowing your team down.

*Key Benefits:*

• *Prevent bad merges:* This integration acts as a safety net for team leads, instantly notifying them in Slack when a project's Quality Gate fails. This crucial visibility allows them to act _as soon as critical issues have been identified_.
• *Reduce developer friction:* Developers receive immediate feedback in the tool they use all day. No more hunting through UIs to find out why a check failed; a single click takes them directly from the Slack alert to the code issue.
• *Improve team collaboration:* Real-time alerts on failures and recoveries keep everyone on the same page about code health, fostering a shared sense of ownership over quality.
• *Simple and powerful:* A quick setup connects your organization, and simple slash commands are used to subscribe specific channels to project notifications.

*Getting started:*

Once the app has been installed, anyone with 'browse' access or higher to a project in Sonar can add Quality Gate notifications to their chosen channel.

Navigate to your desired channel and run the following commands:
\`/sonarqube-server connect\`
\`/invite @SonarQube\`
\`/sonarqube-server subscribe [project_key]\`

To unsubscribe, simply run:
\`/sonarqube-server unsubscribe [project_key]\`

You can find more information <https://docs.sonarsource.com/sonarqube-server/setting-up-connection-to-slack/|here>.`,
        name: 'SonarQube Server',
      },
      features: {
        app_home: {
          messages_tab_enabled: true,
          messages_tab_read_only_enabled: false,
        },
        bot_user: {
          display_name: 'SonarQube Bot',
        },
        slash_commands: [
          {
            command: '/sonarqube-server',
            description: 'Connect and subscribe to SonarQube projects',
            should_escape: false,
            url: `${serverBaseUrl}/api/v2/integrations/slack/slash-commands`,
            usage_hint: '[subscribe <project-key> | help]',
          },
        ],
      },
      oauth_config: {
        redirect_urls: [`${serverBaseUrl}/oauth-callback/slack`],
        scopes: {
          bot: [
            'channels:read',
            'chat:write',
            'chat:write.public',
            'commands',
            'groups:read',
            'im:read',
            'mpim:read',
            'team:read',
          ],
        },
      },
      settings: {
        event_subscriptions: {
          request_url: `${serverBaseUrl}/api/v2/integrations/slack/events`,
          bot_events: ['tokens_revoked'],
        },
        org_deploy_enabled: false,
        socket_mode_enabled: false,
      },
      /* eslint-enable camelcase */
    });

    const slackAppCreationUrl = new URL(SLACK_APP_CREATION_URL);
    slackAppCreationUrl.searchParams.set(SLACK_APP_CREATION_URL_MANIFEST_PARAM, slackAppManifest);

    return slackAppCreationUrl.href;
  }, [serverBaseUrl]);

  return useMemo(
    () => ({
      isLoading: isLoadingServerBaseUrl,
      slackAppManifestUrl,
    }),
    [isLoadingServerBaseUrl, slackAppManifestUrl],
  );
}
