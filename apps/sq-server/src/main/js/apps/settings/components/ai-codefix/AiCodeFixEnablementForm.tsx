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
  BadgeCounter,
  Button,
  ButtonVariety,
  Checkbox,
  Heading,
  IconInfo,
  Link,
  ModalAlert,
  RadioButtonGroup,
  Select,
  Text,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { find, groupBy, isEmpty, isEqual, sortBy } from 'lodash';
import React, { useCallback, useEffect, useReducer } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SelectList, {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-commons/components/controls/SelectList';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getAiCodeFixTermsOfServiceUrl } from '~sq-server-commons/helpers/urls';
import {
  CUSTOM_PROVIDER_TYPE,
  MASKED_SECRET,
  Provider,
  getProviderKey,
  useGetFeatureEnablementQuery,
  useUpdateFeatureEnablementMutation,
} from '~sq-server-commons/queries/fix-suggestions';
import { useGetAllProjectsQuery } from '~sq-server-commons/queries/project-managements';
import { AiCodeFixFeatureEnablement } from '~sq-server-commons/types/fix-suggestions';
import { FormState, formReducer } from './AiCodeFixFormReducer';
import { CustomHeadersForm } from './CustomHeadersForm';
import { LLMForm } from './LLMForm';

export interface AiFormValidation {
  error: { [key: string]: string };
}

function toPatchModel(type: string, model: string | null): string {
  if (model === null) {
    return type;
  }
  return `${type}_${model.toUpperCase().replaceAll(/[^A-Z0-9]/g, '_')}`;
}

function isValidProvider(formState: FormState, savedProviders: Provider[]): boolean {
  if (formState.selectedProviderKey === null) {
    return false;
  }

  const provider = formState.providers.find(
    (p) => getProviderKey(p) === formState.selectedProviderKey,
  );
  if (!provider) {
    return false;
  }

  const configKeys = Object.keys(provider.config);
  if (configKeys.length === 0) {
    return true;
  }

  const savedProvider = savedProviders.find((p) => getProviderKey(p) === getProviderKey(provider));
  const wasPreviouslySelected = savedProvider?.selected === true;

  const configValid = configKeys.every((key) => {
    const value = provider.config[key];
    if (!isEmpty(value) && value !== MASKED_SECRET) {
      return true;
    }
    // Empty/masked form value is OK if the server had a masked or empty value
    // for this key (e.g., secrets not returned by the API)
    const savedValue = savedProvider?.config[key];
    return wasPreviouslySelected && (isEmpty(savedValue) || savedValue === MASKED_SECRET);
  });

  if (!configValid) {
    return false;
  }

  if (provider.type === CUSTOM_PROVIDER_TYPE && provider.headers != null) {
    return provider.headers.every((header) => !isEmpty(header.name) && !isEmpty(header.value));
  }

  return true;
}

function hasProviderChanged(formState: FormState, savedProviders: Provider[]): boolean {
  const savedSelected = savedProviders.find((p) => p.selected);
  if (!savedSelected && !formState.selectedProviderKey) {
    return false;
  }
  if (!savedSelected || !formState.selectedProviderKey) {
    return true;
  }
  if (getProviderKey(savedSelected) !== formState.selectedProviderKey) {
    return true;
  }

  const currentProvider = formState.providers.find(
    (p) => getProviderKey(p) === formState.selectedProviderKey,
  );
  if (!currentProvider) {
    return true;
  }

  const configKeys = Object.keys(currentProvider.config);
  const configChanged = configKeys.some((key) => {
    const currentValue = currentProvider.config[key];
    const savedValue = savedSelected.config[key];
    // Masked server values displayed as empty — treat as unchanged
    if (savedValue === MASKED_SECRET && isEmpty(currentValue)) {
      return false;
    }
    return currentValue !== savedValue;
  });

  if (configChanged) {
    return true;
  }

  if (!isEqual(currentProvider.headers, savedSelected.headers)) {
    // Treat masked secret header values displayed as empty as unchanged
    const currentHeaders = currentProvider.headers ?? [];
    const savedHeaders = savedSelected.headers ?? [];
    if (currentHeaders.length !== savedHeaders.length) {
      return true;
    }
    return currentHeaders.some((h, i) => {
      const saved = savedHeaders[i];
      if (h.name !== saved.name || h.secret !== saved.secret) {
        return true;
      }
      if (saved.value === MASKED_SECRET && isEmpty(h.value)) {
        return false;
      }
      return h.value !== saved.value;
    });
  }

  return false;
}

const EMPTY_PROJECTS: never[] = [];

export function AiCodeFixEnablementForm() {
  const { formatMessage } = useIntl();
  const { data: projects = EMPTY_PROJECTS, isLoading: isLoadingProject } = useGetAllProjectsQuery();
  const { data: featureEnablementParams, isLoading: isLoadingFeatureEnablement } =
    useGetFeatureEnablementQuery();

  const [validations, setValidations] = React.useState<AiFormValidation>({
    error: {},
  });

  const [formState, dispatch] = useReducer(formReducer, {
    enablement: AiCodeFixFeatureEnablement.disabled,
    providers: [],
    enabledProjectKeys: null,
    projectsToDisplay: [],
    selectedProviderKey: null,
  });

  const {
    mutate: updateFeatureEnablement,
    isPending,
    isSuccess,
  } = useUpdateFeatureEnablementMutation();

  useEffect(() => {
    if (featureEnablementParams !== undefined) {
      dispatch({ initialEnablement: featureEnablementParams, projects, type: 'initialize' });
    }
  }, [projects, featureEnablementParams]);

  useEffect(() => {
    if (featureEnablementParams !== undefined) {
      dispatch({ type: 'clearSecretsState' });
    }
  }, [featureEnablementParams, isSuccess]);

  const renderProjectElement = useCallback(
    (key: string): React.ReactNode => {
      const project = find(projects, { key });

      return (
        <div>
          {project === undefined ? (
            key
          ) : (
            <>
              {project.name}

              <br />

              <Text isSubtle>{project.key}</Text>
            </>
          )}
        </div>
      );
    },
    [projects],
  );

  const onProjectSelect = useCallback((projectKey: string) => {
    dispatch({ projectKey, type: 'select' });
    return Promise.resolve();
  }, []);

  const onProjectUnselect = useCallback((projectKey: string) => {
    dispatch({ projectKey, type: 'unselect' });
    return Promise.resolve();
  }, []);

  const onSearch = useCallback(
    (searchParams: SelectListSearchParams) => {
      dispatch({ projects, searchParams, type: 'filter' });
      return Promise.resolve();
    },
    [projects],
  );

  if (isLoadingFeatureEnablement || featureEnablementParams === undefined) {
    return null;
  }

  const handleAiCodeFixUpdate = () => {
    const selectedProvider = formState.providers.find(
      (p) => getProviderKey(p) === formState.selectedProviderKey,
    );

    if (formState.enablement !== AiCodeFixFeatureEnablement.disabled && !selectedProvider) {
      return;
    }

    updateFeatureEnablement(
      {
        config: {
          enablement: formState.enablement,
          ...(formState.enablement === AiCodeFixFeatureEnablement.someProjects
            ? { enabledProjectKeys: formState.enabledProjectKeys }
            : {}),
          provider: selectedProvider
            ? {
                type: selectedProvider.type,
                model: toPatchModel(selectedProvider.type, selectedProvider.model),
                config: selectedProvider.config,
                headers:
                  selectedProvider.type === CUSTOM_PROVIDER_TYPE
                    ? (selectedProvider.headers ?? null)
                    : null,
              }
            : null,
        },
        prevState: featureEnablementParams,
      },
      {
        onError: (err) => {
          if (err.response?.data.relatedField !== undefined) {
            const splittedRelatedField = err.response?.data.relatedField.split('.');

            setValidations({
              error: { [splittedRelatedField[1]]: err.response?.data.message },
            });
          }
        },
      },
    );
  };

  const handleCancel = () => {
    dispatch({ initialEnablement: featureEnablementParams, type: 'cancel', projects });
    setValidations({ error: {} });
  };

  const providerOptionsGrouped = groupBySelfHosted(
    featureEnablementParams.providers,
    formatMessage,
  );
  const isLoading = isLoadingProject || isPending;

  const selectedProvider = formState.providers.find(
    (p) => getProviderKey(p) === formState.selectedProviderKey,
  );

  const isDirty =
    formState.enablement !== featureEnablementParams.enablement ||
    !isEqual(formState.enabledProjectKeys, featureEnablementParams.enabledProjectKeys) ||
    hasProviderChanged(formState, featureEnablementParams.providers);

  return (
    <div className="sw-flex sw-items-start">
      <div className="sw-flex-grow">
        <Heading as="h2" hasMarginBottom>
          {translate('property.aicodefix.admin.title')}
        </Heading>

        <p>{translate('property.aicodefix.admin.description')}</p>

        <Checkbox
          checked={formState.enablement !== AiCodeFixFeatureEnablement.disabled}
          className="sw-mt-6"
          helpText={
            <FormattedMessage
              id="property.aicodefix.admin.acceptTerm.label"
              values={{
                terms: (
                  <Link enableOpenInNewTab to={getAiCodeFixTermsOfServiceUrl()}>
                    {translate('property.aicodefix.admin.acceptTerm.terms')}
                  </Link>
                ),
              }}
            />
          }
          label={translate('property.aicodefix.admin.checkbox.label')}
          onCheck={() => {
            setValidations({ error: {} });
            dispatch({ type: 'toggle-enablement' });
          }}
        />

        {formState.enablement !== AiCodeFixFeatureEnablement.disabled && (
          <div className="sw-ml-6 sw-gap-4 sw-flex sw-flex-col sw-mt-4">
            <Select
              data={providerOptionsGrouped}
              helpText={translate('aicodefix.admin.provider.help')}
              id="llm-provider-select"
              isNotClearable
              isRequired
              label={translate('aicodefix.admin.provider.title')}
              onChange={(value) => {
                if (value === null) {
                  return;
                }
                setValidations({ error: {} });
                dispatch({ providerKey: value, type: 'selectProvider' });
              }}
              value={formState.selectedProviderKey ?? undefined}
              width="large"
            />

            <LLMForm
              config={selectedProvider?.config ?? {}}
              onChange={(configKey, value) => {
                setValidations({ error: {} });
                dispatch({ type: 'setProviderConfig', configKey, value });
              }}
              validation={validations}
            />

            {selectedProvider?.type === CUSTOM_PROVIDER_TYPE && (
              <CustomHeadersForm
                headers={selectedProvider.headers ?? []}
                onAddHeader={() => {
                  dispatch({ type: 'addHeader' });
                }}
                onRemoveHeader={(index) => {
                  dispatch({ type: 'removeHeader', index });
                }}
                onUpdateHeader={(index, field, value) => {
                  dispatch({ type: 'updateHeader', index, field, value });
                }}
              />
            )}
          </div>
        )}

        <div
          className={classNames('sw-ml-6', {
            'sw-mt-6': formState.enablement !== AiCodeFixFeatureEnablement.disabled,
          })}
        >
          {formState.enablement !== AiCodeFixFeatureEnablement.disabled && (
            <RadioButtonGroup
              id="ai-code-fix-enablement"
              isRequired
              label={translate('property.aicodefix.admin.enable.title')}
              onChange={() => {
                dispatch({ type: 'switch-enablement' });
              }}
              options={[
                {
                  helpText: translate('property.aicodefix.admin.enable.all.projects.help'),
                  label: translate('property.aicodefix.admin.enable.all.projects.label'),
                  value: AiCodeFixFeatureEnablement.allProjects,
                },
                {
                  helpText: translate('property.aicodefix.admin.enable.some.projects.help'),
                  label: translate('property.aicodefix.admin.enable.some.projects.label'),
                  value: AiCodeFixFeatureEnablement.someProjects,
                },
              ]}
              value={formState.enablement}
            />
          )}

          {formState.enablement === AiCodeFixFeatureEnablement.someProjects && (
            <div className="sw-ml-6">
              <div className="sw-flex sw-mb-6 sw-mt-4">
                <IconInfo className="sw-mr-1" color="echoes-color-icon-info" />
                <Text>{translate('property.aicodefix.admin.enable.some.projects.note')}</Text>
              </div>
              <SelectList
                elements={formState.projectsToDisplay}
                elementsTotalCount={formState.projectsToDisplay.length}
                initialSearchParam={SelectListFilter.All}
                labelAll={translate('all')}
                labelSelected={translate('selected')}
                labelUnselected={translate('unselected')}
                loading={isLoading}
                needToReload={false}
                onSearch={onSearch}
                onSelect={onProjectSelect}
                onUnselect={onProjectUnselect}
                renderElement={renderProjectElement}
                searchInputSize="auto"
                selectedElements={projects
                  .filter((p) => formState.enabledProjectKeys?.includes(p.key))
                  .map((u) => u.key)}
                withPaging
              />
            </div>
          )}
        </div>

        <div>
          {!isLoading && isDirty && (
            <div className="sw-flex sw-mt-6">
              <Button
                isDisabled={
                  (formState.enablement !== AiCodeFixFeatureEnablement.disabled &&
                    !isValidProvider(formState, featureEnablementParams.providers)) ||
                  isLoading ||
                  !isDirty
                }
                isLoading={isPending}
                onClick={handleAiCodeFixUpdate}
                variety={ButtonVariety.Primary}
              >
                <FormattedMessage id="save" />
              </Button>

              <ModalAlert
                description={translate('aicodefix.cancel.modal.description')}
                primaryButton={
                  <Button onClick={handleCancel} variety="primary">
                    {translate('confirm')}
                  </Button>
                }
                secondaryButtonLabel={translate('aicodefix.cancel.modal.continue_editing')}
                title={translate('aicodefix.cancel.modal.title')}
              >
                <Button className="sw-ml-3" variety={ButtonVariety.Default}>
                  <FormattedMessage id="cancel" />
                </Button>
              </ModalAlert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getProviderHelpText(
  provider: Provider,
  formatMessage: (descriptor: { id: string }) => string,
): string | null {
  if (provider.type === CUSTOM_PROVIDER_TYPE) {
    return formatMessage({ id: 'aicodefix.admin.provider.custom.help' });
  }
  return provider.model ?? null;
}

function groupBySelfHosted(
  providers: Provider[],
  formatMessage: (descriptor: { id: string }) => string,
) {
  const groups = groupBy(providers, (p) => p.selfHosted);

  return sortBy(
    Object.keys(groups).map((group) => {
      const items = sortBy(
        groups[group].map((provider) => ({
          value: getProviderKey(provider),
          label: provider.name ?? getProviderKey(provider),
          suffix:
            provider.recommended === true ? (
              <BadgeCounter value={formatMessage({ id: 'recommended' })} />
            ) : null,
          helpText: getProviderHelpText(provider, formatMessage),
        })),
        (m) => (m.value === CUSTOM_PROVIDER_TYPE ? 'zzz' : m.label),
      );

      return {
        group:
          group === 'true'
            ? formatMessage({ id: 'aicodefix.admin.provider.other_providers' })
            : formatMessage({ id: 'aicodefix.admin.provider.sonar' }),
        items,
        sortKey: group === 'false' ? 0 : 1,
      };
    }),
    (g) => g.sortKey,
  ).map(({ group, items }) => ({ group, items }));
}
