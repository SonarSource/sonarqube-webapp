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
  Badge,
  BadgeVariety,
  Button,
  Modal,
  ModalSize,
  Table,
  Text,
} from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingRepository } from '~shared/types/onboarding';
import { RepositoriesTable, RepositoriesTableColumn } from '../../projects/RepositoriesTable';
import { RepositoryCell } from '../../projects/RepositoryCell';

const PAGE_SIZE = 25;

const COLUMNS: RepositoriesTableColumn[] = [
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

export function ImportRepositoriesModal({ children }: Readonly<PropsWithChildren>) {
  const { formatMessage } = useIntl();

  const title = formatMessage({ id: 'onboarding_dashboard.journey.import.modal.title' });

  return (
    <Modal
      content={
        <RepositoriesTable
          ariaLabel={title}
          columns={COLUMNS}
          containerClassName="sw-max-h-[calc(80vh-10rem)]"
          pageSize={PAGE_SIZE}
          renderRow={(repository) => <RepositoryRow key={repository.id} repository={repository} />}
        />
      }
      primaryButton={<Button>{formatMessage({ id: 'close' })}</Button>}
      size={ModalSize.Wide}
      title={title}
    >
      {children}
    </Modal>
  );
}

function RepositoryRow({ repository }: Readonly<{ repository: OnboardingRepository }>) {
  const { formatMessage } = useIntl();
  const { alm, name, slug, isImported, isPrivate } = repository;

  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">
        <RepositoryCell alm={alm} name={name} subtitle={slug} />
      </Table.Cell>
      <Table.Cell>
        <Text>
          {formatMessage({
            id: isPrivate ? 'visibility.private' : 'visibility.public',
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
