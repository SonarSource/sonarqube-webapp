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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { fetchGithubProvisioningStatus, syncNowGithubProvisioning } from '../api/provisioning';
import { AvailableFeaturesContext } from '../app/components/available-features/AvailableFeaturesContext';
import { Feature } from '../types/features';

export function useSyncStatusQuery() {
  const hasGithubProvisioning = useContext(AvailableFeaturesContext).includes(
    Feature.GithubProvisioning
  );
  return useQuery(['github_sync', 'status'], fetchGithubProvisioningStatus, {
    enabled: hasGithubProvisioning,
    refetchInterval: 10_000,
  });
}

export function useSyncNow() {
  const queryClient = useQueryClient();
  const { data } = useSyncStatusQuery();
  const mutation = useMutation(syncNowGithubProvisioning, {
    onSuccess: () => {
      queryClient.invalidateQueries(['github_sync']);
    },
  });

  return {
    synchronizeNow: mutation.mutate,
    canSyncNow: data && data.enabled && !data.nextSync && !mutation.isLoading,
  };
}
