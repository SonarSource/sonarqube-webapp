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

import { ContentCell, TableRow } from '~design-system';
import { PermissionTemplate } from '~sq-server-commons/types/types';
import ActionsCell from './ActionsCell';
import NameCell from './NameCell';
import PermissionCell from './PermissionCell';

interface Props {
  refresh: () => Promise<void>;
  template: PermissionTemplate;
  topQualifiers: string[];
}

export default function ListItem(props: Props) {
  const permissions = props.template.permissions.map((p) => (
    <PermissionCell key={p.key} permission={p} />
  ));

  return (
    <TableRow data-id={props.template.id} data-name={props.template.name}>
      <NameCell template={props.template} />

      {permissions}

      <ContentCell>
        <ActionsCell
          permissionTemplate={props.template}
          refresh={props.refresh}
          topQualifiers={props.topQualifiers}
        />
      </ContentCell>
    </TableRow>
  );
}
