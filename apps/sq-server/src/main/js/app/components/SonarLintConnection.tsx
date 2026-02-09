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
  Button,
  ButtonVariety,
  Heading,
  IconCheck,
  Layout,
  LinkStandalone,
  Text,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { Image } from '~adapters/components/common/Image';
import { Card, CardSeparator } from '~design-system';
import { ClipboardButton } from '~shared/components/clipboard';
import { SonarQubeConnectionIllustration } from '~sq-server-commons/components/branding/SonarQubeConnectionIllustration';
import { whenLoggedIn } from '~sq-server-commons/components/hoc/whenLoggedIn';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import {
  generateSonarLintUserToken,
  portIsValid,
  sendUserToken,
} from '~sq-server-commons/helpers/sonarlint';
import { NewUserToken } from '~sq-server-commons/types/token';
import { LoggedInUser } from '~sq-server-commons/types/users';

enum Status {
  request,
  tokenError,
  tokenCreated,
  tokenSent,
}

interface Props {
  currentUser: LoggedInUser;
}

export function SonarLintConnection({ currentUser }: Readonly<Props>) {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState(Status.request);
  const [newToken, setNewToken] = React.useState<NewUserToken | undefined>(undefined);

  const port = Number.parseInt(searchParams.get('port') ?? '0', 10);
  const ideName =
    searchParams.get('ideName') ??
    intl.formatMessage({ id: 'sonarlint-connection.unspecified-ide' });

  const { login } = currentUser;

  const authorize = React.useCallback(async () => {
    const token = await generateSonarLintUserToken({ ideName, login }).catch(() => undefined);

    if (!token) {
      setStatus(Status.tokenError);

      return;
    }

    setNewToken(token);

    if (!portIsValid(port)) {
      setStatus(Status.tokenCreated);

      return;
    }

    try {
      await sendUserToken(port, token);
      setStatus(Status.tokenSent);
    } catch (_) {
      setStatus(Status.tokenCreated);
    }
  }, [port, ideName, login]);

  return (
    <Layout.ContentGrid>
      <GlobalPageTemplate
        hidePageHeader
        title={intl.formatMessage({ id: 'sonarlint-connection.request.title' })}
      >
        <div className="sw-flex sw-justify-center">
          <Card className="sw-mt-[10vh] sw-w-[700px] sw-text-center">
            {status === Status.request && (
              <>
                <Heading as="h1">
                  <FormattedMessage id="sonarlint-connection.request.title" />
                </Heading>

                <SonarQubeConnectionIllustration className="sw-my-4" connected={false} />

                <p className="sw-my-4">
                  <FormattedMessage
                    id="sonarlint-connection.request.description"
                    values={{ ideName }}
                  />
                </p>

                <p className="sw-mb-10">
                  <FormattedMessage id="sonarlint-connection.request.description2" />
                </p>

                <Button
                  onClick={authorize}
                  prefix={<IconCheck className="sw-mr-1" />}
                  variety={ButtonVariety.Primary}
                >
                  <FormattedMessage id="sonarlint-connection.request.action" />
                </Button>
              </>
            )}

            {status === Status.tokenError && (
              <>
                <Image aria-hidden className="sw-my-4 sw-pt-2" src="/images/cross.svg" />

                <Heading as="h1">
                  <FormattedMessage id="sonarlint-connection.token-error.title" />
                </Heading>

                <p className="sw-my-4">
                  <FormattedMessage id="sonarlint-connection.token-error.description" />
                </p>

                <p className="sw-mb-4">
                  <FormattedMessage
                    id="sonarlint-connection.token-error.description2"
                    values={{
                      link: (
                        <LinkStandalone to="/account/security">
                          <FormattedMessage id="sonarlint-connection.token-error.description2.link" />
                        </LinkStandalone>
                      ),
                    }}
                  />
                </p>
              </>
            )}

            {status === Status.tokenCreated && newToken && (
              <>
                <Image aria-hidden className="sw-my-4 sw-pt-2" src="/images/check.svg" />

                <Heading as="h1">
                  <FormattedMessage id="sonarlint-connection.connection-error.title" />
                </Heading>

                <p className="sw-my-6">
                  <FormattedMessage id="sonarlint-connection.connection-error.description" />
                </p>

                <div className="sw-flex sw-items-center">
                  <Text className="sw-w-abs-150 sw-text-start" isSubtle>
                    <FormattedMessage id="sonarlint-connection.connection-error.token-name" />
                  </Text>

                  {newToken.name}
                </div>

                <CardSeparator className="sw-my-3" />

                <div className="sw-flex sw-items-center">
                  <Text className="sw-min-w-abs-150 sw-text-start" isSubtle>
                    <FormattedMessage id="sonarlint-connection.connection-error.token-value" />
                  </Text>

                  <TextInput
                    ariaLabel={intl.formatMessage({
                      id: 'sonarlint-connection.connection-error.token-value',
                    })}
                    className="sw-cursor-text"
                    isDisabled
                    value={newToken.token}
                    width="full"
                  />

                  <ClipboardButton className="sw-ml-2" copyValue={newToken.token} />
                </div>

                <Text as="div" className="sw-mt-10">
                  <strong>
                    <FormattedMessage id="sonarlint-connection.connection-error.next-steps" />
                  </strong>

                  <ol className="sw-list-inside sw-mb-4">
                    <li>
                      <FormattedMessage id="sonarlint-connection.connection-error.step1" />
                    </li>

                    <li>
                      <FormattedMessage id="sonarlint-connection.connection-error.step2" />
                    </li>
                  </ol>
                </Text>
              </>
            )}

            {status === Status.tokenSent && newToken && (
              <>
                <Heading as="h1">
                  <FormattedMessage id="sonarlint-connection.success.title" />
                </Heading>

                <SonarQubeConnectionIllustration className="sw-my-4" connected />

                <p className="sw-my-4">
                  <FormattedMessage
                    id="sonarlint-connection.success.description"
                    values={{ 0: newToken.name }}
                  />
                </p>

                <div className="sw-mt-10">
                  <strong>
                    <FormattedMessage id="sonarlint-connection.success.last-step" />
                  </strong>
                </div>

                <div className="sw-my-4">
                  <FormattedMessage id="sonarlint-connection.success.step" />
                </div>
              </>
            )}
          </Card>
        </div>
      </GlobalPageTemplate>
    </Layout.ContentGrid>
  );
}

export default whenLoggedIn(SonarLintConnection);
