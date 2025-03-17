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
import { useIntl } from 'react-intl';
import { getFeatureEnablement, updateFeatureEnablement } from '../api/sca';
import { addGlobalSuccessMessage } from '../design-system';
import { ScaEnablementPayload } from '../types/sca';
import { createQueryHook, StaleTime } from './common';

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

export const useUpdateScaFeatureEnablementMutation = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isEnabled: boolean) => updateFeatureEnablement(isEnabled),
    onSuccess: (data, isEnabled) => {
      queryClient.setQueryData(['sca', 'config'], data);

      addGlobalSuccessMessage(
        intl.formatMessage(
          {
            id: 'property.sca.message.updated',
          },
          { 0: isEnabled ? 'enabled' : 'disabled' },
        ),
      );
    },
  });
};
