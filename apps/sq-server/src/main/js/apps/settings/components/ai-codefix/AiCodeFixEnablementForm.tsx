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
  RadioButtonGroup,
  Select,
  Text,
} from '@sonarsource/echoes-react';
import { find, groupBy, isEqual, sortBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Note } from '~design-system';
import {
  LLMOption,
  LLMProvider,
  UpdateFeatureEnablementParams,
} from '~sq-server-shared/api/fix-suggestions';
import SelectList, {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-shared/components/controls/SelectList';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getAiCodeFixTermsOfServiceUrl } from '~sq-server-shared/helpers/urls';
import {
  useGetLlmProvidersQuery,
  useUpdateFeatureEnablementMutation,
} from '~sq-server-shared/queries/fix-suggestions';
import { useGetAllProjectsQuery } from '~sq-server-shared/queries/project-managements';
import { useGetValueQuery } from '~sq-server-shared/queries/settings';
import { AiCodeFixFeatureEnablement } from '~sq-server-shared/types/fix-suggestions';
import { SettingsKey } from '~sq-server-shared/types/settings';
import PromotedSection from '../../../overview/branches/PromotedSection';

const AI_CODE_FIX_SETTING_KEY = SettingsKey.CodeSuggestion;

interface AiCodeFixEnablementFormProps {
  isEarlyAccess?: boolean;
}

export interface AiFormValidation {
  error: { [key: string]: string };
  success: { [key: string]: string };
}
type LLMProviderKey = 'OPEN_AI' | 'AZURE_OPEN_AI';

export default function AiCodeFixEnablementForm({
  isEarlyAccess,
}: Readonly<AiCodeFixEnablementFormProps>) {
  // TODO to be removed after the API changes.
  const { data: aiCodeFixSetting, isLoading: isAiCodeFixSetConfigLoading } = useGetValueQuery({
    key: AI_CODE_FIX_SETTING_KEY,
  });

  const { data: projects = [], isLoading } = useGetAllProjectsQuery();

  const [currentAiCodeFixEnablement, setCurrentAiCodeFixEnablement] = useState(
    (aiCodeFixSetting?.value as AiCodeFixFeatureEnablement) || AiCodeFixFeatureEnablement.disabled,
  );

  const { data: llmOptions } = useGetLlmProvidersQuery();

  // Todo use in the form
  const [validations, setValidations] = React.useState<AiFormValidation>({
    error: {},
    success: {},
  });
  const [selectedLlmOption, setSelectedLlmOption] = useState<LLMProviderKey>('OPEN_AI');

  // TODO GET the featureEnablement;
  const featureEnablementParams: UpdateFeatureEnablementParams = {
    changes: {
      disabledProjectKeys: [],
      enabledProjectKeys: [],
    },
    enablement: currentAiCodeFixEnablement,
    provider: {
      key: 'OPEN_AI',
    },
  };

  const { mutate: updateFeatureEnablement } = useUpdateFeatureEnablementMutation();

  const [currentSelectedProjects, setCurrentSelectedProjects] = useState<string[]>(
    featureEnablementParams?.changes.enabledProjectKeys ?? [],
  );
  const [projectsToDisplay, setProjectsToDisplay] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<SelectListSearchParams>({
    filter: SelectListFilter.All,
    query: '',
  });

  useEffect(() => {
    if (aiCodeFixSetting) {
      setCurrentAiCodeFixEnablement(featureEnablementParams.enablement);
      setCurrentSelectedProjects(featureEnablementParams.changes.enabledProjectKeys ?? []);
      onSearch(searchParams);
    }
  }, [aiCodeFixSetting]);

  useEffect(() => {
    if (projects.length > 0) {
      setProjectsToDisplay(projects.map((p) => p.key));
      onSearch(searchParams);
    }
  }, [projects]);

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
      currentAiCodeFixEnablement === AiCodeFixFeatureEnablement.someProjects
        ? currentSelectedProjects
        : [];

    const provider: LLMOption =
      selectedLlmOption === 'OPEN_AI'
        ? { key: 'OPEN_AI' }
        : { key: 'AZURE_OPEN_AI', apiKey: '', endpoint: '' };

    updateFeatureEnablement({
      enablement: currentAiCodeFixEnablement,
      changes: {
        enabledProjectKeys:
          currentAiCodeFixEnablement === AiCodeFixFeatureEnablement.someProjects &&
          enabledProjectKeys !== undefined
            ? enabledProjectKeys
            : [],
        disabledProjectKeys: [],
      },
      provider,
    });
  };

  const handleCancel = () => {
    if (aiCodeFixSetting) {
      setCurrentAiCodeFixEnablement(aiCodeFixSetting.value as AiCodeFixFeatureEnablement);
      setCurrentSelectedProjects(featureEnablementParams.changes.enabledProjectKeys ?? []);
      setSelectedLlmOption(featureEnablementParams.provider.key as LLMProviderKey);
    }
  };

  const onProjectSelect = (projectKey: string) => {
    setCurrentSelectedProjects((currentSelectedProjects) => [
      ...currentSelectedProjects,
      projectKey,
    ]);
    return Promise.resolve();
  };

  const onProjectUnselect = (projectKey: string) => {
    setCurrentSelectedProjects((currentSelectedProjects) => {
      const updatedProjects = currentSelectedProjects.filter((key) => key !== projectKey);
      return updatedProjects;
    });
    return Promise.resolve();
  };

  const onSearch = (searchParams: SelectListSearchParams) => {
    setSearchParams(searchParams);
    const projectKeys = projects.map((p) => p.key);
    const filteredProjects = searchParams.query
      ? projectKeys.filter((p) => p.toLowerCase().includes(searchParams.query.toLowerCase()))
      : projectKeys;

    const projectsToDisplay = filteredProjects.filter((p) => {
      switch (searchParams.filter) {
        case SelectListFilter.Selected:
          return currentSelectedProjects.includes(p);
        case SelectListFilter.Unselected:
          return !currentSelectedProjects.includes(p);
        default:
          return true;
      }
    });

    setProjectsToDisplay(projectsToDisplay);
    return Promise.resolve();
  };

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
          checked={currentAiCodeFixEnablement !== AiCodeFixFeatureEnablement.disabled}
          onCheck={() =>
            setCurrentAiCodeFixEnablement(
              currentAiCodeFixEnablement === AiCodeFixFeatureEnablement.disabled
                ? AiCodeFixFeatureEnablement.allProjects
                : AiCodeFixFeatureEnablement.disabled,
            )
          }
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
        <div className="sw-ml-6">
          <Select
            data={providerOptionsGrouped}
            helpText={translate('aicodefix.admin.provider.help')}
            id="llm-provider-select"
            isNotClearable
            isRequired
            label={translate('aicodefix.admin.provider.title')}
            onChange={(providerKey) => {
              if (providerKey) {
                setSelectedLlmOption(providerKey as LLMProviderKey);
              }
            }}
            value={selectedLlmOption}
            width="large"
          />
        </div>

        <div className="sw-ml-6 sw-mt-6">
          {currentAiCodeFixEnablement !== AiCodeFixFeatureEnablement.disabled && (
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
              value={currentAiCodeFixEnablement}
              onChange={(enablement: AiCodeFixFeatureEnablement) =>
                setCurrentAiCodeFixEnablement(enablement)
              }
            />
          )}
          {currentAiCodeFixEnablement === AiCodeFixFeatureEnablement.someProjects && (
            <div className="sw-ml-6">
              <div className="sw-flex sw-mb-6 sw-mt-4">
                <IconInfo className="sw-mr-1" color="echoes-color-icon-info" />
                <Text>{translate('property.aicodefix.admin.enable.some.projects.note')}</Text>
              </div>
              <SelectList
                elements={projectsToDisplay}
                elementsTotalCount={projectsToDisplay.length}
                initialSearchParam={searchParams.filter}
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
                  .filter((p) => currentSelectedProjects.includes(p.key))
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
                isAiCodeFixSetConfigLoading ||
                (aiCodeFixSetting?.value === currentAiCodeFixEnablement &&
                  isEqual(
                    featureEnablementParams.changes?.enabledProjectKeys,
                    currentSelectedProjects,
                  ) &&
                  isEqual(featureEnablementParams.provider.key, selectedLlmOption))
              }
              onClick={handleAiCodeFixUpdate}
              variety={ButtonVariety.Primary}
              isLoading={isAiCodeFixSetConfigLoading}
            >
              <FormattedMessage defaultMessage={translate('save')} id="save" />
            </Button>
            <Button
              className="sw-ml-3"
              isDisabled={
                isAiCodeFixSetConfigLoading ||
                (aiCodeFixSetting?.value === currentAiCodeFixEnablement &&
                  isEqual(
                    featureEnablementParams.changes?.enabledProjectKeys,
                    currentSelectedProjects,
                  ) &&
                  isEqual(featureEnablementParams.provider.key, selectedLlmOption))
              }
              onClick={handleCancel}
              variety={ButtonVariety.Default}
            >
              <FormattedMessage defaultMessage={translate('cancel')} id="cancel" />
            </Button>
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
        value: m.providerKey,
        label: m.providerName,
        suffix: m.recommended ? <span>{translate('recommended')}</span> : null,
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
