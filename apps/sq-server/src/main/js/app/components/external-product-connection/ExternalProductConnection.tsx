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
  LinkStandalone,
  Text,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { Image } from '~adapters/components/common/Image';
import { Card, CardSeparator } from '~design-system';
import { ClipboardButton } from '~shared/components/clipboard';
import { SonarQubeCliConnectionIllustration } from '~sq-server-commons/components/branding/SonarQubeCliConnectionIllustration';
import { SonarQubeIdeConnectionIllustration } from '~sq-server-commons/components/branding/SonarQubeIdeConnectionIllustration';
import { whenLoggedIn } from '~sq-server-commons/components/hoc/whenLoggedIn';
import { generateUserToken, sendUserToken } from '~sq-server-commons/helpers/sonarlint';
import { NewUserToken } from '~sq-server-commons/types/token';
import { LoggedInUser } from '~sq-server-commons/types/users';

enum ExternalProductKind {
  SQ_IDE = 'ide',
  SQ_CLI = 'cli',
  UNKNOWN = 'unknown',
}

export interface ExternalProductDescription {
  displayName: string;
  illustration?: ({ connected }: { connected: boolean }) => JSX.Element;
  productHost?: string;
}

export interface ExternalProduct extends ExternalProductDescription {
  fullName: string;
}

export const EXTERNAL_PRODUCT_CONFIGS: Record<ExternalProductKind, ExternalProductDescription> = {
  [ExternalProductKind.SQ_IDE]: {
    displayName: 'SonarQube for IDE',
    illustration: ({ connected }) => <SonarQubeIdeConnectionIllustration connected={connected} />,
    productHost: 'IDE',
  },
  [ExternalProductKind.SQ_CLI]: {
    displayName: 'SonarQube CLI',
    illustration: ({ connected }) => <SonarQubeCliConnectionIllustration connected={connected} />,
    productHost: 'terminal',
  },
  [ExternalProductKind.UNKNOWN]: {
    displayName: 'Unknown origin',
    productHost: 'external product',
  },
};

enum Status {
  request,
  tokenError,
  tokenCreated,
  tokenSent,
}

interface Props {
  currentUser: LoggedInUser;
}

export function ExternalProductConnection({ currentUser }: Readonly<Props>) {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState(Status.request);
  const [newToken, setNewToken] = React.useState<NewUserToken | undefined>(undefined);

  const port = Number.parseInt(searchParams.get('port') ?? '0', 10);
  const externalProduct = identifyProduct(searchParams.get('product'), searchParams.get('ideName'));
  const { productHost, fullName: productName } = externalProduct;

  const { login } = currentUser;

  const authorize = React.useCallback(async () => {
    const token = await generateUserToken({ productName, login }).catch(() => undefined);

    if (!token) {
      setStatus(Status.tokenError);

      return;
    }

    setNewToken(token);

    try {
      await sendUserToken(port, token);
      setStatus(Status.tokenSent);
    } catch (_) {
      setStatus(Status.tokenCreated);
    }
  }, [port, productName, login]);

  return (
    <>
      <Helmet
        defaultTitle={intl.formatMessage({ id: 'external-product-connection.request.title' })}
      />
      <div className="sw-flex sw-justify-center">
        <Card className="sw-mt-[10vh] sw-w-[700px] sw-text-center">
          {status === Status.request && (
            <div className="sw-flex sw-flex-col sw-items-center sw-gap-y-6">
              <Heading as="h1">
                <FormattedMessage
                  id="external-product-connection.request.title"
                  values={{ productName }}
                />
              </Heading>

              {externalProduct.illustration?.({ connected: false })}

              <p className="sw-my-4">
                <FormattedMessage
                  id="external-product-connection.request.description"
                  values={{ productName }}
                />
              </p>

              <Button
                onClick={authorize}
                prefix={<IconCheck className="sw-mr-1" />}
                variety={ButtonVariety.Primary}
              >
                <FormattedMessage id="external-product-connection.request.action" />
              </Button>
            </div>
          )}

          {status === Status.tokenError && (
            <>
              <Image aria-hidden className="sw-my-4 sw-pt-2" src="/images/cross.svg" />

              <Heading as="h1">
                <FormattedMessage id="external-product-connection.token-error.title" />
              </Heading>

              <p className="sw-my-4">
                <FormattedMessage id="external-product-connection.token-error.description" />
              </p>

              <p className="sw-mb-4">
                <FormattedMessage
                  id="external-product-connection.token-error.description2"
                  values={{
                    productHost,
                    link: (
                      <LinkStandalone to="/account/security">
                        <FormattedMessage id="external-product-connection.token-error.description2.link" />
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
                <FormattedMessage id="external-product-connection.connection-error.title" />
              </Heading>

              <p className="sw-my-6">
                <FormattedMessage id="external-product-connection.connection-error.description" />
              </p>

              <div className="sw-flex sw-items-center">
                <Text className="sw-w-abs-150 sw-text-start" isSubtle>
                  <FormattedMessage id="external-product-connection.connection-error.token-name" />
                </Text>

                {newToken.name}
              </div>

              <CardSeparator className="sw-my-3" />

              <div className="sw-flex sw-items-center">
                <Text className="sw-min-w-abs-150 sw-text-start" isSubtle>
                  <FormattedMessage id="external-product-connection.connection-error.token-value" />
                </Text>

                <TextInput
                  ariaLabel={intl.formatMessage({
                    id: 'external-product-connection.connection-error.token-value',
                  })}
                  className="sw-cursor-text"
                  isDisabled
                  value={newToken.token}
                  width="large"
                />

                <ClipboardButton className="sw-ml-2" copyValue={newToken.token} />
              </div>

              <Text as="div" className="sw-mt-10">
                <strong>
                  <FormattedMessage id="external-product-connection.connection-error.next-steps" />
                </strong>

                <ol className="sw-list-inside sw-mb-4">
                  <li>
                    <FormattedMessage id="external-product-connection.connection-error.step1" />
                  </li>

                  <li>
                    <FormattedMessage
                      id="external-product-connection.connection-error.step2"
                      values={{ productHost }}
                    />
                  </li>
                </ol>
              </Text>
            </>
          )}

          {status === Status.tokenSent && newToken && (
            <div className="sw-flex sw-flex-col sw-items-center sw-gap-y-6">
              <Heading as="h1">
                <FormattedMessage id="external-product-connection.success.title" />
              </Heading>

              {externalProduct.illustration?.({ connected: true })}

              <p>
                <FormattedMessage
                  id="external-product-connection.success.description"
                  values={{ productHost }}
                />
              </p>

              <div>
                <FormattedMessage
                  id="external-product-connection.success.next"
                  values={{ productHost }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function identifyProduct(productName: string | null, ideName: string | null): ExternalProduct {
  if (productName === 'cli') {
    const cli = EXTERNAL_PRODUCT_CONFIGS[ExternalProductKind.SQ_CLI];
    return { ...cli, fullName: cli.displayName };
  }
  if (ideName !== null) {
    const ide = EXTERNAL_PRODUCT_CONFIGS[ExternalProductKind.SQ_IDE];
    return { ...ide, fullName: `${ide.displayName} - ${ideName}` };
  }
  const unknown = EXTERNAL_PRODUCT_CONFIGS[ExternalProductKind.UNKNOWN];
  return { ...unknown, fullName: unknown.displayName };
}

export default whenLoggedIn(ExternalProductConnection);
