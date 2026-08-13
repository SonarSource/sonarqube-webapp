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

import { useMemo } from 'react';
import { useListRulesQuery } from '../../queries/rules';
import type { DashboardRuleMetadataByKey } from './dashboard-widget-adapter-types';

export type DashboardRuleLabelsEntity =
  | { isResolvingOrganization: boolean; organization: string | undefined; type: 'PORTFOLIO' }
  | { organization: string; type: 'PROJECT' };

function toRuleMetadata(
  response: { rules?: ReadonlyArray<{ key: string; langName?: string; name: string }> } | undefined,
): DashboardRuleMetadataByKey {
  return Object.fromEntries(
    (response?.rules ?? []).map((rule) => [rule.key, { langName: rule.langName, name: rule.name }]),
  );
}

export function useDashboardRuleLabels(args: {
  enabled?: boolean;
  entity: DashboardRuleLabelsEntity;
  ruleKeys: readonly string[];
}): {
  isError: boolean;
  isPending: boolean;
  organization: string | undefined;
  rulesByKey: DashboardRuleMetadataByKey;
} {
  const { enabled = true, entity, ruleKeys } = args;
  const filteredRuleKeys = useMemo(
    () => ruleKeys.filter((key) => !key.startsWith('OTHER_')),
    [ruleKeys],
  );
  const queryEnabled = enabled && filteredRuleKeys.length > 0;
  const organization = entity.organization || undefined;

  const { data, isError, isPending } = useListRulesQuery(
    { rule_key: filteredRuleKeys.join(), ps: filteredRuleKeys.length },
    {
      enabled: queryEnabled,
      select: toRuleMetadata,
    },
  );

  return {
    isError: queryEnabled && isError,
    isPending: queryEnabled && isPending,
    organization,
    rulesByKey: data ?? {},
  };
}
