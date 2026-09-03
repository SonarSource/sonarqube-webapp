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

import { Button, toast } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { createEmptyDashboard } from '~feature-dashboards/dashboard-layout/logic/constants';
import {
  DashboardKebabMenu,
  DashboardKebabMenuItems,
} from '~feature-dashboards/dashboard-list/DashboardKebabMenu';
import { downloadDashboardSchema } from '~feature-dashboards/helpers/downloadDashboardSchema';
import { DashboardMode, DashboardType } from '~feature-dashboards/types/dashboard-list';
import type { ProjectDashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';
import { isStringDefined } from '~shared/helpers/types';
import { useProjectId } from '~sq-server-commons/sq-server-adapters/helpers/useProjectId';
import {
  useCreateProjectDashboardDuplicateMutation,
  useCreateProjectDashboardMutation,
} from '../../../queries/project-dashboards';
import type { ProjectDashboardData } from '../../../types/project-dashboards';
import { getProjectCustomDashboardRoute, getProjectDashboardsListRoute } from '../routes';
import { ProjectDashboardModal } from './ProjectDashboardModal';

interface Props {
  canCreateCustomDashboard: boolean;
  canDownloadSchema: boolean;
  dashboard: ProjectDashboardData;
  projectKey: string;
}

export function ProjectBuiltInDashboardActions({
  canCreateCustomDashboard,
  canDownloadSchema,
  dashboard,
  projectKey,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const projectId = useProjectId();
  const [modalMode, setModalMode] = useState<DashboardMode | null>(null);
  const { mutate: createDashboard, isPending: isCreating } = useCreateProjectDashboardMutation();
  const { mutate: duplicateDashboard, isPending: isDuplicating } =
    useCreateProjectDashboardDuplicateMutation();
  const listUrl = getProjectDashboardsListRoute(projectKey);
  const emptyDashboard: ProjectDashboardData = {
    ...createEmptyDashboard<ProjectDashboardWidgetPropMap>(DashboardType.Custom),
    type: DashboardType.Custom,
  };
  const modalDashboard = modalMode === DashboardMode.Duplicate ? dashboard : emptyDashboard;
  const canCreate = canCreateCustomDashboard && isStringDefined(projectId);

  const closeModal = () => {
    setModalMode(null);
  };

  const handleSave = (newDashboard: ProjectDashboardData) => {
    if (modalMode === null || !isStringDefined(projectId)) {
      return;
    }

    const mode = modalMode;
    const mutationOptions = {
      onError: () => {
        toast.error({
          description: formatMessage({
            id:
              mode === DashboardMode.Duplicate
                ? 'project_dashboard.list.toast.duplicate_error'
                : 'project_dashboard.list.toast.create_error',
          }),
          isDismissable: true,
        });
      },
      onSuccess: (created: Pick<ProjectDashboardData, 'id' | 'name'>) => {
        closeModal();
        toast.success({
          description: formatMessage(
            {
              id:
                mode === DashboardMode.Duplicate
                  ? 'project_dashboard.list.toast.duplicate_success'
                  : 'project_dashboard.list.toast.create_success',
            },
            { dashboardName: created.name },
          ),
          isDismissable: true,
        });
        navigate(getProjectCustomDashboardRoute(created.id, projectKey));
      },
    };

    if (mode === DashboardMode.Duplicate) {
      duplicateDashboard(
        {
          description: newDashboard.description ?? '',
          duplicateSource: dashboard,
          name: newDashboard.name,
          projectId,
        },
        mutationOptions,
      );
    } else {
      createDashboard(
        {
          description: newDashboard.description,
          layout: newDashboard.layout,
          name: newDashboard.name,
          projectId,
        },
        mutationOptions,
      );
    }
  };

  return (
    <>
      {canCreate && (
        <Button
          onClick={() => {
            setModalMode(DashboardMode.Create);
          }}
        >
          {formatMessage({ id: 'dashboard.create_custom_dashboard' })}
        </Button>
      )}
      <Button to={listUrl}>{formatMessage({ id: 'dashboard.view_all_dashboards' })}</Button>
      <DashboardKebabMenu
        ariaLabel={formatMessage({ id: 'more_actions' })}
        id={`project-dashboard-actions-${dashboard.id}`}
        isVisible={canCreate || canDownloadSchema}
        items={
          <DashboardKebabMenuItems
            dashboardName={dashboard.name}
            isBuiltIn
            isDeleting={false}
            onDelete={() => undefined}
            onDownloadSchema={
              canDownloadSchema
                ? () => {
                    downloadDashboardSchema(dashboard);
                  }
                : undefined
            }
            onDuplicate={
              canCreate
                ? () => {
                    setModalMode(DashboardMode.Duplicate);
                  }
                : undefined
            }
            onEditNameDescription={() => undefined}
          />
        }
      />
      {modalMode !== null && isStringDefined(projectId) && (
        <ProjectDashboardModal
          dashboard={modalDashboard}
          isOpen
          isSaving={isCreating || isDuplicating}
          mode={modalMode}
          onClose={closeModal}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeModal();
            }
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
