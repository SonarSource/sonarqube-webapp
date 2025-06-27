/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import styled from '@emotion/styled';
import {
  Button,
  ButtonVariety,
  Checkbox,
  Heading,
  Link,
  LinkHighlight,
  LinkStandalone,
  MessageCallout,
  MessageVariety,
  ModalAlert,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { getAdvancedSecurityTermsOfServiceUrl } from '~sq-server-commons/helpers/urls';
import useLocalStorage from '~sq-server-commons/hooks/useLocalStorage';
import {
  useGetScaFeatureEnablementQuery,
  useUpdateScaFeatureEnablementMutation,
} from '~sq-server-commons/queries/sca';
import { Feature } from '~sq-server-commons/types/features';
import { usePurchasableFeature } from '../../utils';
import { AdditionalCategoryComponentProps } from '../AdditionalCategories';
import Definition from '../Definition';
import ScaConnectivityTest from './ScaConnectivityTest';
import { reloadWindow } from './helpers';

const DISMISSABLE_MESSAGE_STORAGE_KEY = 'sonarqube.sca.show_enabled_message';

function Sca({ definitions }: Readonly<Pick<AdditionalCategoryComponentProps, 'definitions'>>) {
  const intl = useIntl();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showEnabledMessage, setShowEnabledMessage] = useLocalStorage(
    DISMISSABLE_MESSAGE_STORAGE_KEY,
    false,
  );
  const docUrl = useSharedDocUrl();

  const scaFeature = usePurchasableFeature(Feature.Sca);

  const { data: isScaEnabled = false, isLoading: isLoadingFeatureEnablement } =
    useGetScaFeatureEnablementQuery();
  const { mutate: mutateFeatureEnablement, isPending } =
    useUpdateScaFeatureEnablementMutation(reloadWindow);

  const onChangeIsEnabled = () => {
    setIsEnabled((prevIsEnabled) => !prevIsEnabled);
  };
  const onCancel = () => {
    setIsEnabled(Boolean(isScaEnabled));
  };
  const onSubmit = () => {
    if (isEnabled) {
      setShowEnabledMessage(true);
    } else {
      setShowEnabledMessage(false);
    }
    mutateFeatureEnablement(isEnabled);
  };

  const onDismissSuccessMessage = () => {
    setShowEnabledMessage(false);
  };

  const isLoading = isLoadingFeatureEnablement || isPending;
  const isChanged = isLoading || isEnabled === isScaEnabled;
  const scaDefinitions = definitions.filter(
    (d) => d.subCategory === 'SCA' && d.key !== 'sonar.sca.enabled',
  );

  useEffect(() => {
    setIsEnabled(Boolean(isScaEnabled));
  }, [isScaEnabled]);

  if (!scaFeature?.isAvailable) {
    return null;
  }

  return (
    <div>
      <Heading as="h1" hasMarginBottom>
        <FormattedMessage id="settings.advanced_security.title" />
      </Heading>
      <Text as="p" className="sw-mb-6" size={TextSize.Large}>
        <FormattedMessage id="settings.advanced_security.description" />
      </Text>
      <Heading as="h3" hasMarginBottom>
        <FormattedMessage id="property.sca.admin.title" />
      </Heading>
      <Text as="p">
        <FormattedMessage id="property.sca.admin.description" />
      </Text>
      <p className="sw-mt-4">
        <FormattedMessage
          id="property.sca.admin.description2"
          values={{
            link: (text) => (
              <Link
                highlight={LinkHighlight.CurrentColor}
                shouldOpenInNewTab
                to={getAdvancedSecurityTermsOfServiceUrl()}
              >
                {text}
              </Link>
            ),
          }}
        />
      </p>
      <Checkbox
        checked={isEnabled}
        className="sw-my-6"
        label={<FormattedMessage id="property.sca.admin.checkbox.label" />}
        onCheck={onChangeIsEnabled}
      />
      <div className="sw-flex">
        {!isChanged && (
          <>
            <ModalAlert
              description={
                isEnabled
                  ? intl.formatMessage({ id: 'property.sca.confirm.modal.description.enable' })
                  : intl.formatMessage({ id: 'property.sca.confirm.modal.description.disable' })
              }
              primaryButton={
                <Button onClick={onSubmit} variety={ButtonVariety.Primary}>
                  {<FormattedMessage id="confirm" />}
                </Button>
              }
              secondaryButtonLabel={<FormattedMessage id="cancel" />}
              title={
                <FormattedMessage
                  id={
                    isEnabled
                      ? 'property.sca.confirm.modal.title.enable'
                      : 'property.sca.confirm.modal.title.disable'
                  }
                />
              }
            >
              <Button isLoading={isLoading} variety={ButtonVariety.Primary}>
                <FormattedMessage id="save" />
              </Button>
            </ModalAlert>
            <Button className="sw-ml-3" onClick={onCancel} variety={ButtonVariety.Default}>
              <FormattedMessage id="cancel" />
            </Button>
            <ModalAlert
              description={<FormattedMessage id="property.sca.cancel.modal.description" />}
              primaryButton={
                <Button onClick={onCancel} variety={ButtonVariety.Primary}>
                  <FormattedMessage id="confirm" />
                </Button>
              }
              secondaryButtonLabel={
                <FormattedMessage id="property.sca.cancel.modal.continue_editing" />
              }
              title={<FormattedMessage id="property.sca.cancel.modal.title" />}
            />
          </>
        )}
      </div>
      {showEnabledMessage && (
        <MessageCallout
          action={
            <LinkStandalone className="sw-ml-3" to={docUrl(SharedDocLink.AnalyzingDependencies)}>
              <FormattedMessage id="property.sca.admin.enabled.message.link" />
            </LinkStandalone>
          }
          className="sw-my-8 sw-max-w-abs-600"
          onDismiss={onDismissSuccessMessage}
          title={intl.formatMessage({ id: 'property.sca.admin.enabled.message.title' })}
          variety={MessageVariety.Success}
        >
          <FormattedMessage
            id="property.sca.admin.enabled.message.body"
            values={{
              link: (text) => (
                <LinkStandalone to={docUrl(SharedDocLink.AnalyzingDependencies)}>
                  {text}
                </LinkStandalone>
              ),
            }}
          />
        </MessageCallout>
      )}
      {isScaEnabled && <ScaConnectivityTest />}
      {isScaEnabled && (
        <>
          <Heading as="h3" hasMarginBottom>
            <FormattedMessage id="property.sca.admin.rescan.title" />
          </Heading>
          <Text as="p">
            <FormattedMessage id="property.sca.admin.rescan.description" />
          </Text>

          <ul>
            {scaDefinitions.map((definition) => (
              <StyledListItem
                className="sw-p-6"
                data-scroll-key={definition.key}
                key={definition.key}
              >
                <Definition definition={definition} />
              </StyledListItem>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * reimplemented from DefinitionsList.tsx
 */
const StyledListItem = styled.li`
  & + & {
    border-top: var(--echoes-border-width-default) solid var(--echoes-color-border-weak);
  }
`;

export default Sca;
