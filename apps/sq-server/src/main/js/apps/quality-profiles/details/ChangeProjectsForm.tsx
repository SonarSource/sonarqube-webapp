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

import { Button, Modal, Text } from '@sonarsource/echoes-react';
import { find, without } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ProfileProject, getProfileProjects } from '~sq-server-commons/api/quality-profiles';
import SelectList, {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-commons/components/controls/SelectList';
import {
  useAssociateProjectMutation,
  useDissociateProjectMutation,
} from '~sq-server-commons/queries/quality-profiles';
import { Profile } from '~sq-server-commons/types/quality-profiles';

interface Props {
  profile: Profile;
}

export function ChangeProjectsForm({ profile }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const [lastSearchParams, setLastSearchParams] = React.useState<SelectListSearchParams>();
  const [needToReload, setNeedToReload] = React.useState(false);
  const [projects, setProjects] = React.useState<ProfileProject[]>([]);
  const [projectsTotalCount, setProjectsTotalCount] = React.useState<number>();
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);

  const { mutateAsync: associateProject } = useAssociateProjectMutation();
  const { mutateAsync: dissociateProject } = useDissociateProjectMutation();

  const hasNoActiveRules = profile.activeRuleCount === 0;

  const fetchProjects = (searchParams: SelectListSearchParams) =>
    getProfileProjects({
      key: profile.key,
      p: searchParams.page,
      ps: searchParams.pageSize,
      q: searchParams.query !== '' ? searchParams.query : undefined,
      selected: searchParams.filter,
    }).then((data) => {
      const more = searchParams.page != null && searchParams.page > 1;

      setProjects((prev) => (more ? [...prev, ...data.results] : data.results));
      setProjectsTotalCount(data.paging.total);
      setLastSearchParams(searchParams);
      setNeedToReload(false);

      const newSelectedProjects = data.results
        .filter((project) => project.selected)
        .map((project) => project.key);
      setSelectedProjects((prev) =>
        more ? [...prev, ...newSelectedProjects] : newSelectedProjects,
      );
    });

  const handleSelect = async (key: string) => {
    await associateProject({ profile, projectKey: key });
    setNeedToReload(true);
    setSelectedProjects((prev) => [...prev, key]);
  };

  const handleUnselect = async (key: string) => {
    await dissociateProject({ profile, projectKey: key });
    setNeedToReload(true);
    setSelectedProjects((prev) => without(prev, key));
  };

  const renderElement = (key: string): React.ReactNode => {
    const project = find(projects, { key });
    return (
      <>
        {project === undefined ? (
          key
        ) : (
          <>
            {project.name}
            <br />
            <Text isSubtle>{project.key}</Text>
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      content={
        <div className="sw-mt-1" id="profile-projects">
          <SelectList
            allowBulkSelection
            elements={projects.map((project) => project.key)}
            elementsTotalCount={projectsTotalCount}
            labelAll={formatMessage({ id: 'quality_gates.projects.all' })}
            labelSelected={formatMessage({ id: 'quality_gates.projects.with' })}
            labelUnselected={formatMessage({ id: 'quality_gates.projects.without' })}
            needToReload={
              needToReload &&
              lastSearchParams !== undefined &&
              lastSearchParams.filter !== SelectListFilter.All
            }
            onSearch={fetchProjects}
            onSelect={handleSelect}
            onUnselect={handleUnselect}
            renderElement={renderElement}
            selectedElements={selectedProjects}
            withPaging
          />
        </div>
      }
      secondaryButton={
        <Button>
          <FormattedMessage id="close" />
        </Button>
      }
      // eslint-disable-next-line local-rules/use-metrickey-enum
      title={formatMessage({ id: 'projects' })}
    >
      <Button className="it__quality-profiles__change-projects" isDisabled={hasNoActiveRules}>
        <FormattedMessage id="quality_profiles.change_projects" />
      </Button>
    </Modal>
  );
}

export default ChangeProjectsForm;
