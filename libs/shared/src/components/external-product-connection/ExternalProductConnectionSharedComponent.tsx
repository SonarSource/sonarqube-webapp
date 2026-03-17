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
  Card,
  Divider,
  FormFieldWidth,
  Heading,
  IconCheck,
  LinkStandalone,
  Text,
  TextInput,
} from '@sonarsource/echoes-react';
import { useCallback, useState, type JSX } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { Image } from '~adapters/components/common/Image';
import { ClipboardButton } from '../clipboard';

export enum ExternalProductKind {
  SQ_CLI = 'cli',
  SQ_IDE = 'ide',
  UNKNOWN = 'unknown',
}

export interface ExternalProductDescription {
  displayName: string;
  productHost?: string;
}

export interface ExternalProduct extends ExternalProductDescription {
  fullName: string;
}

export interface ExternalProductIllustrations {
  illustrationConnected?: () => JSX.Element;
  illustrationNotConnected?: () => JSX.Element;
}

export interface NewTokenInfo {
  name: string;
  token: string;
}

export const DEFAULT_EXTERNAL_PRODUCT_CONFIGS: Record<
  ExternalProductKind,
  ExternalProductDescription
> = {
  [ExternalProductKind.SQ_IDE]: {
    displayName: 'SonarQube for IDE',
    productHost: 'IDE',
  },
  [ExternalProductKind.SQ_CLI]: {
    displayName: 'SonarQube CLI',
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
  currentUser: { login: string };
  generateToken: (productName: string, login: string) => Promise<NewTokenInfo | undefined>;
  illustrations?: Partial<Record<ExternalProductKind, ExternalProductIllustrations>>;
  sendToken: (port: number, token: NewTokenInfo) => Promise<void>;
}

export function ExternalProductConnectionSharedComponent({
  currentUser,
  generateToken,
  illustrations,
  sendToken,
}: Readonly<Props>) {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(Status.request);
  const [newToken, setNewToken] = useState<NewTokenInfo | undefined>(undefined);

  const product = searchParams.get('product');
  const ideName = searchParams.get('ideName');
  const port = Number.parseInt(searchParams.get('port') ?? '0', 10);

  const kind = getProductKind(product, ideName);
  const externalProduct = identifyProduct(product, ideName);
  const { productHost, fullName: productName } = externalProduct;
  const { illustrationConnected, illustrationNotConnected } = illustrations?.[kind] ?? {};

  const authorize = useCallback(async () => {
    const token = await generateToken(productName, currentUser.login);

    if (!token) {
      setStatus(Status.tokenError);
      return;
    }

    setNewToken(token);

    try {
      await sendToken(port, token);
      setStatus(Status.tokenSent);
    } catch (_) {
      setStatus(Status.tokenCreated);
    }
  }, [currentUser.login, generateToken, port, productName, sendToken]);

  return (
    <>
      <Helmet
        defaultTitle={intl.formatMessage({ id: 'external-product-connection.request.title' })}
      />

      <div className="sw-flex sw-justify-center">
        <Card className="sw-mt-[10vh] sw-w-[650px] sw-mx-auto sw-text-center">
          <Card.Body>
            {status === Status.request && (
              <div className="sw-flex sw-flex-col sw-items-center sw-gap-y-6">
                <Heading as="h1">
                  {intl.formatMessage(
                    { id: 'external-product-connection.request.title' },
                    { productName },
                  )}
                </Heading>

                {illustrationNotConnected?.()}

                <p>
                  {intl.formatMessage(
                    { id: 'external-product-connection.request.description' },
                    { productName, productHost },
                  )}
                </p>

                <Button
                  onClick={authorize}
                  prefix={<IconCheck className="sw-mr-1" />}
                  variety={ButtonVariety.Primary}
                >
                  {intl.formatMessage({ id: 'external-product-connection.request.action' })}
                </Button>
              </div>
            )}

            {status === Status.tokenError && (
              <>
                <Image alt="" className="sw-my-4 sw-pt-2" src="/images/cross.svg" />

                <Heading as="h1">
                  {intl.formatMessage({ id: 'external-product-connection.token-error.title' })}
                </Heading>

                <p className="sw-my-4">
                  {intl.formatMessage({
                    id: 'external-product-connection.token-error.description',
                  })}
                </p>

                <p className="sw-mb-4">
                  <FormattedMessage
                    id="external-product-connection.token-error.description2"
                    values={{
                      productHost,
                      link: (
                        <LinkStandalone to="/account/security">
                          {intl.formatMessage({
                            id: 'external-product-connection.token-error.description2.link',
                          })}
                        </LinkStandalone>
                      ),
                    }}
                  />
                </p>
              </>
            )}

            {status === Status.tokenCreated && newToken && (
              <>
                <Image alt="" className="sw-my-4 sw-pt-2" src="/images/check.svg" />

                <Heading as="h1">
                  {intl.formatMessage({
                    id: 'external-product-connection.connection-error.title',
                  })}
                </Heading>

                <Text as="p" className="sw-my-6">
                  {intl.formatMessage({
                    id: 'external-product-connection.connection-error.description',
                  })}
                </Text>

                <Text as="p" className="sw-flex sw-items-center">
                  <Text className="sw-w-abs-150 sw-text-start" isSubtle>
                    {intl.formatMessage({
                      id: 'external-product-connection.connection-error.token-name',
                    })}
                  </Text>

                  {newToken.name}
                </Text>

                <Divider className="sw-my-3" />

                <div className="sw-flex">
                  <Text className="sw-min-w-abs-150 sw-text-start" isSubtle>
                    {intl.formatMessage({
                      id: 'external-product-connection.connection-error.token-value',
                    })}
                  </Text>

                  <TextInput
                    className="sw-cursor-text"
                    id="view-token"
                    isDisabled
                    value={newToken.token}
                    width={FormFieldWidth.Large}
                  />

                  <ClipboardButton className="sw-ml-2" copyValue={newToken.token} />
                </div>

                <Text as="div" className="sw-mt-10">
                  <strong>
                    {intl.formatMessage({
                      id: 'external-product-connection.connection-error.next-steps',
                    })}
                  </strong>

                  <ol className="sw-list-inside sw-mb-4">
                    <li>
                      {intl.formatMessage({
                        id: 'external-product-connection.connection-error.step1',
                      })}
                    </li>

                    <li>
                      {intl.formatMessage(
                        { id: 'external-product-connection.connection-error.step2' },
                        { productHost },
                      )}
                    </li>
                  </ol>
                </Text>
              </>
            )}

            {status === Status.tokenSent && newToken && (
              <div className="sw-flex sw-flex-col sw-items-center sw-gap-y-6">
                <Heading as="h1">
                  {intl.formatMessage({ id: 'external-product-connection.success.title' })}
                </Heading>

                {illustrationConnected?.()}

                <p>
                  {intl.formatMessage(
                    { id: 'external-product-connection.success.description' },
                    { productHost },
                  )}
                </p>

                <div>
                  {intl.formatMessage(
                    { id: 'external-product-connection.success.next' },
                    { productHost },
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export function getProductKind(
  productName: string | null,
  ideName: string | null,
): ExternalProductKind {
  if (productName === 'cli') {
    return ExternalProductKind.SQ_CLI;
  }

  if (ideName !== null) {
    return ExternalProductKind.SQ_IDE;
  }

  return ExternalProductKind.UNKNOWN;
}

export function identifyProduct(
  productName: string | null,
  ideName: string | null,
): ExternalProduct {
  const kind = getProductKind(productName, ideName);
  const config = DEFAULT_EXTERNAL_PRODUCT_CONFIGS[kind];

  if (kind === ExternalProductKind.SQ_IDE && ideName !== null) {
    return { ...config, fullName: `${config.displayName} - ${ideName}` };
  }

  return { ...config, fullName: config.displayName };
}
