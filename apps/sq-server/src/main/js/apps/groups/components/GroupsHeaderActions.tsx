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

import { Button, ButtonVariety, Layout } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Provider } from '~sq-server-commons/types/types';
import GroupForm from './GroupForm';

interface Props {
  manageProvider: Provider | undefined;
}

export function GroupsHeaderActions({ manageProvider }: Readonly<Props>) {
  const [createModal, setCreateModal] = React.useState(false);

  return (
    <Layout.PageHeader.Actions>
      <Button
        id="groups-create"
        isDisabled={manageProvider !== undefined}
        onClick={() => {
          setCreateModal(true);
        }}
        variety={ButtonVariety.Primary}
      >
        <FormattedMessage id="groups.create_group" />
      </Button>

      {createModal && (
        <GroupForm
          create
          onClose={() => {
            setCreateModal(false);
          }}
        />
      )}
    </Layout.PageHeader.Actions>
  );
}
