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

import { Badge, BadgeVariety, Button, Modal, Table, Text } from '@sonarsource/echoes-react';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingProject, OnboardingProjectOnboarding } from '~shared/types/onboarding';
import { composeProjectFilters } from '../../../helpers/onboarding-projects';
import {
  ANY_PROJECTS_FILTER,
  VISIBILITY_FILTER_OPTIONS,
  VisibilityFilterValue,
} from '../../../types/types';
import { ProjectsFilterSelect } from '../../projects/ProjectsFilterSelect';
import { ProjectsTable, ProjectsTableColumn } from '../../projects/ProjectsTable';
import { RepositoryCell } from '../../projects/RepositoryCell';

const PAGE_SIZE = 10;

const COLUMNS: ProjectsTableColumn[] = [
  { labelKey: 'onboarding_dashboard.journey.import.modal.col.repository' },
  {
    className: 'sw-justify-center',
    labelKey: 'onboarding_dashboard.journey.import.modal.col.visibility',
  },
  {
    className: 'sw-justify-center',
    labelKey: 'onboarding_dashboard.journey.import.modal.col.status',
  },
];

interface Props {
  trigger: ReactNode;
}

export function ImportRepositoriesModal({ trigger }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const [isOpen, setIsOpen] = useState(false);
  const [visibility, setVisibility] = useState<VisibilityFilterValue>(ANY_PROJECTS_FILTER);

  const title = formatMessage({ id: 'onboarding_dashboard.journey.import.modal.title' });

  return (
    <Modal
      content={
        <ProjectsTable
          ariaLabel={title}
          columns={COLUMNS}
          containerClassName="sw-max-h-[calc(80vh-10rem)]"
          enabled={isOpen}
          filters={composeProjectFilters([visibility])}
          pageSize={PAGE_SIZE}
          renderRow={(project) => (
            <RepositoryRow key={project.key ?? project.name} project={project} />
          )}
          searchPlaceholderKey="onboarding_dashboard.journey.import.modal.search"
          toolbarControls={
            <ProjectsFilterSelect
              id="import-projects-visibility-filter"
              labelKey="onboarding_dashboard.projects.filter.visibility.label"
              onChange={setVisibility}
              options={VISIBILITY_FILTER_OPTIONS}
              value={visibility}
            />
          }
        />
      }
      onOpenChange={setIsOpen}
      primaryButton={<Button>{formatMessage({ id: 'close' })}</Button>}
      size="wide"
      title={title}
    >
      {trigger}
    </Modal>
  );
}

function RepositoryRow({ project }: Readonly<{ project: OnboardingProject }>) {
  const { formatMessage } = useIntl();
  const isImported = project.onboarding !== OnboardingProjectOnboarding.NotImported;

  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">
        <RepositoryCell project={project} />
      </Table.Cell>
      <Table.Cell>
        <Text>
          {formatMessage({
            id: project.isPrivate ? 'visibility.private' : 'visibility.public',
          })}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Badge variety={isImported ? BadgeVariety.Neutral : BadgeVariety.Warning}>
          {formatMessage({
            id: isImported
              ? 'onboarding_dashboard.journey.import.legend.imported'
              : 'onboarding_dashboard.journey.import.legend.not_imported',
          })}
        </Badge>
      </Table.Cell>
    </Table.Row>
  );
}
