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
import { AIFeatureEnablement, LLMOption, LLMProvider } from '~sq-server-shared/api/fix-suggestions';
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
import { formReducer, LLMProviderKey } from './AiCodeFixFormReducer';
import { LLMForm } from './LLMForm';

interface AiCodeFixEnablementFormProps {
  isEarlyAccess?: boolean;
}

export interface AiFormValidation {
  error: { [key: string]: string };
}

function isValidProvider(
  provider: Partial<LLMOption>,
  currentProviderKey?: LLMProviderKey,
): provider is LLMOption {
  return (
    provider.key !== undefined &&
    ((provider.key === 'AZURE_OPENAI' &&
      (!isEmpty(provider.apiKey) || currentProviderKey === 'AZURE_OPENAI')) ||
      provider.key === 'OPENAI')
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
    (a.key === 'OPENAI' && b.key === 'OPENAI') ||
    (a.key === 'AZURE_OPENAI' &&
      b.key === 'AZURE_OPENAI' &&
      a.endpoint === b.endpoint &&
      a.apiKey === b.apiKey)
  );
}

function sanitizeProvider(provider: Partial<LLMOption>): LLMOption {
  switch (provider.key) {
    case 'AZURE_OPENAI':
      return { key: 'AZURE_OPENAI', endpoint: provider.endpoint ?? '', apiKey: provider.apiKey };
    case 'OPENAI':
    default:
      return { key: 'OPENAI' };
  }
}

const DEFAULT_FEATURE_ENABLEMENT = {
  enablement: AiCodeFixFeatureEnablement.disabled as const,
  enabledProjectKeys: null,
  provider: null,
};

export default function AiCodeFixEnablementForm({
  isEarlyAccess,
}: Readonly<AiCodeFixEnablementFormProps>) {
  const { data: projects = [], isLoading } = useGetAllProjectsQuery();

  const { data: llmOptions } = useGetLlmProvidersQuery();

  const [validations, setValidations] = React.useState<AiFormValidation>({
    error: {},
  });

  const { data: featureEnablementParams = DEFAULT_FEATURE_ENABLEMENT } =
    useGetFeatureEnablementQuery();

  const [formState, dispatch] = useReducer(formReducer, {
    ...featureEnablementParams,
    projectsToDisplay: [],
  });

  const { mutate: updateFeatureEnablement } = useUpdateFeatureEnablementMutation();

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
          if (err.response?.data.relatedField) {
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

  return (
    <div className="sw-flex">
      <div className="sw-flex-grow sw-p-6">
        <Heading as="h2" hasMarginBottom>
          {translate('property.aicodefix.admin.title')}
        </Heading>
        {isEarlyAccess && (
          <PromotedSection
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
        <p>{translate('property.aicodefix.admin.description')}</p>
        <Checkbox
          className="sw-my-6"
          label={translate('property.aicodefix.admin.checkbox.label')}
          checked={formState.enablement !== AiCodeFixFeatureEnablement.disabled}
          onCheck={() => {
            setValidations({ error: {} });
            dispatch({
              type: 'toggle-enablement',
            });
          }}
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
              onChange={(providerKey: LLMProviderKey) => {
                setValidations({ error: {} });
                dispatch({ providerKey, type: 'selectProvider' });
              }}
              value={formState.provider.key}
              width="large"
            />
            <LLMForm
              options={formState.provider}
              onChange={(provider) => {
                dispatch({ type: 'setProvider', provider });
              }}
              validation={validations}
              isFirstSetup={
                featureEnablementParams.provider === null ||
                featureEnablementParams.provider.key === 'OPENAI'
              }
            />
          </div>
        )}

        <div className="sw-ml-6 sw-mt-6">
          {formState.enablement !== AiCodeFixFeatureEnablement.disabled && (
            <RadioButtonGroup
              label={translate('property.aicodefix.admin.enable.title')}
              id="ai-code-fix-enablement"
              isRequired
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
              onChange={() => dispatch({ type: 'switch-enablement' })}
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
                selectedElements={projects
                  .filter((p) => formState.enabledProjectKeys.includes(p.key))
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
              onClick={handleAiCodeFixUpdate}
              variety={ButtonVariety.Primary}
              isLoading={isLoading}
            >
              <FormattedMessage defaultMessage={translate('save')} id="save" />
            </Button>
            <ModalAlert
              description={translate('aicodefix.cancel.modal.description')}
              primaryButton={
                <Button variety="primary" onClick={handleCancel}>
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
    </div>
  );
}

function groupBySelfHosted(providersArray: LLMProvider[]) {
  const groups = groupBy(providersArray, (m) => m.selfHosted);

  return Object.keys(groups).map((group) => {
    const items = sortBy(
      groups[group].map((m) => ({
        value: m.key,
        label: m.name,
        suffix: m.recommended ? <Badge variant="counter">{translate('recommended')}</Badge> : null,
      })),
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
