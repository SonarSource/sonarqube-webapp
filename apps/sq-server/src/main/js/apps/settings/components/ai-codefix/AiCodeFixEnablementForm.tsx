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
  Text,
} from '@sonarsource/echoes-react';
import { find, isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Note } from '~design-system';
import { LLMOption, UpdateFeatureEnablementParams } from '~sq-server-shared/api/fix-suggestions';
import SelectList, {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-shared/components/controls/SelectList';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getAiCodeFixTermsOfServiceUrl } from '~sq-server-shared/helpers/urls';
import { useUpdateFeatureEnablementMutation } from '~sq-server-shared/queries/fix-suggestions';
import { useGetAllProjectsQuery } from '~sq-server-shared/queries/project-managements';
import { useGetValueQuery } from '~sq-server-shared/queries/settings';
import { AiCodeFixFeatureEnablement } from '~sq-server-shared/types/fix-suggestions';
import { SettingsKey } from '~sq-server-shared/types/settings';
import PromotedSection from '../../../overview/branches/PromotedSection';

const AI_CODE_FIX_SETTING_KEY = SettingsKey.CodeSuggestion;

interface AiCodeFixEnablementFormProps {
  isEarlyAccess?: boolean;
}

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

  // Todo use in the form
  const [llmOption, setLlmOption] = React.useState<LLMOption>({ key: 'OPEN_AI' });

  // TODO GET the featureEnablement;
  const featureEnablementParams: UpdateFeatureEnablementParams = {
    changes: {
      disabledProjectKeys: [],
      enabledProjectKeys: [],
    },
    enablement: currentAiCodeFixEnablement,
    provider: llmOption,
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

    // TODO change this when integrating with API
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
      provider: llmOption,
    });
  };

  const handleCancel = () => {
    if (aiCodeFixSetting) {
      setCurrentAiCodeFixEnablement(aiCodeFixSetting.value as AiCodeFixFeatureEnablement);
      setCurrentSelectedProjects(featureEnablementParams.changes.enabledProjectKeys ?? []);
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
                  ))
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
                  ))
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
