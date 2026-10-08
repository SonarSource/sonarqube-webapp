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
  ModalProps,
  ModalSize,
  Table,
  Text,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingRepository } from '~shared/types/onboarding';
import {
  RepositoriesTable,
  RepositoriesTableColumn,
  RepositoriesTableSelection,
} from '../../projects/RepositoriesTable';
import { RepositoryCell } from '../../projects/RepositoryCell';
import { usePlatformSelection } from '../../projects/usePlatformSelection';

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

type Props = ModalProps & {
  selection?: RepositoriesTableSelection;
};

export function ImportRepositoriesModal({ children, selection, ...modalProps }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { hasListablePlatforms } = usePlatformSelection();

  const title = formatMessage({ id: 'onboarding_dashboard.journey.import.modal.title' });

  // Nothing could be listed (e.g. GitHub-only SQ-Server): hide the trigger rather than open an
  // empty modal. See SQRP-806.
  if (!hasListablePlatforms) {
    return null;
  }

  return (
    <Modal
      {...modalProps}
      content={
        <RepositoriesTable
          ariaLabel={title}
          columns={COLUMNS}
          containerClassName="sw-max-h-[calc(80vh-10rem)]"
          pageSize={PAGE_SIZE}
          renderCells={(repository) => <RepositoryCells repository={repository} />}
          selection={selection}
        />
      }
      primaryButton={modalProps.primaryButton ?? <Button>{formatMessage({ id: 'close' })}</Button>}
      size={ModalSize.Wide}
      title={title}
    >
      {children}
    </Modal>
  );
}

function RepositoryCells({ repository }: Readonly<{ repository: OnboardingRepository }>) {
  const { formatMessage } = useIntl();
  const { alm, name, slug, isImported, isPrivate } = repository;

  return (
    <>
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
    </>
  );
}
