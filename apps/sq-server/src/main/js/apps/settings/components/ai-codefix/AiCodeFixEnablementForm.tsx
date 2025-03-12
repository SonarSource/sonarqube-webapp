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
  IconInfo,
  Link,
  ModalAlert,
  RadioButtonGroup,
  Select,
  Text,
} from '@sonarsource/echoes-react';
import { find, groupBy, isEmpty, isEqual, sortBy } from 'lodash';
import React, { useCallback, useEffect, useReducer } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, Note } from '~design-system';
import {
  AIFeatureEnablement,
  LLMAzureOption,
  LLMOption,
  LLMProvider,
} from '~sq-server-shared/api/fix-suggestions';
import SelectList, {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-shared/components/controls/SelectList';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getAiCodeFixTermsOfServiceUrl } from '~sq-server-shared/helpers/urls';
import {
  useGetFeatureEnablementQuery,
  useGetLlmProvidersQuery,
  useUpdateFeatureEnablementMutation,
} from '~sq-server-shared/queries/fix-suggestions';
import { useGetAllProjectsQuery } from '~sq-server-shared/queries/project-managements';
import { AiCodeFixFeatureEnablement } from '~sq-server-shared/types/fix-suggestions';
import PromotedSection from '../../../overview/branches/PromotedSection';
import { formReducer } from './AiCodeFixFormReducer';
import { LLMForm } from './LLMForm';

interface AiCodeFixEnablementFormProps {
  isEarlyAccess?: boolean;
}

export interface AiFormValidation {
  error: { [key: string]: string };
}

function isAzureLLMOption(option: Partial<LLMOption>): option is LLMAzureOption {
  return option.key === 'AZURE_OPENAI';
}

function isValidProvider(
  provider: Partial<LLMOption>,
  currentProviderKey?: string,
): provider is LLMOption {
  return (
    provider.key !== undefined &&
    ((isAzureLLMOption(provider) &&
      ((!isEmpty(provider.apiKey) && !isEmpty(provider.endpoint)) ||
        (currentProviderKey === 'AZURE_OPENAI' && !isEmpty(provider.endpoint)))) ||
      !isAzureLLMOption(provider))
  );
}

function isSameProvider(a: Partial<LLMOption> | null, b: Partial<LLMOption> | null) {
  if (a === null && b === null) {
    return true;
  } else if (a === null) {
    return false;
  } else if (b === null) {
    return false;
  }
  return (
    (!isAzureLLMOption(a) && a.modelKey === b.modelKey) ||
    (isAzureLLMOption(a) &&
      isAzureLLMOption(b) &&
      a.endpoint === b.endpoint &&
      a.apiKey === b.apiKey)
  );
}

function getRecommendedProvider(providers: LLMProvider[]): LLMOption | undefined {
  const recommendedProvider = providers.find((p) => p.models?.some((m) => m.recommended));
  if (recommendedProvider === undefined) {
    return;
  }

  return {
    key: recommendedProvider.key,
    modelKey: recommendedProvider.models?.find((m) => m.recommended)?.key ?? '',
  };
}

function sanitizeProvider(provider: Partial<LLMOption>): LLMOption {
  if (isAzureLLMOption(provider)) {
    return {
      key: 'AZURE_OPENAI',
      endpoint: provider.endpoint ?? '',
      apiKey: provider.apiKey,
      modelKey: null,
    };
  }

  return { key: provider.key ?? 'OPENAI', modelKey: provider.modelKey ?? '' };
}

const DEFAULT_FEATURE_ENABLEMENT = {
  enablement: AiCodeFixFeatureEnablement.disabled as const,
  enabledProjectKeys: null,
  provider: null,
};

const PROVIDER_MODEL_KEY_SEPARATOR = '&&';

export default function AiCodeFixEnablementForm({
  isEarlyAccess,
}: Readonly<AiCodeFixEnablementFormProps>) {
  const { data: projects = [], isLoading: isLoadingProject } = useGetAllProjectsQuery();

  const { data: llmOptions } = useGetLlmProvidersQuery();

  const [validations, setValidations] = React.useState<AiFormValidation>({
    error: {},
  });

  const {
    data: featureEnablementParams = DEFAULT_FEATURE_ENABLEMENT,
    isLoading: isLoadingFeatureEnablement,
  } = useGetFeatureEnablementQuery();

  const [formState, dispatch] = useReducer(formReducer, {
    ...featureEnablementParams,
    projectsToDisplay: [],
  });

  const { mutate: updateFeatureEnablement, isPending } = useUpdateFeatureEnablementMutation();

  useEffect(() => {
    dispatch({ initialEnablement: featureEnablementParams, projects, type: 'initialize' });
  }, [projects, featureEnablementParams]);

  const renderProjectElement = (key: string): React.ReactNode => {
    const project = find(projects, { key });
    return (
      <div>
        {project === undefined ? (
          key
        ) : (
          <>
            {project.name}
            <br />
            <Note>{project.key}</Note>
          </>
        )}
      </div>
    );
  };

  const handleAiCodeFixUpdate = () => {
    const enabledProjectKeys =
      formState.enablement === AiCodeFixFeatureEnablement.someProjects
        ? formState.enabledProjectKeys
        : formState.enablement === AiCodeFixFeatureEnablement.disabled
          ? null
          : [];

    // Can be save only if provider is valid, this is safe.
    const provider = formState.provider === null ? null : sanitizeProvider(formState.provider);

    updateFeatureEnablement(
      {
        config: {
          enablement: formState.enablement,
          enabledProjectKeys,
          provider,
        } as AIFeatureEnablement,
        prevState: featureEnablementParams,
      },
      {
        onError: (err) => {
          if (err.response?.data.relatedField !== undefined) {
            // relatedField is in the form of "provider.endpoint"
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

  const onProjectSelect = (projectKey: string) => {
    dispatch({ projectKey, type: 'select' });
    return Promise.resolve();
  };

  const onProjectUnselect = (projectKey: string) => {
    dispatch({ projectKey, type: 'unselect' });
    return Promise.resolve();
  };

  const onSearch = useCallback(
    (searchParams: SelectListSearchParams) => {
      dispatch({ projects, searchParams, type: 'filter' });
      return Promise.resolve();
    },
    [projects],
  );

  const providerOptionsGrouped = groupBySelfHosted(llmOptions ?? []);
  const isLoading = isLoadingProject || isLoadingFeatureEnablement || isPending;

  return (
    <div className="sw-flex sw-items-start">
      <div className="sw-flex-grow sw-p-6">
        <Heading as="h2" hasMarginBottom>
          {translate('property.aicodefix.admin.title')}
        </Heading>
        <p>{translate('property.aicodefix.admin.description')}</p>
        <Checkbox
          checked={formState.enablement !== AiCodeFixFeatureEnablement.disabled}
          className="sw-my-6"
          helpText={
            <FormattedMessage
              id="property.aicodefix.admin.acceptTerm.label"
              values={{
                terms: (
                  <Link shouldOpenInNewTab to={getAiCodeFixTermsOfServiceUrl()}>
                    {translate('property.aicodefix.admin.acceptTerm.terms')}
                  </Link>
                ),
              }}
            />
          }
          label={translate('property.aicodefix.admin.checkbox.label')}
          onCheck={() => {
            setValidations({ error: {} });
            dispatch({
              type: 'toggle-enablement',
              recommendedProvider: getRecommendedProvider(llmOptions ?? []),
            });
          }}
        />

        {formState.enablement !== AiCodeFixFeatureEnablement.disabled && (
          <div className="sw-ml-6 sw-gap-4 sw-flex sw-flex-col">
            <Select
              data={providerOptionsGrouped}
              helpText={translate('aicodefix.admin.provider.help')}
              id="llm-provider-select"
              isNotClearable
              isRequired
              label={translate('aicodefix.admin.provider.title')}
              onChange={(value: string) => {
                const splitValue = value.split(PROVIDER_MODEL_KEY_SEPARATOR);
                const providerKey = splitValue[0];
                const modelKey = splitValue[1];
                setValidations({ error: {} });
                dispatch({ modelKey, providerKey, type: 'selectProvider' });
              }}
              value={
                formState.provider.modelKey
                  ? `${formState.provider.key}${PROVIDER_MODEL_KEY_SEPARATOR}${formState.provider.modelKey}`
                  : formState.provider.key
              }
              width="large"
            />
            <LLMForm
              isFirstSetup={
                featureEnablementParams.provider === null ||
                featureEnablementParams.provider.key === 'OPENAI'
              }
              onChange={(provider) => {
                setValidations({ error: {} });
                dispatch({ type: 'setProvider', provider });
              }}
              options={formState.provider}
              validation={validations}
            />
          </div>
        )}

        <div className="sw-ml-6 sw-mt-6">
          {formState.enablement !== AiCodeFixFeatureEnablement.disabled && (
            <RadioButtonGroup
              id="ai-code-fix-enablement"
              isRequired
              label={translate('property.aicodefix.admin.enable.title')}
              onChange={() => dispatch({ type: 'switch-enablement' })}
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
          <div className="sw-flex sw-mt-6">
            <Button
              isDisabled={
                (formState.enablement !== AiCodeFixFeatureEnablement.disabled &&
                  !isValidProvider(formState.provider, featureEnablementParams.provider?.key)) ||
                isLoading ||
                (formState.enablement === featureEnablementParams.enablement &&
                  isEqual(
                    formState.enabledProjectKeys,
                    featureEnablementParams.enabledProjectKeys,
                  ) &&
                  isSameProvider(formState.provider, featureEnablementParams.provider))
              }
              isLoading={isPending}
              onClick={handleAiCodeFixUpdate}
              variety={ButtonVariety.Primary}
            >
              <FormattedMessage defaultMessage={translate('save')} id="save" />
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
              <Button
                className="sw-ml-3"
                isDisabled={
                  isLoading ||
                  (formState.enablement === featureEnablementParams.enablement &&
                    isEqual(
                      formState.enabledProjectKeys,
                      featureEnablementParams.enabledProjectKeys,
                    ) &&
                    isSameProvider(formState.provider, featureEnablementParams.provider))
                }
                variety={ButtonVariety.Default}
              >
                <FormattedMessage defaultMessage={translate('cancel')} id="cancel" />
              </Button>
            </ModalAlert>
          </div>
        </div>
      </div>
      {isEarlyAccess && (
        <PromotedSection
          className="sw-mt-0 sw-ml-6"
          content={
            <>
              <p>{translate('property.aicodefix.admin.early_access.content1')}</p>
              <p className="sw-mt-2">
                {translate('property.aicodefix.admin.early_access.content2')}
              </p>
            </>
          }
          title={translate('property.aicodefix.admin.early_access.title')}
        />
      )}
    </div>
  );
}

function groupBySelfHosted(providersArray: LLMProvider[]) {
  const groups = groupBy(providersArray, (m) => m.selfHosted);

  return Object.keys(groups).map((group) => {
    const items = sortBy(
      groups[group].flatMap((provider) =>
        provider.models === undefined || provider.models.length === 0
          ? [
              {
                value: provider.key,
                label: provider.name,
                suffix: null,
                helpText: '',
              },
            ]
          : provider.models.map((model) => ({
              value: `${provider.key}${PROVIDER_MODEL_KEY_SEPARATOR}${model.key}`,
              label: provider.name,
              suffix: model.recommended ? (
                <Badge variant="counter">{translate('recommended')}</Badge>
              ) : null,
              helpText: model.name,
            })),
      ),
      (m) => m.label,
    );

    return {
      group:
        group === 'true'
          ? translate('aicodefix.admin.provider.self_hosted')
          : translate('aicodefix.admin.provider.sonar'),
      items,
    };
  });
}
