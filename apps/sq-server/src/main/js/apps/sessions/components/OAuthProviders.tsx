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

import * as React from 'react';
import { BasicSeparator, ThirdPartyButton } from '~design-system';
import { translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import HelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/HelpTooltip';
import { IdentityProvider } from '~sq-server-commons/types/types';

interface Props {
  identityProviders: IdentityProvider[];
  returnTo: string;
}

export default function OAuthProviders({ identityProviders, returnTo }: Readonly<Props>) {
  const authenticate = React.useCallback(
    (key: string) => {
      // We need a real page refresh, as the login mechanism is handled on the server
      window.location.replace(
        `${getBaseUrl()}/sessions/init/${key}?return_to=${encodeURIComponent(returnTo)}`,
      );
    },
    [returnTo],
  );

  return (
    <>
      <div className="sw-w-full sw-flex sw-flex-col sw-gap-4" id="oauth-providers">
        {identityProviders.map((identityProvider) => (
          <div key={identityProvider.key}>
            <ThirdPartyButton
              className="sw-w-full sw-justify-center"
              iconPath={`${getBaseUrl()}${identityProvider.iconPath}`}
              name={identityProvider.name}
              onClick={() => {
                authenticate(identityProvider.key);
              }}
            >
              <span>{translateWithParameters('login.login_with_x', identityProvider.name)}</span>
            </ThirdPartyButton>
            {identityProvider.helpMessage && (
              <HelpTooltip
                className="oauth-providers-help"
                overlay={identityProvider.helpMessage}
              />
            )}
          </div>
        ))}
      </div>
      <BasicSeparator className="sw-my-6 sw-w-full" />
    </>
  );
}
