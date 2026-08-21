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

import { Label, MessageCallout, MessageVariety } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import {
  DashboardDetailsModal,
  DashboardDetailsModalProps,
} from '~feature-dashboards/dashboard-list/DashboardDetailsModal';
import { Visibility } from '~shared/types/component';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import type { ProjectDashboardData } from '../../../types/project-dashboards';

export type ProjectDashboardModalProps = Omit<
  DashboardDetailsModalProps<ProjectDashboardData>,
  'trailingContent'
>;

export function ProjectDashboardModal(props: Readonly<ProjectDashboardModalProps>) {
  const { formatMessage } = useIntl();
  const { component } = useComponent();
  const descriptionId =
    component?.visibility === Visibility.Public
      ? 'project_dashboard.modal.permission_access.public_project_description'
      : 'project_dashboard.modal.permission_access.private_project_description';

  return (
    <DashboardDetailsModal
      {...props}
      trailingContent={
        component?.visibility ? (
          <div className="sw-flex sw-flex-col sw-gap-2">
            <Label>{formatMessage({ id: 'dashboard.modal.permission_access.title' })}</Label>
            <MessageCallout variety={MessageVariety.Info}>
              {formatMessage({ id: descriptionId })}
            </MessageCallout>
          </div>
        ) : undefined
      }
    />
  );
}
