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

import { toast } from '@sonarsource/echoes-react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  deleteEmailConfiguration,
  getEmailConfigurations,
  getSupportInformation,
  getSystemStatus,
  getSystemUpgrades,
  patchEmailConfiguration,
  postEmailConfiguration,
} from '../api/system';
import { EmailConfiguration } from '../types/system';

const SYSTEM_UPGRADES_QUERY_KEY = ['system', 'upgrades'] as const;

export const useSystemUpgrades = createQueryHook(() => {
  return queryOptions({
    queryKey: SYSTEM_UPGRADES_QUERY_KEY,
    queryFn: () => getSystemUpgrades(),
    staleTime: StaleTime.NEVER,
  });
});

export function useInvalidateSystemUpgradesQuery() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SYSTEM_UPGRADES_QUERY_KEY });
}

export const useSystemStatusQuery = createQueryHook(() => {
  return queryOptions({
    queryKey: ['system', 'status'],
    queryFn: getSystemStatus,
    staleTime: StaleTime.NEVER,
  });
});

export function useEmailConfigurationQuery() {
  return useQuery({
    queryKey: ['email_configuration'] as const,
    queryFn: async () => {
      const { emailConfigurations } = await getEmailConfigurations();
      return emailConfigurations && emailConfigurations.length > 0 ? emailConfigurations[0] : null;
    },
    staleTime: StaleTime.LONG,
  });
}

export function useSaveEmailConfigurationMutation() {
  const queryClient = useQueryClient();
  const { formatMessage } = useIntl();
  return useMutation({
    mutationFn: (data: EmailConfiguration) => {
      return postEmailConfiguration(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_configuration'] });
      toast.success({
        description: formatMessage({
          id: 'email_notification.form.save_configuration.create_success',
        }),
      });
    },
  });
}

export function useUpdateEmailConfigurationMutation() {
  const queryClient = useQueryClient();
  const { formatMessage } = useIntl();
  return useMutation({
    mutationFn: ({
      emailConfiguration,
      id,
    }: {
      emailConfiguration: EmailConfiguration;
      id: string;
    }) => {
      return patchEmailConfiguration(id, emailConfiguration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_configuration'] });
      toast.success({
        description: formatMessage({
          id: 'email_notification.form.save_configuration.update_success',
        }),
      });
    },
  });
}

export function useDeleteEmailConfigurationMutation() {
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      return deleteEmailConfiguration(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['email_configuration'] });
      toast.success({
        description: formatMessage({
          id: 'email_notification.form.save_configuration.delete_success',
        }),
      });
    },
    onError: () => {
      toast.error({
        description: formatMessage({
          id: 'email_notification.form.save_configuration.delete_error',
        }),
      });
    },
  });
}

export const useSupportInformationQuery = createQueryHook(() => {
  return queryOptions({
    queryKey: ['support', 'information'],
    queryFn: getSupportInformation,
    staleTime: StaleTime.NEVER,
  });
});
