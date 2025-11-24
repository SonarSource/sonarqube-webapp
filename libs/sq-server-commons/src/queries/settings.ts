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

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createQueryHook } from '~shared/queries/common';
import { ExtendedSettingDefinition, SettingValue } from '~shared/types/settings';
import {
  getLoginMessage,
  getValue,
  getValues,
  resetSettingValue,
  setSettingValue,
  setSimpleSettingValue,
} from '../api/settings';
import { addGlobalSuccessMessage } from '../design-system';
import { translate } from '../helpers/l10n';
import { invalidateAllMeasures } from './measures';

const getSettingsSaveSuccessMessage = () =>
  translate('settings.authentication.form.settings.save_success');

type SettingFinalValue = string | boolean | string[];

const queryKeys = {
  values: (keys: string[]) => ['settings', 'values', keys] as const,
  details: (key: string, component?: string) =>
    ['settings', 'details', key, ...(component ? [component] : [])] as const,
};

export function useGetValuesQuery(keys: string[]) {
  return useQuery({
    queryKey: queryKeys.values(keys),
    queryFn: ({ queryKey: [_a, _b, keys] }) => {
      return getValues({ keys });
    },
  });
}

export const useGetValueQuery = createQueryHook(
  ({ key, component }: { component?: string; key: string }) => {
    return queryOptions({
      queryKey: queryKeys.details(key, component),
      queryFn: ({ queryKey: [_a, _b, key] }) => {
        return getValue({ key, component }).then((v) => v ?? null);
      },
    });
  },
);

export const useLoginMessageQuery = createQueryHook(() => {
  return {
    queryKey: ['settings', 'login-message'],
    queryFn: getLoginMessage,
    select: (data: { message: string }) => data.message,
  };
});

export function useResetSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ keys, component }: { component?: string; keys: string[] }) =>
      resetSettingValue({ keys: keys.join(','), component }),
    onSuccess: (_, { keys, component }) => {
      keys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.details(key, component),
        });
      });
      queryClient.invalidateQueries({ queryKey: ['settings', 'values'] });
    },
  });
}

export function useSaveValuesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      values: {
        definition: ExtendedSettingDefinition;
        newValue?: SettingFinalValue;
        settingCurrentValue?: SettingValue;
      }[],
    ) => {
      return Promise.all(
        values
          .filter((v) => v.newValue !== undefined)
          .map(async ({ newValue, definition, settingCurrentValue }) => {
            try {
              if (
                isDefaultValue(
                  newValue as string | boolean | string[],
                  definition,
                  settingCurrentValue?.parentValue ?? settingCurrentValue?.parentValues,
                )
              ) {
                await resetSettingValue({ keys: definition.key });
              } else {
                await setSettingValue(definition, newValue);
              }
              return { key: definition.key, success: true };
            } catch (error) {
              return { key: definition.key, success: false };
            }
          }),
      );
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        data.forEach(({ key }) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.details(key) });
        });
        queryClient.invalidateQueries({ queryKey: ['settings', 'values'] });
        addGlobalSuccessMessage(getSettingsSaveSuccessMessage());
      }
    },
  });
}

export function useSaveValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      component,
      definition,
      newValue,
      settingCurrentValue,
    }: {
      component?: string;
      definition: ExtendedSettingDefinition;
      newValue: SettingFinalValue;
      settingCurrentValue?: SettingValue;
    }) => {
      if (
        isDefaultValue(
          newValue,
          definition,
          settingCurrentValue?.parentValue ?? settingCurrentValue?.parentValues,
        )
      ) {
        return resetSettingValue({ keys: definition.key, component });
      }
      return setSettingValue(definition, newValue, component);
    },
    onSuccess: (_, { definition, component }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.details(definition.key, component),
      });
      queryClient.invalidateQueries({ queryKey: ['settings', 'values'] });
      invalidateAllMeasures(queryClient);
      addGlobalSuccessMessage(getSettingsSaveSuccessMessage());
    },
  });
}

export function useSaveSimpleValueMutation(
  updateCache = false,
  successMessage: string | null = getSettingsSaveSuccessMessage(),
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value, component }: { component?: string; key: string; value: string }) => {
      return setSimpleSettingValue({ key, value, component });
    },
    onSuccess: (_, { value, key, component }) => {
      if (updateCache) {
        queryClient.setQueryData<SettingValue>(queryKeys.details(key), (oldData) =>
          oldData
            ? {
                ...oldData,
                value: oldData.value !== undefined ? String(value) : undefined,
              }
            : oldData,
        );
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.details(key, component),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.values([key]) });
      if (successMessage) {
        addGlobalSuccessMessage(successMessage);
      }
    },
  });
}

function isDefaultValue(
  value: SettingFinalValue,
  definition: ExtendedSettingDefinition,
  parentValue?: SettingFinalValue,
) {
  const defaultValue = parentValue ?? definition.defaultValue ?? '';
  if (definition.multiValues) {
    return defaultValue === (value as string[]).join(',');
  }

  return defaultValue === String(value);
}
