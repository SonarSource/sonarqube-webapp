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
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { isReady: boolean }) {
        if (project === undefined) {
          throw new Error('Missing project');
        }
        return useCustomQuery({ enabled: project?.isReady });
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { isReady: boolean }) {
        return useCustomQuery({ enabled: project === undefined ? false : project?.isReady });
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { isReady: boolean }) {
        return useCustomQuery({ enabled: project !== undefined && project?.isReady });
      }
      `,
      },
      {
        code: `
      import { queryOptions } from '@tanstack/react-query';
      function getOptions(kind: string, project?: { isReady: boolean }) {
        switch (kind) {
          case 'a':
            if (!project) {
              throw new Error('Missing project');
            }
            return queryOptions({ queryKey: ['x'], enabled: project?.isReady });
          default:
            return null;
        }
      }
      `,
      },
      {
        code: `
      import { queryOptions } from '@tanstack/react-query';
      function getAllOptions(projects: Array<{ owner?: { isReady: boolean } }>) {
        const options = [];
        for (const project of projects) {
          if (!project.owner) continue;
          options.push(queryOptions({ queryKey: ['x'], enabled: project.owner?.isReady }));
        }
        return options;
      }
      `,
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { key: string; isReady: boolean }) {
        return useCustomQuery({
          enabled: project != null ? project?.key === 'main' || project?.isReady : false,
        });
      }
      `,
      },
    ],
    invalid: [
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { isPrivate: boolean; isReady: boolean }) {
        return useCustomQuery({ enabled: project?.isPrivate ? false : project?.isReady });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import { queryOptions } from '@tanstack/react-query';
      function getOptions(project?: { archived: boolean; isReady: boolean }) {
        if (project?.archived) {
          throw new Error('Archived project');
        }
        return queryOptions({ queryKey: ['x'], enabled: project?.isReady });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import { queryOptions } from '@tanstack/react-query';
      function getOptions(project?: { isReady: boolean }) {
        if (project) {
          return null;
        } else {
          return queryOptions({ queryKey: ['x'], enabled: project?.isReady });
        }
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { isReady: boolean }) {
        return useCustomQuery({ enabled: project !== null && project?.isReady });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { owner: { isReady: boolean } }) {
        return useCustomQuery({ enabled: project?.owner!.isReady });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
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
      import useCustomQuery from '~queries/custom-query';
      function useThing(project?: { owner?: { isReady: boolean } }) {
        return useCustomQuery({ enabled: project !== undefined && project?.owner?.isReady });
      }
      `,
        errors: [{ messageId: 'noUndefinedEnabled' }],
      },
      {
        code: `
      import { useQuery } from '@tanstack/react-query';
      function useThing(project?: { isReady: boolean }) {
        return useQuery({ queryKey: ['thing'], enabled: project?.isReady });
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
    ],
  },
);
