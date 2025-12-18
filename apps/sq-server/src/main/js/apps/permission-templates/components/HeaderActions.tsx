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

import { Button, ButtonVariety, Layout, Spinner } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { throwGlobalError } from '~adapters/helpers/error';
import { withRouter } from '~shared/components/hoc/withRouter';
import { Router } from '~shared/types/router';
import { createPermissionTemplate } from '~sq-server-commons/api/permissions';
import { PERMISSION_TEMPLATES_PATH } from '../utils';
import Form from './Form';

interface Props {
  ready?: boolean;
  refresh: () => Promise<void>;
  router: Router;
}

function HeaderActions(props: Readonly<Props>) {
  const { ready, router } = props;
  const [createModal, setCreateModal] = useState(false);
  const { formatMessage } = useIntl();

  const handleCreateModalSubmit = async (data: {
    description: string;
    name: string;
    projectKeyPattern: string;
  }) => {
    try {
      const response = await createPermissionTemplate({ ...data });
      await props.refresh();
      router.push({
        pathname: PERMISSION_TEMPLATES_PATH,
        query: { id: response.permissionTemplate.id },
      });
    } catch (e) {
      throwGlobalError(e);
    }
  };

  return (
    <Layout.PageHeader.Actions>
      <Spinner isLoading={!ready}>
        <Button
          onClick={() => {
            setCreateModal(true);
          }}
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="create" />
        </Button>
      </Spinner>

      {createModal && (
        <Form
          confirmButtonText={formatMessage({ id: 'create' })}
          header={formatMessage({ id: 'permission_template.new_template' })}
          onClose={() => {
            setCreateModal(false);
          }}
          onSubmit={handleCreateModalSubmit}
        />
      )}
    </Layout.PageHeader.Actions>
  );
}

export default withRouter(HeaderActions);
