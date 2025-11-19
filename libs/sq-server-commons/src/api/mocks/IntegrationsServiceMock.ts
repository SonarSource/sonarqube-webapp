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

import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import { HttpStatus } from '~shared/types/request';
import { mockIntegrationConfiguration } from '../../helpers/mocks/integrations';
import {
  IntegrationConfiguration,
  IntegrationConfigurationPayload,
  UserBindingType,
} from '../../types/integrations';
import { INTEGRATION_CONFIGURATIONS_PATH, USER_BINDINGS_ENDPOINT_PATH } from '../integrations';

export interface IntegrationsServiceData {
  integrationConfigurations: IntegrationConfiguration[];
}

export const INVALID_CODE = 'invalid_code';

export class IntegrationsServiceMock extends AbstractServiceMock<IntegrationsServiceData> {
  handlers = [
    /*
     * User bindings
     */
    http.post(USER_BINDINGS_ENDPOINT_PATH, async ({ request }) => {
      const body = (await request.json()) as { bindingData: Record<string, unknown>; type: string };
      const { type, bindingData } = body;

      switch (type) {
        case UserBindingType.Slack: {
          const { code } = bindingData as { code: string };

          if (code === INVALID_CODE) {
            return this.errorsWithStatus(HttpStatus.BadRequest, 'Invalid code');
          }

          return this.ok({ bindingData: { appId: 'app-id', teamId: 'team-id' }, type });
        }
        default:
          return this.errorsWithStatus(HttpStatus.BadRequest, 'Incorrect user binding type');
      }
    }),

    /*
     * Integration configurations
     */
    http.get(INTEGRATION_CONFIGURATIONS_PATH, () => {
      return this.ok({
        integrationConfigurations: this.data.integrationConfigurations,
        page: this.paginateResponse(
          'integrationConfigurations',
          this.data.integrationConfigurations,
        ),
      });
    }),

    http.post(INTEGRATION_CONFIGURATIONS_PATH, async ({ request }) => {
      const { integrationType, clientId } =
        (await request.json()) as IntegrationConfigurationPayload;

      const newIntegrationConfiguration = mockIntegrationConfiguration({
        id: `integration-configuration-${integrationType}-${clientId}`,
        integrationType,
        clientId,
      });
      this.data.integrationConfigurations.push(newIntegrationConfiguration);

      return this.ok(newIntegrationConfiguration);
    }),

    http.patch(`${INTEGRATION_CONFIGURATIONS_PATH}/:id`, async ({ params, request }) => {
      const { id } = params;
      const { clientId } = (await request.json()) as IntegrationConfigurationPayload;

      const integrationConfiguration = this.data.integrationConfigurations.find((c) => c.id === id);
      if (!integrationConfiguration) {
        return this.errorsWithStatus(HttpStatus.NotFound, 'Integration configuration not found');
      }

      integrationConfiguration.clientId = clientId;

      return this.ok({
        clientId: integrationConfiguration.clientId,
        id: integrationConfiguration.id,
        integrationType: integrationConfiguration.integrationType,
      });
    }),

    http.delete(`${INTEGRATION_CONFIGURATIONS_PATH}/:id`, ({ params }) => {
      const { id } = params;

      const integrationConfiguration = this.data.integrationConfigurations.find((c) => c.id === id);
      if (!integrationConfiguration) {
        return this.errorsWithStatus(HttpStatus.NotFound, 'Integration configuration not found');
      }
      this.data.integrationConfigurations = this.data.integrationConfigurations.filter(
        (c) => c.id !== id,
      );

      return this.ok({
        id,
      });
    }),
  ];
}

export const integrationsServiceDefaultDataset: IntegrationsServiceData = {
  integrationConfigurations: [],
};
