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
  Checkbox,
  Heading,
  Link,
  LinkHighlight,
  LinkStandalone,
  MessageCallout,
  MessageVariety,
  ModalAlert,
  Text,
} from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { RescanSettings } from '~shared/components/sca/RescanSettings';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { getAdvancedSecurityTermsOfServiceUrl } from '~sq-server-commons/helpers/urls';
import {
  useGetScaFeatureEnablementQuery,
  useUpdateScaFeatureEnablementMutation,
} from '~sq-server-commons/queries/sca';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { Feature } from '~sq-server-commons/types/features';
import { usePurchasableFeature } from '../../utils';
import { AdditionalCategoryComponentProps } from '../AdditionalCategories';
import Definition from '../Definition';
import ScaConnectivityTest from './ScaConnectivityTest';
import { reloadWindow } from './helpers';

const DISMISSABLE_MESSAGE_STORAGE_KEY = 'sonarqube.sca.show_enabled_message';

export function Sca({
  definitions,
}: Readonly<Pick<AdditionalCategoryComponentProps, 'definitions'>>) {
  const intl = useIntl();

  /**
   * Feature enablement is driven by sonar.sca.featureEnabled
   */
  const scaFeature = usePurchasableFeature(Feature.Sca);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showEnabledMessage, setShowEnabledMessage] = useLocalStorage(
    DISMISSABLE_MESSAGE_STORAGE_KEY,
    false,
  );
  const docUrl = useSharedDocUrl();
  const { data: isScaEnabled = false, isLoading: isLoadingFeatureEnablement } =
    useGetScaFeatureEnablementQuery();
  const { data: isOnByDefaultSetting, isLoading: isLoadingOnByDefault } = useGetValueQuery({
    key: 'sonar.sca.enabled',
  });
  const { mutate: mutateFeatureEnablement, isPending } =
    useUpdateScaFeatureEnablementMutation(reloadWindow);

  const isOnByDefault = isLoadingOnByDefault ? true : isOnByDefaultSetting?.value === 'true';
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

  const isLoading = isLoadingFeatureEnablement || isLoadingOnByDefault || isPending;
  const isChanged = isLoading || isEnabled === isScaEnabled;

  const scaRescanDefinitions = definitions.filter(
    (d) => d.subCategory === 'SCA' && d.key.startsWith('sonar.sca.rescan'),
  );

  /**
   * Other definitions includes:
   * - sonar.sca.enabled -- Whether to run SCA analysis in scans
   */
  const scaOtherDefinitions = definitions.filter(
    (d) =>
      d.subCategory === 'SCA' &&
      d.key !== 'sonar.sca.featureEnabled' &&
      !d.key.startsWith('sonar.sca.rescan'),
  );

  useEffect(() => {
    setIsEnabled(Boolean(isScaEnabled));
  }, [isScaEnabled]);

  if (!scaFeature?.isAvailable) {
    return null;
  }

  return (
    <div>
      <div className="sw-my-8">
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
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
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
          className="sw-mt-6"
          label={<FormattedMessage id="property.sca.admin.checkbox.label" />}
          onCheck={onChangeIsEnabled}
        />
        <div className="sw-flex">
          {!isChanged && (
            <div className="sw-flex sw-mt-6">
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
            </div>
          )}
        </div>
      </div>
      {isEnabled && (
        <div className="sw-ml-12">
          <hr className="sw-mx-0 sw-mb-6 sw-p-0" />
          <Heading as="h3" hasMarginBottom>
            <FormattedMessage id="property.sca.default.title" />
          </Heading>
          <div className="sw-my-6">
            {scaOtherDefinitions.map((definition) => (
              <Definition definition={definition} key={definition.key} />
            ))}
          </div>
        </div>
      )}
      {showEnabledMessage && isEnabled && (
        <MessageCallout
          action={
            <LinkStandalone className="sw-ml-3" to={docUrl(SharedDocLink.AnalyzingDependencies)}>
              <FormattedMessage id="property.sca.admin.enabled.message.link" />
            </LinkStandalone>
          }
          className="sw-max-w-abs-600"
          onDismiss={onDismissSuccessMessage}
          title={
            isOnByDefault
              ? intl.formatMessage({ id: 'property.sca.admin.enabled.message.title' })
              : intl.formatMessage({ id: 'property.sca.admin.disabled.message.title' })
          }
          variety={isOnByDefault ? MessageVariety.Success : MessageVariety.Info}
        >
          <FormattedMessage
            id={
              isOnByDefault
                ? 'property.sca.admin.enabled.message.body'
                : 'property.sca.admin.disabled.message.body'
            }
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
        <RescanSettings>
          <ul>
            {scaRescanDefinitions.map((definition) => (
              <Definition definition={definition} key={definition.key} />
            ))}
          </ul>
        </RescanSettings>
      )}
    </div>
  );
}
