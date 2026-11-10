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

import { RuleTester } from '@typescript-eslint/rule-tester';
import noExplicitUndefinedEnabledInReactQuery from '../no-explicit-undefined-enabled-in-react-query';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run(
  'no-explicit-undefined-enabled-in-react-query',
  noExplicitUndefinedEnabledInReactQuery,
  {
    valid: [
      {
        code: `
      import useCustomQuery from '../queries/custom-query';
      useCustomQuery({
        enabled: true
      });
      `,
      },
      {
        code: `
      import useCustomQuery from '../helper/custom-query';
      useCustomQuery({
        enabled: undefined
      });
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      useCustomQuery({
        enabled: false
      });
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      useCustomQuery(true, {
        enabled: false
      });
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      useCustomQuery(true, {
        enabled: true,
        testValue: undefined
      });
      `,
      },
      {
        code: `
      import { useQuery } from 'react-query';
      function useSyncWithGitLabNow() {
        const autoProvisioningEnabled = true;
        const { data: syncStatus } = useQuery({ enabled: autoProvisioningEnabled });
        return { canSyncNow: autoProvisioningEnabled };
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { key: string }) {
        return useCustomQuery({ enabled: project?.key !== undefined });
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { key: string }) {
        return useCustomQuery({ enabled: Boolean(project?.key) });
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing({ enabled = true }: { enabled?: boolean }) {
        return useCustomQuery({ enabled });
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(enabled?: boolean) {
        return useCustomQuery({ enabled: enabled ?? false });
      }
      `,
      },
    ],
    invalid: [
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { key: string }) {
        return useCustomQuery({ enabled: project?.key });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(enabled?: boolean) {
        return useCustomQuery({ enabled });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { isReady: boolean }) {
        const isReady = project?.isReady;
        return useCustomQuery({ enabled: isReady });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(isReady: boolean, project?: { key: string }) {
        return useCustomQuery({ enabled: isReady && project?.key });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import { queryOptions } from '@tanstack/react-query';
      function getOptions(isReady: boolean) {
        return queryOptions({ queryKey: ['x'], enabled: isReady ? true : undefined });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      useCustomQuery(true, {
        enabled: undefined
      });
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      const test: boolean | undefined = true;
      useCustomQuery(true, {
        enabled: test
      });
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      const test: boolean | undefined = true;
      useCustomQuery({
        enabled: test
      });
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import { useQuery } from 'react-query';
      function useSyncWithGitLabNow() {
        const autoProvisioningEnabled: boolean | undefined = true;
        const { data: syncStatus } = useQuery({ enabled: autoProvisioningEnabled });
        return { canSyncNow: autoProvisioningEnabled };
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
        import { createQueryHook } from '~shared/queries/common';
        
        const useGitLabSyncStatusQuery = createQueryHook(() => {
          return {
            queryKey: ['identity_provider', 'gitlab_sync', 'status'],
            queryFn: async () => ({ lastSync: null, nextSync: null }),
          };
        });

        export function useSyncWithGitLabNow() {
          const queryClient = useQueryClient();
          const { data: gitlabConfigurations } = useGitLabConfigurationsQuery();

          const autoProvisioningEnabled: boolean | undefined = gitlabConfigurations?.gitlabConfigurations.some(
            (configuration) =>
              configuration.enabled && configuration.provisioningType === ProvisioningType.auto,
          );
          const { data: syncStatus } = useGitLabSyncStatusQuery({ enabled: autoProvisioningEnabled });

          const mutation = useMutation({
            mutationFn: syncNowGitLabProvisioning,
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['identity_provider', 'gitlab_sync'],
              });
            },
          });

          return {
            synchronizeNow: mutation.mutate,
            canSyncNow: autoProvisioningEnabled && !syncStatus?.nextSync && !mutation.isPending,
          };
        }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
        import { createQueryHook } from '~shared/queries/common';
        
        const useModeQuery = createQueryHook(() => {
          return {
            queryKey: ['mode'],
            queryFn: () => Promise.resolve({ mode: 'Standard' }),
          };
        });

        export const useStandardExperienceModeQuery = ({ enabled }: { enabled?: boolean } = {}) => {
          return useModeQuery({
            select: (data) => data.mode === 'Standard',
            enabled,
          });
        };
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
        import { createQueryHook } from '~shared/queries/common';
        
        export const useGitLabSyncStatusQuery = createQueryHook(() => {
          return {
            queryKey: ['identity_provider', 'gitlab_sync', 'status'],
            queryFn: async () => ({ lastSync: null, nextSync: null }),
          };
        });

        export function useSyncWithGitLabNow() {
          const autoProvisioningEnabled: boolean | undefined = true;
          const { data: syncStatus } = useGitLabSyncStatusQuery({ enabled: autoProvisioningEnabled });
          return { canSyncNow: autoProvisioningEnabled };
        }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
    ],
  },
);
