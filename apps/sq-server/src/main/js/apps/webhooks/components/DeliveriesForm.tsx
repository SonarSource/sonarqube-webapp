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

import { Spinner } from '@sonarsource/echoes-react';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from '~design-system';
import ListFooter from '~shared/components/controls/ListFooter';
import { Paging } from '~shared/types/paging';
import { searchDeliveries } from '~sq-server-commons/api/webhooks';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { WebhookDelivery, WebhookResponse } from '~sq-server-commons/types/webhook';
import DeliveryAccordion from './DeliveryAccordion';

interface Props {
  onClose: () => void;
  webhook: WebhookResponse;
}

const PAGE_SIZE = 10;

export default function DeliveriesForm({ onClose, webhook }: Props) {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [paging, setPaging] = useState<Paging | undefined>(undefined);

  const header = translateWithParameters('webhooks.deliveries_for_x', webhook.name);

  const fetchDeliveries = useCallback(async () => {
    try {
      const { deliveries, paging } = await searchDeliveries({
        webhook: webhook.key,
        ps: PAGE_SIZE,
      });
      setDeliveries(deliveries);
      setPaging(paging);
    } finally {
      setLoading(false);
    }
  }, [webhook.key]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  async function fetchMoreDeliveries() {
    if (paging) {
      setLoading(true);
      try {
        const response = await searchDeliveries({
          webhook: webhook.key,
          p: paging.pageIndex + 1,
          ps: PAGE_SIZE,
        });
        setDeliveries((deliveries) => [...deliveries, ...response.deliveries]);
        setPaging(response.paging);
      } finally {
        setLoading(false);
      }
    }
  }

  const formBody = (
    <Spinner isLoading={loading}>
      {deliveries.map((delivery) => (
        <DeliveryAccordion delivery={delivery} key={delivery.id} />
      ))}
      {paging !== undefined && (
        <ListFooter
          className="sw-mb-2"
          count={deliveries.length}
          loadMore={fetchMoreDeliveries}
          ready={!loading}
          total={paging.total}
        />
      )}
    </Spinner>
  );

  return (
    <Modal
      body={formBody}
      headerTitle={header}
      onClose={onClose}
      secondaryButtonLabel={translate('close')}
    />
  );
}
