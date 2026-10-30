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
  MessageCallout,
  MessageVariety,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  BasicSeparator,
  FlagMessage,
  Link,
  RequiredIcon,
  SubHeading,
  SubTitle,
} from '~design-system';
import AlmSettingsInstanceSelector from '~sq-server-commons/components/devops-platform/AlmSettingsInstanceSelector';
import MandatoryFieldsExplanation from '~sq-server-commons/components/ui/MandatoryFieldsExplanation';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getGlobalSettingsUrl } from '~sq-server-commons/helpers/urls';
import {
  AlmSettingsInstance,
  ProjectAlmBindingConfigurationErrorScope,
  ProjectAlmBindingConfigurationErrors,
  ProjectAlmBindingResponse,
} from '~sq-server-commons/types/alm-settings';
import { PersonalAccessTokenFields } from '../../../create/project/components/PersonalAccessTokenFields';
import { FORM_HEADER_DESCRIPTIONS } from '../../../create/project/components/PersonalAccessTokenForm';
import { ALM_INTEGRATION_CATEGORY } from '../../constants';
import AlmSpecificForm from './AlmSpecificForm';

export interface PRDecorationBindingCredentials {
  almSetting: AlmSettingsInstance;
  error?: string;
  isExpired: boolean;
  onPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  username: string;
}

export interface PRDecorationBindingRendererProps {
  canSave: boolean;
  checkingConfiguration: boolean;
  configurationErrors?: ProjectAlmBindingConfigurationErrors;
  credentials?: PRDecorationBindingCredentials;
  formData: Omit<ProjectAlmBindingResponse, 'alm'>;
  instances: AlmSettingsInstance[];
  isChanged: boolean;
  isConfigured: boolean;
  isSysAdmin: boolean;
  isValid: boolean;
  loading: boolean;
  onCheckConfiguration: () => void;
  onFieldChange: (id: keyof ProjectAlmBindingResponse, value: string | boolean) => void;
  onReset: () => void;
  onSubmit: () => void;
  successfullyUpdated: boolean;
  updating: boolean;
}

export default function PRDecorationBindingRenderer(props: PRDecorationBindingRendererProps) {
  const {
    canSave,
    credentials,
    formData,
    instances,
    isChanged,
    isConfigured,
    isValid,
    loading,
    updating,
    successfullyUpdated,
    checkingConfiguration,
    configurationErrors,
    isSysAdmin,
  } = props;

  if (loading) {
    return <Spinner />;
  }

  if (instances.length < 1) {
    return (
      <div>
        <FlagMessage variant="info">
          {isSysAdmin ? (
            <p>
              <FormattedMessage
                id="settings.pr_decoration.binding.no_bindings.admin"
                values={{
                  link: (
                    <Link to={getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY)}>
                      <FormattedMessage id="settings.pr_decoration.binding.no_bindings.link" />
                    </Link>
                  ),
                }}
              />
            </p>
          ) : (
            translate('settings.pr_decoration.binding.no_bindings')
          )}
        </FlagMessage>
      </div>
    );
  }

  const selected = formData.key ? instances.find((i) => i.key === formData.key) : undefined;

  return (
    <div className="sw:p-6">
      <SubTitle as="h3">
        <FormattedMessage id="settings.pr_decoration.binding.title" />
      </SubTitle>
      <Text className="markdown" isSubtle>
        <FormattedMessage id="settings.pr_decoration.binding.description" />
      </Text>
      <BasicSeparator className="sw:my-6" />
      <form
        onSubmit={(event: React.SyntheticEvent<HTMLFormElement>) => {
          event.preventDefault();
          props.onSubmit();
        }}
      >
        <MandatoryFieldsExplanation />

        <div className="sw:p-6 sw:flex sw:gap-12">
          <div className="sw:w-abs-300">
            <SubHeading>
              <label htmlFor="name">
                <FormattedMessage id="settings.pr_decoration.binding.form.name" />
                <RequiredIcon className="sw:mr-2" />
              </label>
            </SubHeading>
            <div className="markdown">
              <FormattedMessage id="settings.pr_decoration.binding.form.name.help" />
            </div>
          </div>
          <div className="sw:flex-1">
            <AlmSettingsInstanceSelector
              className="sw:w-abs-400 it__configuration-name-select"
              initialValue={formData.key}
              inputId="name"
              instances={instances}
              onChange={(instance: AlmSettingsInstance) => {
                props.onFieldChange('key', instance.key);
              }}
            />
          </div>
        </div>

        {selected?.alm && (
          <AlmSpecificForm
            alm={selected.alm}
            formData={formData}
            instances={instances}
            onFieldChange={props.onFieldChange}
          />
        )}

        {credentials && (
          <div className="sw:p-6 sw:flex sw:gap-12">
            <div className="sw:w-abs-300">
              <Heading as="h4" hasMarginBottom size="small">
                <FormattedMessage id="onboarding.create_project.pat_form.title" />
              </Heading>
              <div className="markdown">{FORM_HEADER_DESCRIPTIONS[credentials.almSetting.alm]}</div>
            </div>
            <div className="sw:flex-1 sw:flex sw:flex-col sw:gap-4">
              {credentials.error ? (
                <MessageCallout variety={MessageVariety.Danger}>{credentials.error}</MessageCallout>
              ) : (
                credentials.isExpired && (
                  <MessageCallout variety={MessageVariety.Warning}>
                    <FormattedMessage id="onboarding.create_project.pat.expired.info_message" />
                  </MessageCallout>
                )
              )}
              <PersonalAccessTokenFields
                almKey={credentials.almSetting.alm}
                almSetting={credentials.almSetting}
                isInvalid={Boolean(credentials.error)}
                onPasswordChange={credentials.onPasswordChange}
                onUsernameChange={credentials.onUsernameChange}
                password={credentials.password}
                username={credentials.username}
              />
            </div>
          </div>
        )}

        <div className="sw:flex sw:items-center sw:mt-8 sw:gap-2">
          {isChanged && canSave && (
            <>
              <Button
                isDisabled={updating || !isValid}
                type="submit"
                variety={ButtonVariety.Primary}
              >
                <span data-test="project-settings__alm-save">
                  <FormattedMessage id="save" />
                </span>
              </Button>
              <Spinner isLoading={updating} />
            </>
          )}
          {!updating && successfullyUpdated && (
            <FlagMessage variant="success">
              <FormattedMessage id="settings.state.saved" />
            </FlagMessage>
          )}
          {isConfigured && (
            <>
              <Button onClick={props.onReset}>
                <span data-test="project-settings__alm-reset">
                  <FormattedMessage id="reset_verb" />
                </span>
              </Button>
              {!isChanged && (
                <>
                  <Button isDisabled={checkingConfiguration} onClick={props.onCheckConfiguration}>
                    <FormattedMessage id="settings.pr_decoration.binding.check_configuration" />
                  </Button>
                  <Spinner isLoading={checkingConfiguration} />
                </>
              )}
            </>
          )}
        </div>
        {!checkingConfiguration && configurationErrors?.errors && (
          <FlagMessage className="sw:mt-6" variant="error">
            <div>
              <p className="sw:mb-2">
                <FormattedMessage id="settings.pr_decoration.binding.check_configuration.failure" />
              </p>
              <ul className="list-styled">
                {configurationErrors.errors.map((error, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i}>{error.msg}</li>
                ))}
              </ul>
              {configurationErrors.scope === ProjectAlmBindingConfigurationErrorScope.Global && (
                <p>
                  {isSysAdmin ? (
                    <FormattedMessage
                      id="settings.pr_decoration.binding.check_configuration.failure.check_global_settings"
                      values={{
                        link: (
                          <Link
                            to={getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY, {
                              alm: selected?.alm,
                            })}
                          >
                            <FormattedMessage id="settings.pr_decoration.binding.check_configuration.failure.check_global_settings.link" />
                          </Link>
                        ),
                      }}
                    />
                  ) : (
                    translate('settings.pr_decoration.binding.check_configuration.contact_admin')
                  )}
                </p>
              )}
            </div>
          </FlagMessage>
        )}
        {isConfigured && !isChanged && !checkingConfiguration && !configurationErrors && (
          <FlagMessage className="sw:mt-6" variant="success">
            <FormattedMessage id="settings.pr_decoration.binding.check_configuration.success" />
          </FlagMessage>
        )}
      </form>
    </div>
  );
}
