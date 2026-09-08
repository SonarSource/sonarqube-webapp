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

import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getComponentConfiguration } from '../api/navigation';
import { createQueryHook, StaleTime } from './common';

const COMPONENT_CONFIGURATION_QUERY_KEY = 'component-configuration';

export const useComponentConfigurationQuery = createQueryHook((component: string) =>
  queryOptions({
    queryKey: [COMPONENT_CONFIGURATION_QUERY_KEY, component] as const,
    queryFn: () => getComponentConfiguration(component),
    staleTime: StaleTime.LONG,
  }),
);

/** Granting or revoking a permission changes what the configuration reports. */
export function useInvalidateComponentConfiguration() {
  const queryClient = useQueryClient();

  return useCallback(
    async (component: string) =>
      queryClient.invalidateQueries({
        queryKey: [COMPONENT_CONFIGURATION_QUERY_KEY, component],
      }),
    [queryClient],
  );
}
