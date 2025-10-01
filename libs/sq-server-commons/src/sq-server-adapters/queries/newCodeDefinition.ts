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

import { useMutation } from '@tanstack/react-query';
import { isDefined } from '~shared/helpers/types';
import { NewCodeDefinition, NewCodeDefinitionType } from '~shared/types/new-code-definition';
import { MessageTypes } from '../../api/messages';
import {
  useMessageDismissedMutation,
  useMessageDismissedQuery,
} from '../../queries/dismissed-messages';
import {
  useNewCodeDefinitionMutation as useServerNewCodeDefinitionMutation,
  useNewCodeDefinitionQuery as useServerNewCodeDefinitionQuery,
} from '../../queries/newCodeDefinition';
import { NewCodeDefinitionType as ServerNewCodeDefinitionType } from '../../types/new-code-definition';

const SERVER_TO_SHARED_TYPE_MAP: Record<ServerNewCodeDefinitionType, NewCodeDefinitionType> = {
  [ServerNewCodeDefinitionType.PreviousVersion]: NewCodeDefinitionType.PreviousVersion,
  [ServerNewCodeDefinitionType.NumberOfDays]: NewCodeDefinitionType.NumberOfDays,
  [ServerNewCodeDefinitionType.SpecificAnalysis]: NewCodeDefinitionType.SpecificVersion,
  [ServerNewCodeDefinitionType.ReferenceBranch]: NewCodeDefinitionType.PreviousVersion,
  [ServerNewCodeDefinitionType.Inherited]: NewCodeDefinitionType.PreviousVersion,
};

const SHARED_TO_SERVER_TYPE_MAP: Partial<
  Record<NewCodeDefinitionType, ServerNewCodeDefinitionType>
> = {
  [NewCodeDefinitionType.PreviousVersion]: ServerNewCodeDefinitionType.PreviousVersion,
  [NewCodeDefinitionType.NumberOfDays]: ServerNewCodeDefinitionType.NumberOfDays,
  [NewCodeDefinitionType.SpecificVersion]: ServerNewCodeDefinitionType.SpecificAnalysis,
};

export function useNewCodeDefinitionQuery() {
  return useServerNewCodeDefinitionQuery(undefined, {
    select: (serverData): NewCodeDefinition | undefined => {
      if (!serverData) {
        return undefined;
      }

      const type = SERVER_TO_SHARED_TYPE_MAP[serverData.type];
      if (!type) {
        return undefined;
      }

      return {
        type,
        value:
          serverData.value ||
          (type === NewCodeDefinitionType.PreviousVersion ? 'previous_version' : '30'),
        isValid: true,
        previousNonCompliantValue: serverData.previousNonCompliantValue,
        updatedAt: serverData.updatedAt,
      };
    },
  });
}

export function useNewCodeDefinitionMutation() {
  const { mutateAsync: serverMutateAsync } = useServerNewCodeDefinitionMutation();

  return useMutation({
    mutationFn: async (definition: NewCodeDefinition) => {
      const serverType = SHARED_TO_SERVER_TYPE_MAP[definition.type];

      if (!serverType) {
        throw new Error(`Unsupported new code definition type: ${definition.type}`);
      }

      const value =
        definition.type === NewCodeDefinitionType.NumberOfDays ||
        definition.type === NewCodeDefinitionType.SpecificVersion
          ? definition.value
          : undefined;

      return serverMutateAsync({
        type: serverType,
        value,
      });
    },
  });
}

// eslint-disable-next-line
export function useNewCodeDefinitionDaysBanner({
  previousNonCompliantValue,
  projectKey,
  updatedAt,
}: {
  previousNonCompliantValue?: string;
  projectKey?: string;
  updatedAt?: number;
}) {
  const params = projectKey
    ? {
        messageType: MessageTypes.ProjectNcdPage90,
        projectKey,
      }
    : {
        messageType: MessageTypes.GlobalNcdPage90,
      };
  const { data: shouldShowBanner } = useMessageDismissedQuery(params, {
    enabled: isDefined(previousNonCompliantValue),
    select: (data) =>
      isDefined(previousNonCompliantValue) && isDefined(updatedAt) && !data.dismissed,
  });

  const { mutate: dismissBanner } = useMessageDismissedMutation();

  return {
    shouldShowBanner,
    dismissBanner: () => {
      dismissBanner({
        messageType: MessageTypes.GlobalNcdPage90,
      });
    },
  };
}
