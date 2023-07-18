/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getDelivery } from '../../../api/webhooks';
import Modal from '../../../components/controls/Modal';
import { ResetButtonLink } from '../../../components/controls/buttons';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { WebhookDelivery, WebhookResponse } from '../../../types/webhook';
import DeliveryItem from './DeliveryItem';

interface Props {
  delivery: WebhookDelivery;
  onClose: () => void;
  webhook: WebhookResponse;
}

export default function LatestDeliveryForm(props: Props) {
  const { delivery, webhook, onClose } = props;
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<string | undefined>(undefined);

  const header = translateWithParameters('webhooks.latest_delivery_for_x', webhook.name);

  const fetchPayload = useCallback(async () => {
    try {
      const response = await getDelivery({ deliveryId: delivery.id });
      setPayload(response.delivery.payload);
    } finally {
      setLoading(false);
    }
  }, [delivery.id]);

  useEffect(() => {
    fetchPayload();
  }, [fetchPayload]);

  return (
    <Modal contentLabel={header} onRequestClose={onClose}>
      <header className="modal-head">
        <h2>{header}</h2>
      </header>
      <DeliveryItem
        className="modal-body modal-container"
        delivery={delivery}
        loading={loading}
        payload={payload}
      />
      <footer className="modal-foot">
        <ResetButtonLink onClick={onClose}>{translate('close')}</ResetButtonLink>
      </footer>
    </Modal>
  );
}
