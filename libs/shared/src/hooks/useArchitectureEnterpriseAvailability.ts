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
import { useFlags } from '~adapters/helpers/feature-flags';
import { useArchitectureEntitlement } from '~adapters/helpers/useArchitectureEntitlement';
import { useArchitectureFlags } from '~adapters/helpers/useArchitectureFlags';
import { useIsArchitectureFeatureAdvertised } from '~adapters/helpers/useIsArchitectureFeatureAdvertised';

export interface ArchitectureEnterpriseAvailability {
  isArchitectureEnterpriseActive: boolean;
  isArchitectureEnterpriseAvailable: boolean;
  isLoading: boolean;
}

export function useArchitectureEnterpriseAvailability(): ArchitectureEnterpriseAvailability {
  const { designArchitectureSquadExtensionPack } = useFlags();
  const isAdvertised = useIsArchitectureFeatureAdvertised();
  const { isEntitledToArchitecture, isLoading: isEntitlementLoading } =
    useArchitectureEntitlement();
  const { architectureEnterpriseEnabled, isLoading: isSettingLoading } = useArchitectureFlags();

  return useMemo(() => {
    const isArchitectureEnterpriseAvailable =
      designArchitectureSquadExtensionPack === true && isAdvertised && isEntitledToArchitecture;

    return {
      isArchitectureEnterpriseActive:
        isArchitectureEnterpriseAvailable && architectureEnterpriseEnabled,
      isArchitectureEnterpriseAvailable,
      isLoading: isEntitlementLoading || isSettingLoading,
    };
  }, [
    designArchitectureSquadExtensionPack,
    isAdvertised,
    isEntitledToArchitecture,
    architectureEnterpriseEnabled,
    isEntitlementLoading,
    isSettingLoading,
  ]);
}
