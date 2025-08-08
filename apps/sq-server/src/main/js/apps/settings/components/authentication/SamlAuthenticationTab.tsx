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

import { Button } from '@sonarsource/echoes-react';
import React, { FormEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Spinner } from '~design-system';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import ConfirmModal from '~sq-server-commons/components/controls/ConfirmModal';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useIdentityProviderQuery } from '~sq-server-commons/queries/identity-provider/common';
import { useToggleScimMutation } from '~sq-server-commons/queries/identity-provider/scim';
import { useSaveValueMutation } from '~sq-server-commons/queries/settings';
import { ProvisioningType } from '~sq-server-commons/types/provisioning';
import { ExtendedSettingDefinition } from '~sq-server-commons/types/settings';
import { Provider } from '~sq-server-commons/types/types';
import ConfigurationDetails from './ConfigurationDetails';
import ConfigurationForm from './ConfigurationForm';
import ProvisioningSection from './ProvisioningSection';
import TabHeader from './TabHeader';
import useSamlConfiguration, {
  SAML_ENABLED_FIELD,
  SAML_SCIM_DEPRECATED,
} from './hook/useSamlConfiguration';

interface SamlAuthenticationProps {
  definitions: ExtendedSettingDefinition[];
}

export const SAML = 'saml';

const CONFIG_TEST_PATH = '/saml/validation_init';
const SAML_EXCLUDED_FIELD = [SAML_ENABLED_FIELD, SAML_SCIM_DEPRECATED];

export default function SamlAuthenticationTab(props: SamlAuthenticationProps) {
  const { definitions } = props;
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showConfirmProvisioningModal, setShowConfirmProvisioningModal] = React.useState(false);
  const {
    hasScim,
    scimStatus,
    isLoading,
    samlEnabled,
    name,
    groupValue,
    url,
    hasConfiguration,
    values,
    setNewValue,
    canBeSave,
    hasScimTypeChange,
    hasScimConfigChange,
    newScimStatus,
    setNewScimStatus,
    setNewGroupSetting,
    deleteMutation: { isPending: isDeleting, mutate: deleteConfiguration },
  } = useSamlConfiguration(definitions);
  const toggleScim = useToggleScimMutation();

  const { data } = useIdentityProviderQuery();
  const { mutate: saveSetting } = useSaveValueMutation();

  const hasDifferentProvider = data?.provider !== undefined && data.provider !== Provider.Scim;

  const handleCreateConfiguration = () => {
    setShowEditModal(true);
  };

  const handleCancelConfiguration = () => {
    setShowEditModal(false);
  };

  const handleToggleEnable = () => {
    const value = values[SAML_ENABLED_FIELD];
    saveSetting({
      definition: value.definition,
      newValue: !samlEnabled,
      settingCurrentValue: value.currentValue,
    });
  };

  const handleSaveGroup = () => {
    if (groupValue.newValue !== undefined) {
      saveSetting({
        definition: groupValue.definition,
        newValue: groupValue.newValue,
        settingCurrentValue: groupValue.currentValue,
      });
    }
  };

  const handleConfirmChangeProvisioning = async () => {
    await toggleScim.mutateAsync(!!newScimStatus);
    if (!newScimStatus) {
      handleSaveGroup();
    }
  };

  return (
    <Spinner loading={isLoading}>
      <div>
        <TabHeader
          onCreate={handleCreateConfiguration}
          showCreate={!hasConfiguration}
          title={translate('settings.authentication.saml.configuration')}
        />

        {!hasConfiguration && (
          <div>{translate('settings.authentication.saml.form.not_configured')}</div>
        )}

        {hasConfiguration && (
          <>
            <ConfigurationDetails
              canDisable={!scimStatus}
              enabled={samlEnabled}
              extraActions={
                <Button enableOpenInNewTab to={CONFIG_TEST_PATH}>
                  {translate('settings.authentication.saml.form.test')}
                </Button>
              }
              isDeleting={isDeleting}
              onDelete={deleteConfiguration}
              onEdit={handleCreateConfiguration}
              onToggle={handleToggleEnable}
              title={name?.toString() ?? ''}
              url={url}
            />
            <ProvisioningSection
              autoDescription={
                <>
                  <p className="sw-mb-2">
                    {translate('settings.authentication.saml.form.provisioning_with_scim.sub')}
                  </p>
                  <p className="sw-mb-2">
                    {translate(
                      'settings.authentication.saml.form.provisioning_with_scim.description',
                    )}
                  </p>
                  <p>
                    <FormattedMessage
                      id="settings.authentication.saml.form.provisioning_with_scim.description.doc"
                      values={{
                        documentation: (
                          <DocumentationLink to={DocLink.AlmSamlScimAuth}>
                            {translate('documentation')}
                          </DocumentationLink>
                        ),
                      }}
                    />
                  </p>
                </>
              }
              autoFeatureDisabledText={
                <FormattedMessage
                  id="settings.authentication.saml.form.provisioning.disabled"
                  values={{
                    documentation: (
                      <DocumentationLink to={DocLink.AlmSamlScimAuth}>
                        {translate('documentation')}
                      </DocumentationLink>
                    ),
                  }}
                />
              }
              autoTitle={translate('settings.authentication.saml.form.provisioning_with_scim')}
              disabledConfigText={translate('settings.authentication.saml.enable_first')}
              enabled={samlEnabled}
              hasDifferentProvider={hasDifferentProvider}
              hasFeatureEnabled={hasScim}
              hasUnsavedChanges={hasScimConfigChange}
              jitDescription={translate(
                'settings.authentication.saml.form.provisioning_at_login.sub',
              )}
              jitTitle={translate('settings.authentication.saml.form.provisioning_at_login')}
              onCancel={() => {
                setNewScimStatus(undefined);
                setNewGroupSetting();
              }}
              onChangeProvisioningType={(val: ProvisioningType) => {
                setNewScimStatus(val === ProvisioningType.auto);
              }}
              onSave={(e: FormEvent) => {
                e.preventDefault();
                if (hasScimTypeChange) {
                  setShowConfirmProvisioningModal(true);
                } else {
                  handleSaveGroup();
                }
              }}
              provisioningType={
                (newScimStatus ?? scimStatus) ? ProvisioningType.auto : ProvisioningType.jit
              }
            />
            <ConfirmModal
              confirmButtonText={translate('yes')}
              header={translate(
                'settings.authentication.saml.confirm',
                newScimStatus ? 'scim' : 'jit',
              )}
              isDestructive={!newScimStatus}
              isOpen={showConfirmProvisioningModal}
              onClose={() => {
                setShowConfirmProvisioningModal(false);
              }}
              onConfirm={() => handleConfirmChangeProvisioning()}
            >
              {translate(
                'settings.authentication.saml.confirm',
                newScimStatus ? 'scim' : 'jit',
                'description',
              )}
            </ConfirmModal>
          </>
        )}
        {showEditModal && (
          <ConfigurationForm
            canBeSave={canBeSave}
            create={!hasConfiguration}
            excludedField={SAML_EXCLUDED_FIELD}
            loading={isLoading}
            onClose={handleCancelConfiguration}
            setNewValue={setNewValue}
            tab={SAML}
            values={values}
          />
        )}
      </div>
    </Spinner>
  );
}
