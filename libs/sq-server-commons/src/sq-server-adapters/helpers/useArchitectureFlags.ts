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

import { useMutation } from '@tanstack/react-query';
import { useFlags } from '~adapters/helpers/feature-flags';
import { ArchitectureFlags } from '~shared/helpers/architecture';
import { useGetValueQuery, useSaveSimpleValueMutation } from '../../queries/settings';
import { SettingsKey } from '../../types/settings';
import { useArchitectureEntitlement } from './useArchitectureEntitlement';
import { useIsArchitectureFeatureAdvertised } from './useIsArchitectureFeatureAdvertised';

export function useArchitectureFlags(): ArchitectureFlags {
  const flags = useFlags();
  const { isEntitledToArchitecture } = useArchitectureEntitlement();
  const isAdvertised = useIsArchitectureFeatureAdvertised();
  const enabled =
    flags.designArchitectureSquadExtensionPack === true && isEntitledToArchitecture && isAdvertised;
  const { data: architectureEnterpriseEnabledSetting, isLoading } = useGetValueQuery(
    { key: SettingsKey.ArchitectureEnterpriseEnabled },
    { enabled },
  );

  return {
    architectureEnterpriseEnabled:
      enabled && architectureEnterpriseEnabledSetting?.value !== 'false',
    designArchitectureSquadExtensionPack: false,
    designArchitectureSquadPerformanceLimits: flags.designArchitectureSquadPerformanceLimits,
    isCurrentOrganizationMember: true,
    isLoading: enabled && isLoading,
  };
}

export function useSetArchitectureEnterpriseEnabledMutation() {
  const mutation = useSaveSimpleValueMutation(false, null);

  return useMutation({
    mutationFn: (value: boolean) =>
      mutation.mutateAsync({
        key: SettingsKey.ArchitectureEnterpriseEnabled,
        value: value.toString(),
      }),
  });
}
