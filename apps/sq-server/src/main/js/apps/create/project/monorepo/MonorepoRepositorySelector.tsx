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
  Label,
  LinkHighlight,
  LinkStandalone,
  MessageCallout,
  MessageVariety,
  SelectAsync,
} from '@sonarsource/echoes-react';
import { ComponentProps } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GroupBase } from 'react-select';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { LabelValueSelectOption } from '~sq-server-commons/helpers/search';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';

type SelectData = ComponentProps<typeof SelectAsync>['data'];

interface Props {
  almKey: AlmKeys;
  alreadyBoundProjects: {
    projectId: string;
    projectName: string;
  }[];
  error: boolean;
  isFetchingAlreadyBoundProjects: boolean;
  isLoadingAlreadyBoundProjects: boolean;
  loadingRepositories: boolean;
  onSearchRepositories: (query: string) => void;
  onSelectRepository: (repositoryKey: string) => void;
  repositoryOptions?: LabelValueSelectOption[] | GroupBase<LabelValueSelectOption>[];
  repositorySearchQuery: string;
  selectedOrganization?: LabelValueSelectOption;
  selectedRepository?: LabelValueSelectOption;
  showOrganizations?: boolean;
}

export function MonorepoRepositorySelector({
  almKey,
  alreadyBoundProjects,
  error,
  isFetchingAlreadyBoundProjects,
  isLoadingAlreadyBoundProjects,
  loadingRepositories,
  onSearchRepositories,
  onSelectRepository,
  repositorySearchQuery,
  repositoryOptions,
  selectedOrganization,
  selectedRepository,
  showOrganizations,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const repositorySelectorEnabled =
    !error &&
    !loadingRepositories &&
    ((showOrganizations && !!selectedOrganization) || !showOrganizations);
  const repositoryData = toSelectData(repositoryOptions, selectedRepository);
  const showWarningMessage =
    error ||
    (repositorySelectorEnabled && repositoryOptions?.length === 0 && repositorySearchQuery === '');

  return (
    <>
      <Label
        className="sw:mb-2"
        htmlFor={`${almKey}-monorepo-choose-repository`}
        id={`${almKey}-monorepo-choose-repository-label`}
      >
        <FormattedMessage id="onboarding.create_project.monorepo.choose_repository" />
      </Label>
      {showWarningMessage ? (
        <FormattedMessage
          id="onboarding.create_project.monorepo.no_projects"
          values={{
            almKey: formatMessage({ id: `alm.${almKey}` }),
          }}
        />
      ) : (
        <>
          <SelectAsync
            ariaLabelledBy={`${almKey}-monorepo-choose-repository-label`}
            className="sw:w-abs-400"
            data={repositoryData}
            id={`${almKey}-monorepo-choose-repository`}
            isLoading={loadingRepositories}
            isNotClearable
            labelNotFound={formatMessage({ id: 'no_results' })}
            onChange={(value: string | null) => {
              if (value !== null) {
                onSelectRepository(value);
              }
            }}
            onSearch={onSearchRepositories}
            placeholder={formatMessage({
              id: `onboarding.create_project.monorepo.choose_repository.placeholder`,
            })}
            value={selectedRepository?.value ?? null}
            width="full"
          />
          {selectedRepository &&
            !isLoadingAlreadyBoundProjects &&
            !isFetchingAlreadyBoundProjects && (
              <MessageCallout className="sw:mt-4 sw:w-abs-400" variety={MessageVariety.Info}>
                {alreadyBoundProjects.length === 0 ? (
                  <FormattedMessage id="onboarding.create_project.monorepo.choose_repository.no_already_bound_projects" />
                ) : (
                  <div>
                    <FormattedMessage id="onboarding.create_project.monorepo.choose_repository.existing_already_bound_projects" />
                    <ul className="sw:mt-4">
                      {alreadyBoundProjects.map(({ projectId, projectName }) => (
                        <li key={projectId}>
                          <LinkStandalone
                            highlight={LinkHighlight.Subtle}
                            to={getProjectOverviewUrl(projectId)}
                          >
                            {projectName}
                          </LinkStandalone>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </MessageCallout>
            )}
        </>
      )}
    </>
  );
}

function isGroup(
  option: LabelValueSelectOption | GroupBase<LabelValueSelectOption>,
): option is GroupBase<LabelValueSelectOption> {
  return 'options' in option;
}

// Echoes selects expect `{ group, items }` groups. The selected repository is always kept in the
// data, otherwise it would not be displayed once a search filters it out of the options.
function toSelectData(
  options: Props['repositoryOptions'],
  selectedRepository?: LabelValueSelectOption,
): SelectData {
  const data: SelectData = (options ?? []).map((option) =>
    isGroup(option)
      ? {
          group: option.label ?? '',
          items: option.options.map(({ label, value }) => ({ label, value })),
        }
      : { label: option.label, value: option.value },
  );

  const isSelectedAvailable =
    selectedRepository === undefined ||
    data.some((entry) =>
      'group' in entry && entry.group !== undefined
        ? entry.items.some(({ value }) => value === selectedRepository.value)
        : 'value' in entry && entry.value === selectedRepository.value,
    );

  return isSelectedAvailable
    ? data
    : [...data, { label: selectedRepository.label, value: selectedRepository.value }];
}
