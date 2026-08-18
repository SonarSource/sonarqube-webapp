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

import {
  Button,
  ButtonVariety,
  MessageCallout,
  MessageVariety,
  Spinner,
} from '@sonarsource/echoes-react';
import { isAxiosError } from 'axios';
import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { DashboardLayoutValidationError } from '../helpers/dashboard-layout-validation-reporting';

export enum DashboardCustomDashboardState {
  Error = 'error',
  InvalidLayout = 'invalid-layout',
  Loading = 'loading',
  NotFound = 'not-found',
  Ready = 'ready',
}

export function getDashboardCustomDashboardState(args: {
  dashboard: unknown;
  error: unknown;
  isLoading: boolean;
}): DashboardCustomDashboardState {
  if (args.isLoading) {
    return DashboardCustomDashboardState.Loading;
  }
  if (isAxiosError(args.error) && args.error.response?.status === 404) {
    return DashboardCustomDashboardState.NotFound;
  }
  if (args.error instanceof DashboardLayoutValidationError) {
    return DashboardCustomDashboardState.InvalidLayout;
  }
  return args.error || !args.dashboard
    ? DashboardCustomDashboardState.Error
    : DashboardCustomDashboardState.Ready;
}

export function DashboardCustomDashboardLoading() {
  const { formatMessage } = useIntl();
  return (
    <ProjectPageTemplate title={formatMessage({ id: 'loading' })}>
      <div className="sw-flex sw-justify-center sw-my-10">
        <Spinner />
      </div>
    </ProjectPageTemplate>
  );
}

function StatePage(
  props: Readonly<{
    backToListLabelId: string;
    children: ReactNode;
    listUrl: string;
    titleId: string;
    variety: MessageVariety;
  }>,
) {
  const { backToListLabelId, children, listUrl, titleId, variety } = props;
  const { formatMessage } = useIntl();
  return (
    <ProjectPageTemplate title={formatMessage({ id: titleId })}>
      <MessageCallout title={formatMessage({ id: titleId })} variety={variety}>
        {children}
      </MessageCallout>
      <div className="sw-mt-4">
        <Button to={listUrl} variety={ButtonVariety.Primary}>
          <FormattedMessage id={backToListLabelId} />
        </Button>
      </div>
    </ProjectPageTemplate>
  );
}

export function DashboardCustomDashboardNotFound(
  props: Readonly<{
    backToListLabelId: string;
    descriptionId: string;
    listUrl: string;
    titleId: string;
  }>,
) {
  return (
    <StatePage
      backToListLabelId={props.backToListLabelId}
      listUrl={props.listUrl}
      titleId={props.titleId}
      variety={MessageVariety.Warning}
    >
      <FormattedMessage id={props.descriptionId} />
    </StatePage>
  );
}

export function DashboardCustomDashboardInvalidLayout(
  props: Readonly<{
    backToListLabelId: string;
    descriptionId: string;
    listUrl: string;
    titleId: string;
  }>,
) {
  return (
    <StatePage
      backToListLabelId={props.backToListLabelId}
      listUrl={props.listUrl}
      titleId={props.titleId}
      variety={MessageVariety.Danger}
    >
      <FormattedMessage id={props.descriptionId} />
    </StatePage>
  );
}

export function DashboardCustomDashboardGenericError(
  props: Readonly<{
    descriptionId: string;
    onRetry: () => void;
    titleId: string;
  }>,
) {
  const { formatMessage } = useIntl();
  return (
    <ProjectPageTemplate title={formatMessage({ id: props.titleId })}>
      <MessageCallout title={formatMessage({ id: props.titleId })} variety={MessageVariety.Danger}>
        <FormattedMessage id={props.descriptionId} />
      </MessageCallout>
      <div className="sw-mt-4">
        <Button onClick={props.onRetry} variety={ButtonVariety.Default}>
          <FormattedMessage id="retry" />
        </Button>
      </div>
    </ProjectPageTemplate>
  );
}
