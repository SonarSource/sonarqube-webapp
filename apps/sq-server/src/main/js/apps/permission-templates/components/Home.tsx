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

import { Card, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { Permission, PermissionTemplate } from '~sq-server-commons/types/types';
import HeaderActions from './HeaderActions';
import List from './List';
import ProvisioningWarning from './ProvisioningWarning';

interface Props {
  permissionTemplates: PermissionTemplate[];
  permissions: Permission[];
  ready: boolean;
  refresh: () => Promise<void>;
  topQualifiers: string[];
}

export default function Home(props: Props) {
  const { formatMessage } = useIntl();

  return (
    <AdminPageTemplate
      actions={<HeaderActions ready={props.ready} refresh={props.refresh} />}
      description={
        <Layout.PageHeader.Description>
          <FormattedMessage id="permission_templates.page.description" />
        </Layout.PageHeader.Description>
      }
      title={formatMessage({ id: 'permission_templates.page' })}
      width="fluid"
    >
      <ProvisioningWarning />

      <div>
        <Card>
          <Card.Body>
            <List
              permissionTemplates={props.permissionTemplates}
              permissions={props.permissions}
              refresh={props.refresh}
              topQualifiers={props.topQualifiers}
            />
          </Card.Body>
        </Card>
      </div>
    </AdminPageTemplate>
  );
}
