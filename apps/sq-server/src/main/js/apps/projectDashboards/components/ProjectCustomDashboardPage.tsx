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

import { BreadcrumbsProps, Button, ButtonVariety, toast } from '@sonarsource/echoes-react';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardDescriptionAccordion } from '~feature-dashboards/dashboard-description/DashboardDescriptionAccordion';
import { DashboardCustomDashboardContent } from '~feature-dashboards/dashboard-layout/DashboardCustomDashboardContent';
import {
  DashboardCustomDashboardGenericError,
  DashboardCustomDashboardInvalidLayout,
  DashboardCustomDashboardLoading,
  DashboardCustomDashboardNotFound,
  DashboardCustomDashboardState,
  getDashboardCustomDashboardState,
} from '~feature-dashboards/dashboard-layout/DashboardCustomDashboardViews';
import { EditToolbar } from '~feature-dashboards/dashboard-layout/EditToolbar';
import { createEmptyDashboard } from '~feature-dashboards/dashboard-layout/logic/constants';
import { normalizeSection } from '~feature-dashboards/dashboard-layout/logic/positioning';
import type { DashboardInstance } from '~feature-dashboards/dashboard-layout/logic/types';
import { CreateSectionModal } from '~feature-dashboards/dashboard-layout/modals/CreateSectionModal';
import {
  DashboardKebabMenu,
  DashboardKebabMenuItems,
} from '~feature-dashboards/dashboard-list/DashboardKebabMenu';
import { DashboardTypeBadge } from '~feature-dashboards/dashboard-list/DashboardTypeBadge';
import { downloadDashboardSchema } from '~feature-dashboards/helpers/downloadDashboardSchema';
import { useAddWidget } from '~feature-dashboards/hooks/useAddWidget';
import { useNativeBrowserNavigationBlocker } from '~feature-dashboards/hooks/useNativeBrowserNavigationBlocker';
import { DashboardMode, DashboardType } from '~feature-dashboards/types/dashboard-list';
import {
  type ProjectDashboardWidgetPropMap,
  widgetEditBehaviorMap,
} from '~feature-dashboards/types/dashboard-widget';
import { DashboardCustomDashboardWidgetModal } from '~feature-dashboards/widget-creation-modal/components/DashboardCustomDashboardWidgetModal';
import { useEditWidget } from '~feature-dashboards/widget-creation-modal/hooks/useEditWidget';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import NotFound from '~shared/components/NotFound';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isApiResourceUuid } from '~shared/helpers/api-resource-validation';
import { uuidv4 } from '~shared/helpers/crypto';
import { isStringDefined } from '~shared/helpers/types';
import { CustomDashboardEditStatus } from '~sq-server-commons/components/dashboards/CustomDashboardEditStatus';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { useProjectId } from '~sq-server-commons/sq-server-adapters/helpers/useProjectId';
import { useCurrentUser } from '~sq-server-commons/sq-server-adapters/helpers/users';
import { Permissions } from '~sq-server-commons/types/permissions';
import {
  useCreateProjectDashboardDuplicateMutation,
  useDeleteProjectDashboardMutation,
  useGetProjectDashboardQuery,
  useUpdateProjectDashboardMutation,
} from '../../../queries/project-dashboards';
import { supportsCustomProjectDashboards } from '../permissions';
import { getProjectCustomDashboardRoute, getProjectDashboardsListRoute } from '../routes';
import { ProjectDashboardModal } from './ProjectDashboardModal';
import {
  projectDashboardWidgetBodyMap,
  projectDashboardWidgetHeaderMap,
} from './projectDashboardWidgetMaps';
import { getSqsProjectWidgetMetricPickerOptions } from './projectWidgetMetricPickerOptions';
import { ProjectWidgetOptions } from './ProjectWidgetOptions';

function isEmptyDashboard(dashboard: DashboardInstance<ProjectDashboardWidgetPropMap>) {
  return dashboard.children.every((section) => section.children.length === 0);
}

export function ProjectCustomDashboardPage() {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const { component } = useComponent();
  const { currentUser, isLoggedIn } = useCurrentUser();
  const { edition } = useAppState();
  const { dashboardId = '' } = useParams<{ dashboardId?: string }>();
  const projectId = useProjectId() ?? '';
  const canEdit = isLoggedIn && supportsCustomProjectDashboards(edition);
  const canDownloadSchema = hasGlobalPermission(currentUser, Permissions.Admin);
  const editDocumentationUrl = useDocUrl(DocLink.ProjectManagementCreateDashboards);
  const viewDocumentationUrl = useDocUrl(DocLink.ProjectManagementAllDashboards);
  const invalidId = Boolean(dashboardId) && !isApiResourceUuid(dashboardId);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isEditWidgetModalOpen, setIsEditWidgetModalOpen] = useState(false);
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localLayout, setLocalLayout] =
    useState<DashboardInstance<ProjectDashboardWidgetPropMap> | null>(null);
  const metricPickerOptions = useMemo(
    () => getSqsProjectWidgetMetricPickerOptions({ formatMessage }),
    [formatMessage],
  );
  const query = useGetProjectDashboardQuery(
    { dashboardId, projectId },
    { enabled: Boolean(projectId && dashboardId && !invalidId) },
  );
  const { mutate: duplicateDashboard, isPending: isDuplicating } =
    useCreateProjectDashboardDuplicateMutation();
  const { mutate: updateDashboard, isPending: isUpdating } = useUpdateProjectDashboardMutation();
  const { mutate: deleteDashboard, isPending: isDeleting } = useDeleteProjectDashboardMutation();
  const dashboard = query.data;
  const effectiveLayout = localLayout ?? dashboard?.layout ?? null;
  const state = getDashboardCustomDashboardState({
    dashboard,
    error: query.error,
    isLoading: query.isPending,
  });

  useEffect(() => {
    if (dashboard?.layout) {
      setLocalLayout(dashboard.layout);
    }
  }, [dashboard?.layout]);

  const setDashboardWithUnsavedChanges = useCallback(
    (value: SetStateAction<DashboardInstance<ProjectDashboardWidgetPropMap>>) => {
      setLocalLayout(value);
      setHasUnsavedChanges(true);
    },
    [],
  );
  const { handleAddWidget, handleAddWidgetToSection, handleResetTargetSection } = useAddWidget({
    setDashboardWithUnsavedChanges,
  });
  const { initialWidgetProps, handleOpenEditWidget, handleSaveEditWidget } = useEditWidget({
    setDashboardWithUnsavedChanges,
  });
  useNativeBrowserNavigationBlocker(canEdit && isEditing && hasUnsavedChanges);

  const handleSaveChanges = useCallback(() => {
    if (!dashboard || !effectiveLayout) {
      return;
    }
    updateDashboard(
      {
        dashboardId: dashboard.id,
        description: dashboard.description,
        layout: effectiveLayout,
        name: dashboard.name,
        projectId,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setHasUnsavedChanges(false);
          toast.success({
            description: formatMessage({ id: 'project_dashboard.custom.toast.save_success' }),
            isDismissable: true,
          });
        },
        onError: () => {
          toast.error({
            description: formatMessage({ id: 'project_dashboard.custom.toast.save_error' }),
            isDismissable: true,
          });
        },
      },
    );
  }, [dashboard, effectiveLayout, formatMessage, projectId, updateDashboard]);

  const handleExitEdit = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setLocalLayout(dashboard?.layout ?? null);
  };
  const handleCreateSection = (name: string, description: string) => {
    const newSection = normalizeSection({
      children: [],
      description,
      key: uuidv4(),
      name,
      type: 'explicit',
    });
    setDashboardWithUnsavedChanges((previous) => ({
      ...previous,
      children: [...previous.children, newSection],
    }));
    setIsCreateSectionModalOpen(false);
  };

  if (!component || invalidId) {
    return <NotFound />;
  }
  const listUrl = getProjectDashboardsListRoute(component.key);
  if (state === DashboardCustomDashboardState.Loading) {
    return <DashboardCustomDashboardLoading />;
  }
  if (state === DashboardCustomDashboardState.NotFound) {
    return (
      <DashboardCustomDashboardNotFound
        backToListLabelId="project_dashboard.custom.not_found.back_to_list"
        descriptionId="project_dashboard.custom.not_found.description"
        listUrl={listUrl}
        titleId="project_dashboard.custom.not_found.title"
      />
    );
  }
  if (state === DashboardCustomDashboardState.InvalidLayout) {
    return (
      <DashboardCustomDashboardInvalidLayout
        backToListLabelId="project_dashboard.custom.not_found.back_to_list"
        descriptionId="project_dashboard.custom.error.invalid_layout.description"
        listUrl={listUrl}
        titleId="project_dashboard.custom.error.invalid_layout.title"
      />
    );
  }
  if (state === DashboardCustomDashboardState.Error || !dashboard || !effectiveLayout) {
    return (
      <DashboardCustomDashboardGenericError
        descriptionId="project_dashboard.custom.error.description"
        onRetry={() => {
          void query.refetch();
        }}
        titleId="project_dashboard.custom.error.title"
      />
    );
  }
  const dashboardForModal = {
    ...createEmptyDashboard<ProjectDashboardWidgetPropMap>(DashboardType.Custom),
    ...dashboard,
    layout: effectiveLayout,
  };
  const breadcrumbs: BreadcrumbsProps['items'] = [
    {
      linkElement: formatMessage({ id: 'project_dashboards.page' }),
      to: listUrl,
    },
    { hasEllipsis: true, linkElement: dashboard.name },
  ];
  const headerActions = (
    <>
      {isEditing && (
        <EditToolbar
          hasUnsavedChanges={hasUnsavedChanges}
          isUpdatingDashboard={isUpdating}
          onExitEdit={handleExitEdit}
          onSaveChanges={handleSaveChanges}
          onSetIsAddWidgetModalOpen={setIsAddWidgetModalOpen}
          onSetIsCreateSectionModalOpen={setIsCreateSectionModalOpen}
        />
      )}
      {!isEditing && canEdit && (
        <Button
          onClick={() => {
            setIsEditing(true);
          }}
          variety={ButtonVariety.Primary}
        >
          {formatMessage({ id: 'dashboard.edit_dashboard' })}
        </Button>
      )}
      {!isEditing && (
        <DashboardKebabMenu
          ariaLabel={formatMessage({ id: 'more_actions' })}
          id={`project-dashboard-actions-${dashboard.id}`}
          isVisible={canEdit}
          items={
            <DashboardKebabMenuItems
              dashboardName={dashboard.name}
              isBuiltIn={false}
              isDeleting={isDeleting}
              onDelete={({ close }) => {
                deleteDashboard(
                  { dashboardId: dashboard.id, projectId },
                  {
                    onSuccess: () => {
                      close();
                      navigate(listUrl);
                    },
                    onError: () => {
                      toast.error({
                        description: formatMessage({
                          id: 'project_dashboard.custom.toast.delete_error',
                        }),
                        isDismissable: true,
                      });
                    },
                  },
                );
              }}
              onDownloadSchema={
                canDownloadSchema
                  ? () => {
                      downloadDashboardSchema(dashboard);
                    }
                  : undefined
              }
              onDuplicate={() => {
                setIsDuplicateModalOpen(true);
              }}
              onEditNameDescription={() => {
                setIsEditModalOpen(true);
              }}
            />
          }
        />
      )}
    </>
  );

  return (
    <>
      <ProjectPageTemplate
        actions={headerActions}
        breadcrumbs={breadcrumbs}
        contentHeaderTitle={dashboard.name}
        description={
          <CustomDashboardEditStatus
            canShowEditor={canEdit}
            isEditing={isEditing}
            updatedAt={dashboard.updatedAt}
            updatedById={dashboard.updatedById}
          />
        }
        disableBranchSelector
        extraTitleSuffix={<DashboardTypeBadge dashboardType={DashboardType.Custom} />}
        title={dashboard.name}
      >
        <A11ySkipTarget anchor="project_dashboard_main" />
        {isStringDefined(dashboard.description) && (
          <DashboardDescriptionAccordion description={dashboard.description} />
        )}
        <DashboardCustomDashboardContent
          bodyMap={projectDashboardWidgetBodyMap}
          canEdit={canEdit}
          dashboard={effectiveLayout}
          editBehaviorMap={widgetEditBehaviorMap}
          emptyDashboardButtonLabelKey="project_dashboard.empty.button.enter_edit_mode"
          emptyDashboardEditDocumentationUrl={editDocumentationUrl}
          emptyDashboardViewDocumentationUrl={viewDocumentationUrl}
          headerMap={projectDashboardWidgetHeaderMap}
          isEditing={isEditing}
          isEmptyDashboard={isEmptyDashboard}
          onAddWidgetToSection={(index) => {
            handleAddWidgetToSection(index);
            setIsAddWidgetModalOpen(true);
          }}
          onDashboardChange={setDashboardWithUnsavedChanges}
          onWidgetEdit={(index, widget) => {
            handleOpenEditWidget(index, widget);
            setIsEditWidgetModalOpen(true);
          }}
          setIsEditing={setIsEditing}
        />
      </ProjectPageTemplate>

      <ProjectDashboardModal
        dashboard={dashboardForModal}
        isOpen={isEditModalOpen}
        isSaving={isUpdating}
        mode={DashboardMode.Edit}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        onOpenChange={setIsEditModalOpen}
        onSave={(updated) => {
          updateDashboard(
            {
              dashboardId: updated.id,
              description: updated.description,
              name: updated.name,
              projectId,
            },
            {
              onError: () => {
                toast.error({
                  description: formatMessage({ id: 'project_dashboard.custom.toast.save_error' }),
                  isDismissable: true,
                });
              },
              onSuccess: () => {
                setIsEditModalOpen(false);
                toast.success({
                  description: formatMessage({ id: 'project_dashboard.list.toast.edit_success' }),
                  isDismissable: true,
                });
              },
            },
          );
        }}
      />
      {isDuplicateModalOpen && (
        <ProjectDashboardModal
          dashboard={dashboardForModal}
          isOpen
          isSaving={isDuplicating}
          mode={DashboardMode.Duplicate}
          onClose={() => {
            setIsDuplicateModalOpen(false);
          }}
          onOpenChange={setIsDuplicateModalOpen}
          onSave={(duplicate) => {
            duplicateDashboard(
              {
                description: duplicate.description,
                duplicateSource: dashboard,
                name: duplicate.name,
                projectId,
              },
              {
                onError: () => {
                  toast.error({
                    description: formatMessage({
                      id: 'project_dashboard.list.toast.duplicate_error',
                    }),
                    isDismissable: true,
                  });
                },
                onSuccess: (created) => {
                  setIsDuplicateModalOpen(false);
                  toast.success({
                    description: formatMessage(
                      { id: 'project_dashboard.list.toast.duplicate_success' },
                      { dashboardName: created.name },
                    ),
                    isDismissable: true,
                  });
                  navigate(getProjectCustomDashboardRoute(created.id, component.key));
                },
              },
            );
          }}
        />
      )}
      <CreateSectionModal
        isOpen={isCreateSectionModalOpen}
        onClose={() => {
          setIsCreateSectionModalOpen(false);
        }}
        onConfirm={handleCreateSection}
      />
      <DashboardCustomDashboardWidgetModal
        initialWidget={isEditWidgetModalOpen ? initialWidgetProps : undefined}
        isAddWidgetModalOpen={isAddWidgetModalOpen}
        isEditWidgetModalOpen={isEditWidgetModalOpen}
        metricPickerOptions={metricPickerOptions}
        onOpenChange={(open) => {
          setIsAddWidgetModalOpen(open);
          setIsEditWidgetModalOpen(open);
          if (!open) {
            handleResetTargetSection();
          }
        }}
        onSaveWidget={isEditWidgetModalOpen ? handleSaveEditWidget : handleAddWidget}
        reducerOptions={{
          isPortfolioWidgetConfigurator: false,
          supportsNewCodeScopeForMetric: metricPickerOptions.supportsNewCodeScopeForMetric,
        }}
        renderOptions={({ dispatch, isEditMode, metricPickerOptions: options, state }) => (
          <ProjectWidgetOptions
            dispatch={dispatch}
            isEditMode={isEditMode}
            metricPickerOptions={options}
            state={state}
          />
        )}
        widgetBodyMap={projectDashboardWidgetBodyMap}
        widgetHeaderMap={projectDashboardWidgetHeaderMap}
      />
    </>
  );
}
