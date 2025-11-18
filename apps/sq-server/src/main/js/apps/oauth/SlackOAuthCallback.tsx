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

import {
  Badge,
  BadgeVariety,
  Button,
  ButtonVariety,
  Divider,
  Heading,
  Link,
  LogoSize,
  LogoSonarQubeServer,
  Spinner,
  Text,
  TextSize,
  toast,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { useCurrentUser } from '~adapters/helpers/users';
import { uuidv4 } from '~shared/helpers/crypto';
import { get, remove, save } from '~shared/helpers/storage';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import useEffectOnce from '~shared/helpers/useEffectOnce';
import { whenLoggedIn } from '~sq-server-commons/components/hoc/whenLoggedIn';
import { usePostUserBindingMutation } from '~sq-server-commons/queries/integrations';
import { UserBindingType } from '~sq-server-commons/types/integrations';

export const SLACK_OAUTH_STATE_LS_KEY = 'sonarqube-cloud.slack-binding.oauth-state';
const SLACK_REDIRECT_URL_HOST = 'slack.com';
const SLACK_REDIRECT_URL_PROTOCOL = 'https';

function SlackOAuthCallback() {
  const { currentUser, isLoggedIn } = useCurrentUser();
  const getDocUrl = useSharedDocUrl();

  const [isOAuthValid, setIsOAuthValid] = useState(true);

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');

  const {
    isPending: isBindingInProgress,
    isSuccess: isBindingSuccessful,
    isIdle: isPreparingBinding,
    mutate: createSlackBinding,
  } = usePostUserBindingMutation();

  useEffectOnce(() => {
    // Handle redirection from Slack app (user ran the /login command)
    // We create a `state` value, save it to the local storage, and redirect the user to the Slack OAuth page
    if (!isStringDefined(redirectUri) || code !== null || state !== null) {
      return;
    }

    const stateToSave = uuidv4();
    save(SLACK_OAUTH_STATE_LS_KEY, stateToSave);

    const redirectUrl = new URL(redirectUri);
    // Make sure the user is redirected to Slack (prevents redirect to malicious URLs in case of forged redirect_uri)
    redirectUrl.host = SLACK_REDIRECT_URL_HOST;
    redirectUrl.protocol = SLACK_REDIRECT_URL_PROTOCOL;
    redirectUrl.searchParams.set('state', stateToSave);

    globalThis.location.href = redirectUrl.href;
  });

  useEffectOnce(() => {
    // Handle redirection from Slack OAuth
    // User comes back from Slack OAuth we redirected them to
    // We should compare the `state` value with the one we saved in the local storage
    // If they match, we can proceed with the user binding
    if (!isStringDefined(code) || !isStringDefined(state) || !isLoggedIn) {
      setIsOAuthValid(false);
      return;
    }

    const stateFromLS = get(SLACK_OAUTH_STATE_LS_KEY);
    remove(SLACK_OAUTH_STATE_LS_KEY);

    if (stateFromLS !== state) {
      setIsOAuthValid(false);
      return;
    }

    createSlackBinding(
      {
        bindingData: { code },
        type: UserBindingType.Slack,
        userId: currentUser.id,
      },
      {
        onError: () => {
          toast.error({
            description: <FormattedMessage id="oauth.slack_binding.error.toast.description" />,
            isDismissable: true,
            title: <FormattedMessage id="oauth.slack_binding.error.toast.title" />,
          });
        },
        onSuccess: () => {
          toast.success({
            description: <FormattedMessage id="oauth.slack_binding.success.toast.description" />,
            isDismissable: true,
            title: <FormattedMessage id="oauth.slack_binding.success.toast.title" />,
          });
        },
      },
    );
  });

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Spinner
      isLoading={
        isDefined(redirectUri) || (isOAuthValid && (isPreparingBinding || isBindingInProgress))
      }
    >
      <div className="sw-mt-24">
        <div className="sw-flex sw-flex-col sw-items-center sw-justify-center">
          <LogoSonarQubeServer className="sw-mb-3" size={LogoSize.Large} />
          {isBindingSuccessful && isOAuthValid ? (
            <>
              <Heading as="h1" className="sw-mb-8">
                <FormattedMessage id="oauth.slack_binding.success.title" />
              </Heading>

              <ol className="sw-flex sw-flex-col sw-items-center sw-justify-center sw-gap-2 sw-list-decimal">
                <GetStartedListItem labelId="oauth.slack_binding.success.get_started.1" />
                <GetStartedListItem labelId="oauth.slack_binding.success.get_started.2" />
                <GetStartedListItem labelId="oauth.slack_binding.success.get_started.3" />
              </ol>

              <Divider className="sw-my-8 sw-w-1/2" />

              <Text className="sw-mb-4">
                <FormattedMessage
                  id="oauth.slack_binding.success.documentation"
                  values={{
                    docLink: (
                      <Link to={getDocUrl(SharedDocLink.SlackSubscriptionSetup)}>
                        <FormattedMessage id="oauth.slack_binding.success.documentation.link_label" />
                      </Link>
                    ),
                  }}
                />
              </Text>
              <Text className="fs-mask" isSubtle size={TextSize.Small}>
                <FormattedMessage
                  id="oauth.slack_binding.success.name"
                  values={{
                    name: currentUser.name,
                  }}
                />
              </Text>
            </>
          ) : (
            <>
              <Heading as="h1" hasMarginBottom>
                <FormattedMessage id="oauth.slack_binding.error.title" />
              </Heading>
              <Text size={TextSize.Small}>
                <FormattedMessage id="oauth.slack_binding.error.description" />
              </Text>
              <Button
                className="sw-mt-4"
                to={getDocUrl(SharedDocLink.SlackIntegration)}
                variety={ButtonVariety.Default}
              >
                <FormattedMessage id="oauth.slack_binding.documentation_link" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Spinner>
  );
}

function GetStartedListItem({ labelId }: Readonly<{ labelId: string }>) {
  return (
    <Text as="li">
      <FormattedMessage
        id={labelId}
        values={{
          b: (text) => <b>{text}</b>,
          cmd: (command) => (
            <Badge variety={BadgeVariety.Neutral}>
              <Text className="sw-font-mono">{command}</Text>
            </Badge>
          ),
        }}
      />
    </Text>
  );
}

export default whenLoggedIn(SlackOAuthCallback);
