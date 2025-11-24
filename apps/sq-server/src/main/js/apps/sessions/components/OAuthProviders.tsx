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

import { Divider, Text, TextSize, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ThirdPartyButton } from '~design-system';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { IdentityProvider } from '~sq-server-commons/types/types';

interface Props {
  identityProviders: IdentityProvider[];
  returnTo: string;
}

export default function OAuthProviders({ identityProviders, returnTo }: Readonly<Props>) {
  const authenticate = (key: string) => {
    // We need a real page refresh, as the login mechanism is handled on the server
    window.location.replace(
      `${getBaseUrl()}/sessions/init/${key}?return_to=${encodeURIComponent(returnTo)}`,
    );
  };

  return (
    <>
      <div className="sw-w-full sw-flex sw-flex-col sw-gap-4" id="oauth-providers">
        {identityProviders.map(({ key, name, iconPath, helpMessage }) => (
          <div key={key}>
            <ThirdPartyButton
              className="sw-w-full sw-justify-center"
              iconPath={`${getBaseUrl()}${iconPath}`}
              name={name}
              onClick={() => {
                authenticate(key);
              }}
            >
              <span>
                <FormattedMessage id="login.login_with_x" values={{ providerName: name }} />
              </span>
            </ThirdPartyButton>
            {helpMessage && (
              <ToggleTip className="oauth-providers-help" description={helpMessage} />
            )}
          </div>
        ))}
      </div>
      <Divider
        className="sw-my-8 sw-w-full"
        text={
          <Text className="sw-mx-4" size={TextSize.Small}>
            <FormattedMessage id="login.or" />
          </Text>
        }
      />
    </>
  );
}
