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

import { Checkbox, LinkHighlight, LinkStandalone } from '@sonarsource/echoes-react';
import { ActionCell, Badge, ContentCell, Note, TableRow } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import { Project } from '~sq-server-shared/api/project-management';
import PrivacyBadgeContainer from '~sq-server-shared/components/common/PrivacyBadgeContainer';
import Tooltip from '~sq-server-shared/components/controls/Tooltip';
import DateFormatter from '~sq-server-shared/components/intl/DateFormatter';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { getComponentOverviewUrl } from '~sq-server-shared/helpers/urls';
import { useGithubProvisioningEnabledQuery } from '~sq-server-shared/queries/identity-provider/github';
import { useGilabProvisioningEnabledQuery } from '~sq-server-shared/queries/identity-provider/gitlab';
import { LoggedInUser } from '~sq-server-shared/types/users';
import ProjectRowActions from './ProjectRowActions';

interface Props {
  currentUser: Pick<LoggedInUser, 'login'>;
  onProjectCheck: (project: Project, checked: boolean) => void;
  project: Project;
  selected: boolean;
}

export default function ProjectRow(props: Readonly<Props>) {
  const { currentUser, project, selected } = props;
  const { data: githubProvisioningEnabled } = useGithubProvisioningEnabledQuery();
  const { data: gitlabProbivisioningEnabled } = useGilabProvisioningEnabledQuery();

  const handleProjectCheck = (checked: boolean) => {
    props.onProjectCheck(project, checked);
  };

  return (
    <TableRow data-project-key={project.key}>
      <ContentCell>
        <Checkbox
          ariaLabel={translateWithParameters('projects_management.select_project', project.name)}
          checked={selected}
          onCheck={handleProjectCheck}
        />
      </ContentCell>
      <ContentCell className="it__project-row-text-cell">
        <LinkStandalone
          highlight={LinkHighlight.CurrentColor}
          to={getComponentOverviewUrl(project.key, project.qualifier)}
        >
          <Tooltip content={project.name} side="left">
            <span>{project.name}</span>
          </Tooltip>
        </LinkStandalone>
        {project.qualifier === ComponentQualifier.Project &&
          (githubProvisioningEnabled || gitlabProbivisioningEnabled) &&
          !project.managed && <Badge className="sw-ml-1">{translate('local')}</Badge>}
      </ContentCell>
      <ContentCell>
        <PrivacyBadgeContainer qualifier={project.qualifier} visibility={project.visibility} />
      </ContentCell>
      <ContentCell className="it__project-row-text-cell">
        <Tooltip content={project.key} side="left">
          <Note>{project.key}</Note>
        </Tooltip>
      </ContentCell>
      <ContentCell>
        {project.lastAnalysisDate ? (
          <DateFormatter date={project.lastAnalysisDate} />
        ) : (
          <Note>—</Note>
        )}
      </ContentCell>
      <ActionCell>
        <ProjectRowActions currentUser={currentUser} project={project} />
      </ActionCell>
    </TableRow>
  );
}
