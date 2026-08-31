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

import { Button, IconPeople, Pagination, Text, toast } from '@sonarsource/echoes-react';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createEmptyDashboard } from '~feature-dashboards/dashboard-layout/logic/constants';
import { DashboardListToolbar } from '~feature-dashboards/dashboard-list/DashboardListToolbar';
import { useMergedDashboardListState } from '~feature-dashboards/dashboard-list/hooks/useMergedDashboardListState';
import {
  DashboardFilter,
  DashboardMode,
  DashboardType,
  PAGE_SIZE,
} from '~feature-dashboards/types/dashboard-list';
import type { ProjectDashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isDefined } from '~shared/helpers/types';
import { Visibility } from '~shared/types/component';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';

import { useUsersByIdsQuery } from '~sq-server-commons/queries/users';
import { useProjectId } from '~sq-server-commons/sq-server-adapters/helpers/useProjectId';
import { useCurrentUser } from '~sq-server-commons/sq-server-adapters/helpers/users';
import {
  useCreateProjectDashboardMutation,
  useGetProjectBuiltInDashboardsListQuery,
  useGetProjectCustomDashboardsListQuery,
} from '../../../queries/project-dashboards';
import type {
  ProjectDashboardData,
  ProjectDashboardListItem,
} from '../../../types/project-dashboards';
import { supportsCustomProjectDashboards } from '../permissions';
import { getProjectCustomDashboardRoute } from '../routes';
import { ProjectDashboardModal } from './ProjectDashboardModal';
import { ProjectDashboardsTable } from './ProjectDashboardsTable';

const MERGED_DASHBOARD_FETCH_PAGE_SIZE = 5000;

export function ProjectDashboardsListPage() {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useCurrentUser();
  const { edition } = useAppState();
  const { component } = useComponent();
  const supportsCustomDashboards = supportsCustomProjectDashboards(edition);
  const canEdit = currentUser.isLoggedIn && supportsCustomDashboards;
  const projectId = useProjectId() ?? '';
  const projectKey = component?.key ?? '';
  const query = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(DashboardFilter.All);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { mutate: createDashboard, isPending: isCreating } = useCreateProjectDashboardMutation();
  const isAllFilter = filter === DashboardFilter.All;
  const showCustom = supportsCustomDashboards && filter !== DashboardFilter.BuiltIn;
  const showBuiltIn = filter !== DashboardFilter.Custom;
  const { data: customDashboardsData, isPending: isLoadingCustom } =
    useGetProjectCustomDashboardsListQuery(
      {
        projectId,
        q: query,
        ...(isAllFilter
          ? { pageIndex: 1, pageSize: MERGED_DASHBOARD_FETCH_PAGE_SIZE }
          : { pageIndex: currentPage, pageSize: PAGE_SIZE }),
      },
      { enabled: Boolean(projectId) && showCustom },
    );
  const { data: builtInDashboardsData, isPending: isLoadingBuiltIn } =
    useGetProjectBuiltInDashboardsListQuery(
      {
        q: query,
        ...(isAllFilter
          ? { pageIndex: 1, pageSize: MERGED_DASHBOARD_FETCH_PAGE_SIZE }
          : { pageIndex: currentPage, pageSize: PAGE_SIZE }),
      },
      { enabled: Boolean(projectId) && showBuiltIn },
    );
  const isLoadingDashboards = (showCustom && isLoadingCustom) || (showBuiltIn && isLoadingBuiltIn);
  const { dashboards, paging } = useMergedDashboardListState<ProjectDashboardListItem>({
    builtInDashboardsData,
    currentPage,
    customDashboardsData,
    filter,
    pageSize: PAGE_SIZE,
  });
  const creatorIds = useMemo(
    () => dashboards.map((dashboard) => dashboard.createdById).filter(isDefined),
    [dashboards],
  );
  const { data: creators } = useUsersByIdsQuery(canEdit ? creatorIds : []);
  const debouncedSetQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchParams(
          (previous) => {
            if (value) {
              previous.set('q', value);
            } else {
              previous.delete('q');
            }
            return previous;
          },
          { replace: true },
        );
      }, 250),
    [setSearchParams],
  );

  useEffect(
    () => () => {
      debouncedSetQuery.cancel();
    },
    [debouncedSetQuery],
  );

  const emptyDashboard: ProjectDashboardData = {
    ...createEmptyDashboard<ProjectDashboardWidgetPropMap>(DashboardType.Custom),
    type: DashboardType.Custom,
  };
  const createButton = canEdit ? (
    <Button
      isDisabled={!projectId}
      onClick={() => {
        setIsCreateModalOpen(true);
      }}
    >
      <FormattedMessage id="project_dashboards.create_dashboard" />
    </Button>
  ) : undefined;
  const description = (
    <Text>
      <FormattedMessage
        id="project_dashboards.page.description"
        values={{
          link: (text) => (
            <DocumentationLink enableOpenInNewTab to={DocLink.ProjectManagementAllDashboards}>
              {text}
            </DocumentationLink>
          ),
        }}
      />
    </Text>
  );
  const metadataMessageId =
    component?.visibility === Visibility.Public
      ? 'project_dashboards.page.public_project_message'
      : 'project_dashboards.page.private_project_message';
  const metadata = (
    <div className="sw-flex sw-items-center sw-gap-2">
      <IconPeople />
      <Text isSubtle>
        <FormattedMessage id={metadataMessageId} />
      </Text>
    </div>
  );
  const builtInFilterOption = {
    label: formatMessage({ id: 'dashboard.type.built_in' }),
    value: DashboardFilter.BuiltIn,
  };
  const filterOptions = supportsCustomDashboards
    ? [
        { label: formatMessage({ id: 'all' }), value: DashboardFilter.All },
        builtInFilterOption,
        { label: formatMessage({ id: 'dashboard.type.custom' }), value: DashboardFilter.Custom },
      ]
    : [builtInFilterOption];

  return (
    <ProjectPageTemplate
      actions={createButton}
      description={description}
      disableBranchSelector
      metadata={metadata}
      title={formatMessage({ id: 'project_dashboards.page' })}
    >
      {canEdit && (
        <ProjectDashboardModal
          dashboard={emptyDashboard}
          isOpen={isCreateModalOpen}
          isSaving={isCreating}
          mode={DashboardMode.Create}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
          onOpenChange={setIsCreateModalOpen}
          onSave={(dashboard) => {
            if (!projectId) {
              return;
            }

            createDashboard(
              { description: dashboard.description, name: dashboard.name, projectId },
              {
                onSuccess: (created) => {
                  setIsCreateModalOpen(false);
                  toast.success({
                    description: formatMessage(
                      { id: 'project_dashboard.list.toast.create_success' },
                      { dashboardName: created.name },
                    ),
                    isDismissable: true,
                  });
                  navigate(getProjectCustomDashboardRoute(created.id, projectKey));
                },
                onError: () => {
                  toast.error({
                    description: formatMessage({ id: 'project_dashboard.list.toast.create_error' }),
                    isDismissable: true,
                  });
                },
              },
            );
          }}
        />
      )}
      <DashboardListToolbar
        filter={filter}
        filterOptions={filterOptions}
        onFilter={(value) => {
          setFilter(value as DashboardFilter);
          setCurrentPage(1);
        }}
        onSearch={(value) => {
          setSearchInput(value);
          setCurrentPage(1);
          debouncedSetQuery(value);
        }}
        placeholderLabel={formatMessage({ id: 'project_dashboards.search_placeholder' })}
        searchInput={searchInput}
        total={paging.total}
        totalLabel={
          <FormattedMessage
            id="project_dashboards.number_of_dashboards"
            values={{ count: paging.total, b: (text) => <b>{text}</b> }}
          />
        }
      />
      <ProjectDashboardsTable
        canEdit={canEdit}
        dashboardCreators={creators ?? {}}
        dashboards={dashboards}
        isLoadingDashboards={isLoadingDashboards}
        projectId={projectId}
        projectKey={projectKey}
      />
      {paging.total > PAGE_SIZE && (
        <div className="sw-flex sw-justify-center sw-mt-4">
          <Pagination
            isDisabled={isLoadingDashboards}
            onChange={setCurrentPage}
            page={currentPage}
            totalPages={Math.ceil(paging.total / PAGE_SIZE)}
          />
        </div>
      )}
    </ProjectPageTemplate>
  );
}
