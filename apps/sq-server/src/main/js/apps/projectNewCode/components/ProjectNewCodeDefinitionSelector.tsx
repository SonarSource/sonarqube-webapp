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
  ButtonGroup,
  ButtonVariety,
  Heading,
  HeadingSize,
  MessageInline,
  MessageVariety,
  SelectionCards,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import NewCodeDefinitionSpecificGroup from '~sq-server-commons/components/new-code-definition/NewCodeDefinitionSpecificGroup';
import {
  NewCodeDefinitionLevels,
  validateSetting,
} from '~sq-server-commons/components/new-code-definition/utils';
import { Branch } from '~sq-server-commons/types/branch-like';
import {
  NewCodeDefinition,
  NewCodeDefinitionType,
} from '~sq-server-commons/types/new-code-definition';

export interface ProjectBaselineSelectorProps {
  analysis?: string;
  branch?: Branch;
  branchList: Branch[];
  branchesEnabled?: boolean;
  component: string;
  days: string;
  globalNewCodeDefinition: NewCodeDefinition;
  isChanged: boolean;
  onCancel: () => void;
  onSelectDays: (value: string) => void;
  onSelectReferenceBranch: (value: string) => void;
  onSelectSetting: (value: NewCodeDefinitionType) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onToggleSpecificSetting: (selection: boolean) => void;
  overrideGlobalNewCodeDefinition: boolean;
  previousNonCompliantValue?: string;
  projectNcdUpdatedAt?: number;
  referenceBranch?: string;
  saving: boolean;
  selectedNewCodeDefinitionType?: NewCodeDefinitionType;
}

export default function ProjectNewCodeDefinitionSelector(
  props: Readonly<ProjectBaselineSelectorProps>,
) {
  const intl = useIntl();
  const {
    analysis,
    branch,
    branchesEnabled,
    branchList,
    component,
    days,
    globalNewCodeDefinition,
    isChanged,
    overrideGlobalNewCodeDefinition,
    previousNonCompliantValue,
    projectNcdUpdatedAt,
    referenceBranch,
    saving,
    selectedNewCodeDefinitionType,
  } = props;

  const isValid = validateSetting({
    numberOfDays: days,
    overrideGlobalNewCodeDefinition,
    referenceBranch,
    selectedNewCodeDefinitionType,
  });

  if (branch === undefined) {
    return null;
  }

  return (
    <>
      <Heading
        as="h2"
        className="sw-mb-2 sw-mt-4"
        id="selection-cards-label"
        size={HeadingSize.Medium}
      >
        <FormattedMessage id="project_baseline.page.selection.label" />
      </Heading>
      <form className="it__project-baseline-selector" onSubmit={props.onSubmit}>
        <SelectionCards
          ariaLabelledBy="selection-cards-label"
          onChange={(value: 'general' | 'specific') => {
            props.onToggleSpecificSetting(value === 'specific');
          }}
          options={[
            {
              value: 'general',
              label: intl.formatMessage({ id: 'project_baseline.global_setting' }),
              helpText: (
                <FormattedMessage
                  id="project_baseline.global_setting.description"
                  values={{
                    default: (
                      <FormattedMessage
                        id={
                          globalNewCodeDefinition.type === NewCodeDefinitionType.NumberOfDays
                            ? 'new_code_definition.number_days'
                            : 'new_code_definition.previous_version'
                        }
                      />
                    ),
                  }}
                />
              ),
            },
            {
              value: 'specific',
              label: intl.formatMessage({ id: 'project_baseline.specific_setting' }),
              helpText: (
                <span id="specific-definition-label">
                  <FormattedMessage
                    id="project_baseline.specific_setting.description"
                    values={{
                      b: (text) => (
                        <Text isHighlighted size={TextSize.Small}>
                          {text}
                        </Text>
                      ),
                    }}
                  />
                </span>
              ),
            },
          ]}
          value={overrideGlobalNewCodeDefinition ? 'specific' : 'general'}
        />

        {overrideGlobalNewCodeDefinition && (
          <NewCodeDefinitionSpecificGroup
            analysis={analysis}
            ariaLabelledBy="specific-definition-label"
            branch={branch.name}
            branchList={branchList}
            branchesEnabled={branchesEnabled}
            className="sw-mt-6"
            isValid={isValid}
            numberOfDaysInput={days}
            onNumberOfDaysChange={props.onSelectDays}
            onReferenceBranchChange={props.onSelectReferenceBranch}
            onTypeChange={props.onSelectSetting}
            previousNonCompliantValue={previousNonCompliantValue}
            projectKey={component}
            referenceBranchInput={referenceBranch}
            settingsLevel={NewCodeDefinitionLevels.Project}
            typeValue={selectedNewCodeDefinitionType}
            updatedAt={projectNcdUpdatedAt}
          />
        )}

        {isChanged && (
          <>
            <ButtonGroup className="sw-flex sw-mt-6">
              <Button
                isDisabled={!isValid || saving}
                isLoading={saving}
                type="submit"
                variety={ButtonVariety.Primary}
              >
                <FormattedMessage id="save" />
              </Button>

              <Button isDisabled={saving} onClick={props.onCancel}>
                <FormattedMessage id="cancel" />
              </Button>
            </ButtonGroup>
            <MessageInline className="sw-mt-2" variety={MessageVariety.Info}>
              <FormattedMessage id="baseline.next_analysis_notice" />
            </MessageInline>
          </>
        )}
      </form>
    </>
  );
}
