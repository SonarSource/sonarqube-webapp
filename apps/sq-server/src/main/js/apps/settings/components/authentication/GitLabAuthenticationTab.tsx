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

import { Button, MessageCallout, RadioButtonGroup, Spinner, Text } from '@sonarsource/echoes-react';
import { isEmpty, omitBy } from 'lodash';
import { FormEvent, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { RequiredIcon } from '~design-system';
import { SettingType } from '~shared/types/settings';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useIdentityProviderQuery } from '~sq-server-commons/queries/identity-provider/common';
import {
  useDeleteGitLabConfigurationMutation,
  useGitLabConfigurationsQuery,
  useSyncWithGitLabNow,
  useUpdateGitLabConfigurationMutation,
} from '~sq-server-commons/queries/identity-provider/gitlab';
import { Feature } from '~sq-server-commons/types/features';
import {
  GitLabConfigurationUpdateBody,
  ProvisioningType,
} from '~sq-server-commons/types/provisioning';
import { DefinitionV2 } from '~sq-server-commons/types/settings';
import { Provider } from '~sq-server-commons/types/types';
import GitLabSynchronisationWarning from '../../../../app/components/GitLabSynchronisationWarning';
import { getPropertyDescription, getPropertyName } from '../../utils';
import AuthenticationFormField from './AuthenticationFormField';
import AuthenticationMultiValueField from './AuthenticationMultiValuesField';
import AutoProvisioningConsent from './AutoProvisionningConsent';
import ConfigurationDetails from './ConfigurationDetails';
import ConfirmProvisioningModal from './ConfirmProvisioningModal';
import GitLabConfigurationForm from './GitLabConfigurationForm';
import GitLabConfigurationValidity from './GitLabConfigurationValidity';
import GitLabMappingModal from './GitLabMappingModal';
import ProvisioningSection from './ProvisioningSection';
import TabHeader from './TabHeader';

interface ChangesForm {
  allowAllGroups?: GitLabConfigurationUpdateBody['allowAllGroups'];
  allowUsersToSignUp?: GitLabConfigurationUpdateBody['allowUsersToSignUp'];
  allowedGroups?: GitLabConfigurationUpdateBody['allowedGroups'];
  provisioningToken?: GitLabConfigurationUpdateBody['provisioningToken'];
  provisioningType?: GitLabConfigurationUpdateBody['provisioningType'];
}

const ALLOW_ALL = 'all';
const ALLOW_SPECIFIC = 'specific';

interface AllowedGroupsFieldProps {
  allowAllGroups: boolean;
  allowedGroups: string[] | undefined;
  className?: string;
  definition: DefinitionV2;
  isAutoProvisioning?: boolean;
  mandatory?: boolean;
  onAllowAllGroupsChange: (value: boolean) => void;
  onAllowedGroupsChange: (value: string[]) => void;
}

function AllowedGroupsField(props: Readonly<AllowedGroupsFieldProps>) {
  const {
    allowAllGroups,
    allowedGroups,
    className,
    definition,
    mandatory = false,
    onAllowAllGroupsChange,
    onAllowedGroupsChange,
    isAutoProvisioning,
  } = props;
  const { formatMessage } = useIntl();
  const name = getPropertyName(definition);
  const description = getPropertyDescription(definition);

  return (
    <div className={className}>
      <Text className="sw-mb-1 sw-flex sw-items-center" isHighlighted>
        {name}
        {mandatory && (
          <RequiredIcon aria-label={formatMessage({ id: 'required' })} className="sw-ml-1" />
        )}
      </Text>
      {description !== undefined && <Text isSubtle>{description}</Text>}

      {isAutoProvisioning && (
        <RadioButtonGroup
          ariaLabel={name}
          className="sw-mt-3"
          onChange={(value) => {
            onAllowAllGroupsChange(value === ALLOW_ALL);
          }}
          options={[
            {
              value: ALLOW_ALL,
              label: formatMessage({
                id: 'settings.authentication.gitlab.form.allowedGroups.allow_all.label',
              }),
              helpText: (
                <div>
                  {formatMessage({
                    id: 'settings.authentication.gitlab.form.allowedGroups.allow_all.help',
                  })}
                  {allowAllGroups && isAutoProvisioning && (
                    <MessageCallout className="sw-mt-2" variety="warning">
                      <FormattedMessage id="settings.authentication.gitlab.form.allowedGroups.allow_all.warning" />
                    </MessageCallout>
                  )}
                </div>
              ),
            },
            {
              value: ALLOW_SPECIFIC,
              label: formatMessage({
                id: 'settings.authentication.gitlab.form.allowedGroups.allow_specific.label',
              }),
              helpText: formatMessage({
                id: 'settings.authentication.gitlab.form.allowedGroups.allow_specific.help',
              }),
            },
          ]}
          value={allowAllGroups ? ALLOW_ALL : ALLOW_SPECIFIC}
        />
      )}

      {(!allowAllGroups || !isAutoProvisioning) && (
        <div className={`sw-mt-3 ${isAutoProvisioning ? 'sw-ml-6' : ''}`}>
          <label className="sw-sr-only" htmlFor={definition.key}>
            {name}
          </label>
          <AuthenticationMultiValueField
            definition={definition}
            onFieldChange={onAllowedGroupsChange}
            placeHolder={formatMessage({
              id: 'settings.authentication.gitlab.form.allowedGroups.placeholder',
            })}
            settingValue={allowedGroups}
          />
        </div>
      )}
    </div>
  );
}

const useDefinitions = (
  provisioningType: ProvisioningType,
): Record<keyof Omit<ChangesForm, 'allowAllGroups' | 'provisioningType'>, DefinitionV2> => {
  const { formatMessage } = useIntl();
  return {
    allowUsersToSignUp: {
      name: formatMessage({ id: 'settings.authentication.gitlab.form.allowUsersToSignUp.name' }),
      secured: false,
      key: 'allowUsersToSignUp',
      description: formatMessage({
        id: 'settings.authentication.gitlab.form.allowUsersToSignUp.description',
      }),
      type: SettingType.BOOLEAN,
    },
    provisioningToken: {
      name: formatMessage({ id: 'settings.authentication.gitlab.form.provisioningToken.name' }),
      secured: true,
      key: 'provisioningToken',
      description: formatMessage({
        id: 'settings.authentication.gitlab.form.provisioningToken.description',
      }),
    },
    allowedGroups: {
      name: formatMessage({ id: 'settings.authentication.gitlab.form.allowedGroups.name' }),
      secured: false,
      key: 'allowedGroups',
      description: formatMessage({
        id: `settings.authentication.gitlab.form.allowedGroups.description.${provisioningType}`,
      }),
      multiValues: true,
    },
  };
};

export default function GitLabAuthenticationTab() {
  const { formatMessage } = useIntl();
  const [openForm, setOpenForm] = useState(false);
  const [changes, setChanges] = useState<ChangesForm | undefined>();
  const [tokenKey, setTokenKey] = useState<number>(0);
  const [showConfirmProvisioningModal, setShowConfirmProvisioningModal] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  const hasGitlabProvisioningFeature = useContext(AvailableFeaturesContext).includes(
    Feature.GitlabProvisioning,
  );

  const { data: identityProvider } = useIdentityProviderQuery();
  const {
    data: list,
    isLoading: isLoadingList,
    isFetching,
    refetch,
  } = useGitLabConfigurationsQuery();
  const configuration = list?.gitlabConfigurations[0];

  const { canSyncNow, synchronizeNow } = useSyncWithGitLabNow();

  const { mutate: updateConfig, isPending: isUpdating } = useUpdateGitLabConfigurationMutation();
  const { mutate: deleteConfig, isPending: isDeleting } = useDeleteGitLabConfigurationMutation();

  const definitions = useDefinitions(
    changes?.provisioningType ?? configuration?.provisioningType ?? ProvisioningType.jit,
  );
  const toggleEnable = () => {
    if (!configuration) {
      return;
    }
    updateConfig({ id: configuration.id, data: { enabled: !configuration.enabled } });
  };

  const deleteConfiguration = () => {
    if (!configuration) {
      return;
    }
    deleteConfig(configuration.id);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      changes?.provisioningType !== undefined ||
      (provisioningType === ProvisioningType.jit &&
        allowUsersToSignUp &&
        !allowAllGroups &&
        isEmpty(allowedGroups))
    ) {
      setShowConfirmProvisioningModal(true);
    } else {
      updateProvisioning();
    }
  };

  const updateProvisioning = () => {
    if (!changes || !configuration) {
      return;
    }

    updateConfig(
      { id: configuration.id, data: omitBy(changes, (value) => value === undefined) },
      {
        onSuccess: () => {
          setChanges(undefined);
          setTokenKey(tokenKey + 1);
        },
      },
    );
  };

  const setJIT = () => {
    setChangesWithCheck({
      provisioningType: ProvisioningType.jit,
      allowAllGroups: changes?.allowAllGroups,
      allowedGroups: changes?.allowedGroups,
      provisioningToken: undefined,
    });
  };

  const setAuto = () => {
    setChangesWithCheck({
      provisioningType: ProvisioningType.auto,
      allowAllGroups: changes?.allowAllGroups,
      allowedGroups: changes?.allowedGroups,
      allowUsersToSignUp: undefined,
    });
  };

  const hasDifferentProvider =
    identityProvider?.provider !== undefined && identityProvider.provider !== Provider.Gitlab;
  const allowUsersToSignUpDefinition = definitions.allowUsersToSignUp;
  const allowedGroupsDefinition = definitions.allowedGroups;
  const provisioningTokenDefinition = definitions.provisioningToken;

  const provisioningType = changes?.provisioningType ?? configuration?.provisioningType;
  const synchronizeGroups = configuration?.synchronizeGroups ?? false;
  const allowUsersToSignUp = changes?.allowUsersToSignUp ?? configuration?.allowUsersToSignUp;
  const allowAllGroups = changes?.allowAllGroups ?? configuration?.allowAllGroups ?? false;
  const allowedGroups = changes?.allowedGroups ?? configuration?.allowedGroups;
  const provisioningToken = changes?.provisioningToken;

  const canSave = () => {
    if (!configuration || changes === undefined || isUpdating) {
      return false;
    }
    const type = changes?.provisioningType ?? configuration.provisioningType;
    if (changes && type === ProvisioningType.auto) {
      const areGroupsDefined =
        changes.allowedGroups?.some((val) => val !== '') ??
        configuration.allowedGroups?.some((val) => val !== '');
      return (
        (configuration.isProvisioningTokenSet || !!changes.provisioningToken) &&
        (allowAllGroups || areGroupsDefined)
      );
    }
    return true;
  };

  const setChangesWithCheck = (newChanges: ChangesForm) => {
    const newValue = {
      provisioningType:
        configuration?.provisioningType === newChanges.provisioningType
          ? undefined
          : newChanges.provisioningType,
      allowAllGroups:
        configuration?.allowAllGroups === newChanges.allowAllGroups
          ? undefined
          : newChanges.allowAllGroups,
      allowUsersToSignUp:
        configuration?.allowUsersToSignUp === newChanges.allowUsersToSignUp
          ? undefined
          : newChanges.allowUsersToSignUp,
      allowedGroups:
        configuration?.allowedGroups === newChanges.allowedGroups
          ? undefined
          : newChanges.allowedGroups,
      provisioningToken: newChanges.provisioningToken,
    };
    if (Object.values(newValue).some((v) => v !== undefined)) {
      setChanges(newValue);
    } else {
      setChanges(undefined);
    }
  };

  return (
    <Spinner isLoading={isLoadingList}>
      <div>
        <TabHeader
          configurationValidity={
            <>
              {!isLoadingList && configuration?.enabled && (
                <GitLabConfigurationValidity
                  configuration={configuration}
                  loading={isFetching}
                  onRecheck={refetch}
                />
              )}
            </>
          }
          onCreate={() => {
            setOpenForm(true);
          }}
          showCreate={!configuration}
          title={formatMessage({ id: 'settings.authentication.gitlab.configuration' })}
        />
        {!configuration && (
          <div>
            <FormattedMessage id="settings.authentication.gitlab.form.not_configured" />
          </div>
        )}
        {configuration && (
          <>
            <ConfigurationDetails
              canDisable={!isUpdating && configuration.provisioningType !== ProvisioningType.auto}
              enabled={configuration.enabled}
              isDeleting={isDeleting}
              onDelete={deleteConfiguration}
              onEdit={() => {
                setOpenForm(true);
              }}
              onToggle={toggleEnable}
              title={formatMessage(
                { id: 'settings.authentication.gitlab.applicationId.name' },
                { 0: configuration.applicationId },
              )}
              url={configuration.url}
            />
            <ProvisioningSection
              autoDescription={
                <FormattedMessage
                  id="settings.authentication.gitlab.form.provisioning_with_gitlab.description"
                  values={{
                    documentation: (
                      <DocumentationLink to={DocLink.AlmGitLabAuthAutoProvisioningMethod}>
                        {formatMessage({ id: 'learn_more' })}
                      </DocumentationLink>
                    ),
                  }}
                />
              }
              autoFeatureDisabledText={
                <FormattedMessage
                  id="settings.authentication.gitlab.form.provisioning.disabled"
                  values={{
                    documentation: (
                      <DocumentationLink to={DocLink.AlmGitLabAuth}>
                        <FormattedMessage id="documentation" />
                      </DocumentationLink>
                    ),
                  }}
                />
              }
              autoSettings={
                <>
                  <AuthenticationFormField
                    definition={provisioningTokenDefinition}
                    isNotSet={!configuration.isProvisioningTokenSet}
                    key={tokenKey}
                    mandatory
                    onFieldChange={(_, value) => {
                      setChangesWithCheck({
                        ...changes,
                        provisioningToken: value as string,
                      });
                    }}
                    settingValue={provisioningToken}
                  />
                  <AllowedGroupsField
                    allowAllGroups={allowAllGroups}
                    allowedGroups={allowedGroups}
                    className="sw-mt-8"
                    definition={allowedGroupsDefinition}
                    isAutoProvisioning
                    mandatory
                    onAllowAllGroupsChange={(value) => {
                      setChangesWithCheck({
                        ...changes,
                        allowAllGroups: value,
                      });
                    }}
                    onAllowedGroupsChange={(values) => {
                      setChangesWithCheck({
                        ...changes,
                        allowedGroups: values,
                      });
                    }}
                  />
                  <div className="sw-mt-8">
                    <div className="sw-flex sw-flex-col sw-gap-2 sw-items-start">
                      <Text isHighlighted>
                        <FormattedMessage id="settings.authentication.configuration.roles_mapping.title" />
                      </Text>
                      <Button
                        onClick={() => {
                          setIsMappingModalOpen(true);
                        }}
                      >
                        <FormattedMessage id="settings.authentication.configuration.roles_mapping.button_label" />
                      </Button>
                    </div>
                    <Text as="p" className="sw-mt-3" isSubtle>
                      <FormattedMessage id="settings.authentication.gitlab.configuration.roles_mapping.description" />
                    </Text>
                  </div>
                </>
              }
              autoTitle={formatMessage({
                id: 'settings.authentication.gitlab.form.provisioning_with_gitlab',
              })}
              canSave={canSave()}
              canSync={canSyncNow}
              disabledConfigText={formatMessage({
                id: 'settings.authentication.gitlab.enable_first',
              })}
              enabled={configuration.enabled}
              hasDifferentProvider={hasDifferentProvider}
              hasFeatureEnabled={hasGitlabProvisioningFeature}
              hasUnsavedChanges={changes !== undefined}
              isLoading={isUpdating}
              jitDescription={
                <FormattedMessage
                  id="settings.authentication.gitlab.provisioning_at_login.description"
                  values={{
                    documentation: (
                      <DocumentationLink to={DocLink.AlmGitLabAuthJITProvisioningMethod}>
                        {formatMessage({ id: 'learn_more' })}
                      </DocumentationLink>
                    ),
                  }}
                />
              }
              jitSettings={
                <>
                  <AuthenticationFormField
                    definition={allowUsersToSignUpDefinition}
                    isNotSet={configuration.provisioningType !== ProvisioningType.auto}
                    mandatory
                    onFieldChange={(_, value) => {
                      setChangesWithCheck({
                        ...changes,
                        allowUsersToSignUp: value as boolean,
                      });
                    }}
                    settingValue={allowUsersToSignUp}
                  />
                  {allowUsersToSignUp && !synchronizeGroups && (
                    <MessageCallout className="sw-mt-3" variety="warning">
                      <FormattedMessage id="settings.authentication.gitlab.form.allowUsersToSignUp.info" />
                    </MessageCallout>
                  )}
                  <AllowedGroupsField
                    allowAllGroups={allowAllGroups}
                    allowedGroups={allowedGroups}
                    className="sw-mt-8"
                    definition={allowedGroupsDefinition}
                    onAllowAllGroupsChange={(value) => {
                      setChangesWithCheck({
                        ...changes,
                        allowAllGroups: value,
                      });
                    }}
                    onAllowedGroupsChange={(values) => {
                      setChangesWithCheck({
                        ...changes,
                        allowedGroups: values,
                      });
                    }}
                  />
                </>
              }
              jitTitle={formatMessage({
                id: 'settings.authentication.gitlab.provisioning_at_login',
              })}
              onCancel={() => {
                setChanges(undefined);
                setTokenKey(tokenKey + 1);
              }}
              onChangeProvisioningType={(val: ProvisioningType) => {
                if (val === ProvisioningType.auto) {
                  setAuto();
                } else {
                  setJIT();
                }
              }}
              onSave={handleSubmit}
              onSyncNow={synchronizeNow}
              provisioningType={provisioningType ?? ProvisioningType.jit}
              synchronizationDetails={<GitLabSynchronisationWarning />}
            />
          </>
        )}
      </div>
      {provisioningType && (
        <ConfirmProvisioningModal
          allowUsersToSignUp={allowUsersToSignUp}
          hasProvisioningTypeChange={Boolean(changes?.provisioningType)}
          isAllowListEmpty={!allowAllGroups && isEmpty(allowedGroups)}
          isOpen={showConfirmProvisioningModal}
          onClose={() => {
            setShowConfirmProvisioningModal(false);
          }}
          onConfirm={updateProvisioning}
          provider={Provider.Gitlab}
          provisioningStatus={provisioningType}
        />
      )}
      {isMappingModalOpen && (
        <GitLabMappingModal
          onClose={() => {
            setIsMappingModalOpen(false);
          }}
        />
      )}
      {openForm && (
        <GitLabConfigurationForm
          gitlabConfiguration={configuration ?? null}
          onClose={() => {
            setOpenForm(false);
          }}
        />
      )}
      <AutoProvisioningConsent gitlabConfiguration={configuration} />
    </Spinner>
  );
}
