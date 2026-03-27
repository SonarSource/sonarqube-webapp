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

import { sortBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { ActionCell, ContentCell, Table, TableRow } from '~design-system';
import { WebhookResponse, WebhookUpdatePayload } from '~sq-server-commons/types/webhook';
import WebhookItem from './WebhookItem';

interface Props {
  onDelete: (webhook: string) => Promise<void>;
  onUpdate: (data: WebhookUpdatePayload) => Promise<void>;
  webhooks: WebhookResponse[];
}

const COLUMN_WIDTHS = ['auto', 'auto', 'auto', 'auto', '5%'];

export default function WebhooksList({ webhooks, onDelete, onUpdate }: Props) {
  if (webhooks.length < 1) {
    return (
      <p className="it__webhook-empty-list">
        <FormattedMessage id="webhooks.no_result" />
      </p>
    );
  }

  const tableHeader = (
    <TableRow>
      <ContentCell>
        <FormattedMessage id="name" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="webhooks.url" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="webhooks.secret_header" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="webhooks.last_execution" />
      </ContentCell>
      <ActionCell>
        <FormattedMessage id="actions" />
      </ActionCell>
    </TableRow>
  );

  return (
    <Table
      className="it__webhooks-list"
      columnCount={COLUMN_WIDTHS.length}
      columnWidths={COLUMN_WIDTHS}
      header={tableHeader}
      noHeaderTopBorder
    >
      {sortBy(webhooks, (webhook) => webhook.name.toLowerCase()).map((webhook) => (
        <WebhookItem key={webhook.key} onDelete={onDelete} onUpdate={onUpdate} webhook={webhook} />
      ))}
    </Table>
  );
}
