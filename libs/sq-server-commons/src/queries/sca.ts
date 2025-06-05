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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { getFeatureEnablement, getScaSelfTest, updateFeatureEnablement } from '../api/sca';
import { ScaEnablementPayload } from '../types/sca';

export const useGetScaFeatureEnablementQuery = createQueryHook<
  unknown,
  ScaEnablementPayload,
  Error,
  boolean
>(() => {
  return {
    queryKey: ['sca', 'config'] as const,
    queryFn: () => getFeatureEnablement(),
    select: (response: ScaEnablementPayload) => response.enablement,
    staleTime: StaleTime.NEVER,
  };
});

export const useGetScaSelfTestQuery = createQueryHook(() => {
  return {
    queryKey: ['sca', 'selftest'] as const,
    queryFn: () => getScaSelfTest(),
    staleTime: StaleTime.LIVE,
    retry: 0,
  };
});

export const useUpdateScaFeatureEnablementMutation = (onSuccess: VoidFunction) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isEnabled: boolean) => updateFeatureEnablement(isEnabled),
    onSuccess: (data) => {
      queryClient.setQueryData(['sca', 'config'], data);

      onSuccess();
    },
  });
};
