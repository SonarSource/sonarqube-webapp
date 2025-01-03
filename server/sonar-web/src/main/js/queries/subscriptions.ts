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

import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntlShape, useIntl } from 'react-intl';
import { addGlobalSuccessMessage } from '~design-system';
import {
  getReportStatus,
  subscribeToEmailReport,
  unsubscribeFromEmailReport,
} from '../api/component-report';
import { translate } from '../helpers/l10n';
import { ComponentReportStatus } from '../types/component-report';
import { Component } from '../types/types';
import { createQueryHook, StaleTime } from './common';

const getStatusKey = (componentKey: string, branchKey?: string) => {
  return ['subscription', 'project-report', componentKey, branchKey];
};

export const useGetReportStatusQuery = createQueryHook(
  (data: { branchKey?: string; componentKey: string }) => {
    return queryOptions({
      queryKey: getStatusKey(data.componentKey, data.branchKey),
      queryFn: () => getReportStatus(data.componentKey, data.branchKey),
      staleTime: StaleTime.NEVER,
    });
  },
);

export const useSubscribeToEmailReportMutation = () => {
  const queryClient = useQueryClient();
  const intl = useIntl();

  return useMutation({
    mutationFn: (data: { branchKey?: string; component: Component }) =>
      subscribeToEmailReport(data.component.key, data.branchKey),
    onSuccess: (_, data) => {
      const status = queryClient.getQueryData<Awaited<ReturnType<typeof getReportStatus>>>(
        getStatusKey(data.component.key, data.branchKey),
      );

      if (status) {
        queryClient.setQueryData(getStatusKey(data.component.key, data.branchKey), {
          ...status,
          subscribed: true,
        });

        addGlobalSuccessMessage(getTranslationMessage(true, data.component, intl, status));
      }
    },
  });
};

export const useUnsubscribeFromEmailReportMutation = () => {
  const queryClient = useQueryClient();
  const intl = useIntl();

  return useMutation({
    mutationFn: (data: { branchKey?: string; component: Component }) =>
      unsubscribeFromEmailReport(data.component.key, data.branchKey),
    onSuccess: (_, data) => {
      const status = queryClient.getQueryData<Awaited<ReturnType<typeof getReportStatus>>>(
        getStatusKey(data.component.key, data.branchKey),
      );

      if (status) {
        queryClient.setQueryData(getStatusKey(data.component.key, data.branchKey), {
          ...status,
          subscribed: false,
        });
      }
      addGlobalSuccessMessage(getTranslationMessage(false, data.component, intl, status));
    },
  });
};

const getTranslationMessage = (
  subscribed: boolean,
  component: Component,
  intl: IntlShape,
  status?: ComponentReportStatus,
) => {
  let translationKey = subscribed
    ? 'component_report.subscribe_x_success'
    : 'component_report.unsubscribe_x_success';

  if (!status) {
    translationKey += '_no_frequency';
  }

  const frequencyTranslation = translate(
    'report.frequency',
    status?.componentFrequency ?? status?.globalFrequency ?? '',
  ).toLowerCase();

  const qualifierTranslation = translate('qualifier', component.qualifier).toLowerCase();

  return intl.formatMessage(
    { id: translationKey },
    { frequency: frequencyTranslation, qualifier: qualifierTranslation },
  );
};
