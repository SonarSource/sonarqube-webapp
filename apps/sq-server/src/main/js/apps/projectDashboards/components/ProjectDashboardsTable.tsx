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

import { Text, TextSize, toast } from '@sonarsource/echoes-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import Avatar from '~adapters/components/ui/Avatar';
import { createEmptyDashboard } from '~feature-dashboards/dashboard-layout/logic/constants';
import { DashboardTable } from '~feature-dashboards/dashboard-list/DashboardTable';
import { DashboardTableActions } from '~feature-dashboards/dashboard-list/DashboardTableActions';
import { DashboardTypeBadge } from '~feature-dashboards/dashboard-list/DashboardTypeBadge';
import { DashboardMode, DashboardType } from '~feature-dashboards/types/dashboard-list';
import type { ProjectDashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import {
  getProjectDuplicateSourceDashboardQueryOptions,
  useCreateProjectDashboardDuplicateMutation,
  useDeleteProjectDashboardMutation,
  useUpdateProjectDashboardMutation,
} from '../../../queries/project-dashboards';
import type {
  ProjectDashboardData,
  ProjectDashboardListItem,
} from '../../../types/project-dashboards';
import { getProjectBuiltInDashboardRoute, getProjectCustomDashboardRoute } from '../routes';
import { ProjectDashboardModal } from './ProjectDashboardModal';

interface Props {
  canEdit: boolean;
  dashboardCreators: Record<string, { avatar?: string; name: string }>;
  dashboards: ProjectDashboardListItem[];
  isLoadingDashboards: boolean;
  projectId: string;
  projectKey: string;
}

function toModalDashboardData(item: ProjectDashboardListItem): ProjectDashboardData {
  return { ...createEmptyDashboard<ProjectDashboardWidgetPropMap>(DashboardType.Custom), ...item };
}

function getProjectDashboardCreatorContent(
  dashboard: ProjectDashboardListItem,
  dashboardCreators: Props['dashboardCreators'],
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) {
  return (
    <ProjectDashboardCreator
      dashboard={dashboard}
      dashboardCreators={dashboardCreators}
      formatMessage={formatMessage}
    />
  );
}

function ProjectDashboardCreator({
  dashboard,
  dashboardCreators,
  formatMessage,
}: Readonly<{
  dashboard: ProjectDashboardListItem;
  dashboardCreators: Props['dashboardCreators'];
  formatMessage: ReturnType<typeof useIntl>['formatMessage'];
}>) {
  const creator = dashboard.createdById ? dashboardCreators[dashboard.createdById] : undefined;

  return isStringDefined(dashboard.createdById) ? (
    <div className="sw-flex sw-items-center sw-gap-1">
      <Avatar hash={creator?.avatar} name={creator?.name} size="xs" />
      <Text size={TextSize.Small}>
        {creator?.name ?? formatMessage({ id: 'dashboard.list.removed_user' })}
      </Text>
    </div>
  ) : (
    ''
  );
}

export function ProjectDashboardsTable({
  canEdit,
  dashboardCreators,
  dashboards,
  isLoadingDashboards,
  projectId,
  projectKey,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDashboard, setSelectedDashboard] = useState<ProjectDashboardListItem | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<ProjectDashboardListItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const { mutate: updateDashboard, isPending: isUpdating } = useUpdateProjectDashboardMutation();
  const { mutate: deleteDashboard, isPending: isDeleting } = useDeleteProjectDashboardMutation();
  const { mutate: duplicateDashboard, isPending: isDuplicating } =
    useCreateProjectDashboardDuplicateMutation();

  const closeEdit = () => {
    setSelectedDashboard(null);
    setIsEditModalOpen(false);
  };
  const closeDuplicate = () => {
    setDuplicateSource(null);
    setIsDuplicateModalOpen(false);
  };
  const prefetch = (dashboard: ProjectDashboardListItem) => {
    void queryClient.prefetchQuery(
      getProjectDuplicateSourceDashboardQueryOptions({
        dashboard,
        projectId,
      }),
    );
  };

  return (
    <>
      <DashboardTable
        dashboards={dashboards}
        getCreatorContent={(dashboard) =>
          getProjectDashboardCreatorContent(dashboard, dashboardCreators, formatMessage)
        }
        getDashboardUrl={(dashboard) =>
          dashboard.type === DashboardType.BuiltIn
            ? getProjectBuiltInDashboardRoute(dashboard.id, projectKey)
            : getProjectCustomDashboardRoute(dashboard.id, projectKey)
        }
        gridTemplate={canEdit ? '3fr 1fr 1fr 64px' : '3fr 1fr 64px'}
        isLoadingDashboards={isLoadingDashboards}
        isMemberOfOrganization={canEdit}
        renderActionsCell={(dashboard) => (
          <DashboardTableActions
            ariaLabel={formatMessage(
              { id: 'dashboard.list.actions.aria_label' },
              { dashboardName: dashboard.name },
            )}
            dashboardName={dashboard.name}
            id={`project-dashboard-actions-${dashboard.id}`}
            isBuiltIn={dashboard.type === DashboardType.BuiltIn}
            isDeleting={isDeleting}
            isVisible={canEdit}
            onDelete={({ close }) => {
              deleteDashboard(
                { dashboardId: dashboard.id, projectId },
                {
                  onSuccess: () => {
                    close();
                    toast.success({
                      description: formatMessage(
                        { id: 'project_dashboard.list.toast.delete_success' },
                        { dashboardName: dashboard.name },
                      ),
                      isDismissable: true,
                    });
                  },
                  onError: () => {
                    toast.error({
                      description: formatMessage({
                        id: 'project_dashboard.list.toast.delete_error',
                      }),
                      isDismissable: true,
                    });
                  },
                },
              );
            }}
            onDuplicate={() => {
              prefetch(dashboard);
              setDuplicateSource(dashboard);
              setIsDuplicateModalOpen(true);
            }}
            onEditNameDescription={() => {
              setSelectedDashboard(dashboard);
              setIsEditModalOpen(true);
            }}
          />
        )}
        renderDashboardNameSuffix={(dashboard) => (
          <DashboardTypeBadge dashboardType={dashboard.type} />
        )}
      />

      {isEditModalOpen && isDefined(selectedDashboard) && (
        <ProjectDashboardModal
          dashboard={toModalDashboardData(selectedDashboard)}
          isOpen
          isSaving={isUpdating}
          mode={DashboardMode.Edit}
          onClose={closeEdit}
          onOpenChange={setIsEditModalOpen}
          onSave={(dashboard) => {
            updateDashboard(
              {
                dashboardId: dashboard.id,
                description: dashboard.description,
                name: dashboard.name,
                projectId,
              },
              {
                onError: () => {
                  toast.error({
                    description: formatMessage({ id: 'project_dashboard.list.toast.edit_error' }),
                    isDismissable: true,
                  });
                },
                onSuccess: () => {
                  closeEdit();
                  toast.success({
                    description: formatMessage(
                      { id: 'project_dashboard.list.toast.edit_success' },
                      { dashboardName: dashboard.name },
                    ),
                    isDismissable: true,
                  });
                },
              },
            );
          }}
        />
      )}

      {isDuplicateModalOpen && isDefined(duplicateSource) && (
        <ProjectDashboardModal
          dashboard={toModalDashboardData(duplicateSource)}
          isOpen
          isSaving={isDuplicating}
          mode={DashboardMode.Duplicate}
          onClose={closeDuplicate}
          onOpenChange={setIsDuplicateModalOpen}
          onSave={(dashboard) => {
            duplicateDashboard(
              {
                description: dashboard.description,
                duplicateSource,
                name: dashboard.name,
                projectId,
              },
              {
                onSuccess: (created) => {
                  closeDuplicate();
                  toast.success({
                    description: formatMessage(
                      { id: 'project_dashboard.list.toast.duplicate_success' },
                      { dashboardName: created.name },
                    ),
                    isDismissable: true,
                  });
                  navigate(getProjectCustomDashboardRoute(created.id, projectKey));
                },
                onError: () => {
                  toast.error({
                    description: formatMessage({
                      id: 'project_dashboard.list.toast.duplicate_error',
                    }),
                    isDismissable: true,
                  });
                },
              },
            );
          }}
        />
      )}
    </>
  );
}
