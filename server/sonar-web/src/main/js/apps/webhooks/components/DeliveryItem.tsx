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

import { CodeSnippet, Spinner } from '~design-system';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import { WebhookDelivery } from '~sq-server-shared/types/webhook';
import { formatPayload } from '../utils';

interface Props {
  className?: string;
  delivery: WebhookDelivery;
  loading: boolean;
  payload: string | undefined;
}

export default function DeliveryItem({ className, delivery, loading, payload }: Props) {
  return (
    <div className={className}>
      <p className="sw-mb-2">
        {translateWithParameters(
          'webhooks.delivery.response_x',
          delivery.httpStatus ?? translate('webhooks.delivery.server_unreachable'),
        )}
      </p>
      <p className="sw-mb-2">
        {translateWithParameters(
          'webhooks.delivery.duration_x',
          formatMeasure(delivery.durationMs, 'MILLISEC'),
        )}
      </p>
      <p className="sw-mb-2">{translate('webhooks.delivery.payload')}</p>
      <Spinner loading={loading}>
        {payload !== undefined && (
          <CodeSnippet
            className="sw-p-2 sw-max-h-abs-200 sw-overflow-y-scroll"
            noCopy
            snippet={formatPayload(payload)}
          />
        )}
      </Spinner>
    </div>
  );
}
