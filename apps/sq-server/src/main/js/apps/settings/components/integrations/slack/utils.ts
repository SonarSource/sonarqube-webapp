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
import { isStringDefined } from '~shared/helpers/types';
import { useGetIntegrationConfigurationQuery } from '~sq-server-commons/queries/integrations';
import { IntegrationType } from '~sq-server-commons/types/integrations';

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

export function useSlackAppDirectInstallUrl() {
  const { data: clientId, isLoading: isLoadingClientId } = useGetIntegrationConfigurationQuery(
    IntegrationType.Slack,
    {
      select: (data) => data?.clientId,
    },
  );

  const slackAppDirectInstallUrl = useMemo(() => {
    if (!isStringDefined(clientId)) {
      return;
    }

    const url = new URL(SLACK_APP_DIRECT_INSTALL_URL);
    url.searchParams.set(SLACK_APP_DIRECT_INSTALL_URL_CLIENT_ID_PARAM, clientId);
    url.searchParams.set(SLACK_APP_DIRECT_INSTALL_URL_SCOPE_PARAM, SLACK_APP_SCOPES.join(','));

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
