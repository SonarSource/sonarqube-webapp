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

import { MessageInline, MessageVariety, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { ContentCell, TableRow } from '~design-system';
import InstanceMessage from '~sq-server-commons/components/common/InstanceMessage';
import { Permission } from '~sq-server-commons/types/types';

interface Props {
  permissions: Permission[];
}

export default function ListHeader({ permissions }: Readonly<Props>) {
  const intl = useIntl();

  const cells = permissions.map((permission) => (
    <ContentCell key={permission.key}>
      <span>{intl.formatMessage({ id: `projects_role.${permission.key}` })}</span>
      <ToggleTip className="sw-ml-2" description={renderTooltip({ permission, intl })} />
    </ContentCell>
  ));

  return (
    <TableRow>
      <ContentCell>
        <FormattedMessage id="projects_role.template_name" />
      </ContentCell>
      {cells}
      <ContentCell>&nbsp;</ContentCell>
    </TableRow>
  );
}

function renderTooltip({ permission, intl }: { intl: IntlShape; permission: Permission }) {
  return permission.key === 'user' || permission.key === 'codeviewer' ? (
    <div>
      <InstanceMessage
        message={intl.formatMessage({ id: `projects_role.${permission.key}.desc` })}
      />
      <MessageInline className="sw-mt-2" variety={MessageVariety.Warning}>
        <FormattedMessage id="projects_role.public_projects_warning" />
      </MessageInline>
    </div>
  ) : (
    <InstanceMessage message={intl.formatMessage({ id: `projects_role.${permission.key}.desc` })} />
  );
}
