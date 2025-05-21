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

import {
  Button,
  ButtonVariety,
  Checkbox,
  Heading,
  Link,
  LinkHighlight,
  ModalAlert,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getAdvancedSecurityTermsOfServiceUrl } from '~sq-server-commons/helpers/urls';
import {
  useGetScaFeatureEnablementQuery,
  useUpdateScaFeatureEnablementMutation,
} from '~sq-server-commons/queries/sca';
import { Feature } from '~sq-server-commons/types/features';
import ScaConnectivityTest from './ScaConnectivityTest';

function Sca() {
  const [isEnabled, setIsEnabled] = useState(false);

  const { hasFeature } = useAvailableFeatures();

  const { data: isScaEnabled = false, isLoading: isLoadingFeatureEnablement } =
    useGetScaFeatureEnablementQuery();
  const { mutate: mutateFeatureEnablement, isPending } = useUpdateScaFeatureEnablementMutation();

  const onChangeIsEnabled = () => {
    setIsEnabled((prevIsEnabled) => !prevIsEnabled);
  };
  const onCancel = () => {
    setIsEnabled(isScaEnabled);
  };
  const onSubmit = () => {
    mutateFeatureEnablement(isEnabled);
  };

  const isLoading = isLoadingFeatureEnablement || isPending;
  const isChanged = isLoading || isEnabled === isScaEnabled;

  useEffect(() => {
    setIsEnabled(isScaEnabled);
  }, [isScaEnabled]);

  if (!hasFeature(Feature.ScaAvailable)) {
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
                isEnabled ? (
                  <FormattedMessage
                    id="property.sca.confirm.modal.description.enable"
                    values={{
                      p: (text) => (
                        <Text as="p" className="sw-mt-4">
                          {text}
                        </Text>
                      ),
                      p2: (text) => (
                        <Text as="p" className="sw-mt-4">
                          {text}
                        </Text>
                      ),
                    }}
                  />
                ) : (
                  <FormattedMessage id="property.sca.confirm.modal.description.disable" />
                )
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
      {isScaEnabled && <ScaConnectivityTest />}
    </div>
  );
}

export default Sca;
