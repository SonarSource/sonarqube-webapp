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
import { NewCodeDefinitionType } from '../../../types/new-code-definition';
import { AbstractServiceMock } from '../AbstractServiceMock';

/** SonarQube Cloud derives the NCD from these generic project settings. */
const LEAK_PERIOD_KEY = 'sonar.leak.period';
const LEAK_PERIOD_TYPE_KEY = 'sonar.leak.period.type';

/**
 * Maps the shared (logical) NCD type to each product's own vocabulary. The map is the inverse
 * of the `*_TO_SHARED_TYPE_MAP` used by the `quality-gate-history` adapters. Types absent from a
 * product fall back in the handlers — only the previous-version distinction matters for callers.
 */
const SHARED_TO_SERVER_TYPE: Partial<Record<NewCodeDefinitionType, string>> = {
  [NewCodeDefinitionType.PreviousVersion]: 'PREVIOUS_VERSION',
  [NewCodeDefinitionType.NumberOfDays]: 'NUMBER_OF_DAYS',
  [NewCodeDefinitionType.SpecificVersion]: 'SPECIFIC_ANALYSIS',
};

const SHARED_TO_CLOUD_TYPE: Partial<Record<NewCodeDefinitionType, string>> = {
  [NewCodeDefinitionType.PreviousVersion]: 'previous_version',
  [NewCodeDefinitionType.NumberOfDays]: 'days',
  [NewCodeDefinitionType.SpecificVersion]: 'version',
  [NewCodeDefinitionType.SpecificDate]: 'date',
};

export interface NewCodeDefinitionServiceData {
  /** The logical NCD type; each handler renders it into its product-specific response. */
  type: NewCodeDefinitionType;
  value?: string;
}

export class NewCodeDefinitionServiceMock extends AbstractServiceMock<NewCodeDefinitionServiceData> {
  handlers = [
    // SonarQube Server: browse-readable per-branch list
    http.get('/api/new_code_periods/list', ({ request }) => {
      return this.ok({
        newCodePeriods: [
          {
            projectKey: this.getQueryParams(request).get('project') ?? undefined,
            branchKey: 'master',
            type: SHARED_TO_SERVER_TYPE[this.data.type] ?? 'NUMBER_OF_DAYS',
            value: this.data.value ?? '',
            inherited: true,
          },
        ],
      });
    }),

    // SonarQube Cloud: derived from the generic `/api/settings/values`. This endpoint is shared by
    // many mocks, so we answer ONLY when the NCD settings are requested and otherwise return
    // `undefined`, letting MSW fall through to the next matching handler (e.g. a SettingsServiceMock).
    // Register this mock before any catch-all settings mock for the fall-through to take effect.
    http.get('/api/settings/values', ({ request }) => {
      const keys = this.getQueryParams(request).get('keys')?.split(',') ?? [];

      if (!keys.includes(LEAK_PERIOD_TYPE_KEY)) {
        return undefined;
      }

      return this.ok({
        settings: [
          { key: LEAK_PERIOD_TYPE_KEY, value: SHARED_TO_CLOUD_TYPE[this.data.type] ?? 'days' },
          // `normalizeSettingsToNewCodeDefinition` requires a truthy value alongside the type.
          { key: LEAK_PERIOD_KEY, value: this.data.value ?? this.data.type },
        ],
      });
    }),
  ];
}

export const NewCodeDefinitionServiceDefaultDataset: NewCodeDefinitionServiceData = {
  type: NewCodeDefinitionType.PreviousVersion,
};
