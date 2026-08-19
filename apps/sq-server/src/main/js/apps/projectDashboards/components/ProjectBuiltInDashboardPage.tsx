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

import { BreadcrumbsProps, Spinner, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { DashboardDescriptionAccordion } from '~feature-dashboards/dashboard-description/DashboardDescriptionAccordion';
import { Dashboard } from '~feature-dashboards/dashboard-layout/Dashboard';
import { DashboardTypeBadge } from '~feature-dashboards/dashboard-list/DashboardTypeBadge';
import {
  widgetEditBehaviorMap,
  type ProjectDashboardWidgetPropMap,
} from '~feature-dashboards/types/dashboard-widget';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import NotFound from '~shared/components/NotFound';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isStringDefined } from '~shared/helpers/types';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { useGetProjectBuiltInDashboardQuery } from '../../../queries/project-dashboards';
import { getProjectDashboardsListRoute } from '../routes';
import {
  projectDashboardWidgetBodyMap,
  projectDashboardWidgetHeaderMap,
} from './projectDashboardWidgetMaps';

export function ProjectBuiltInDashboardPage() {
  const { formatMessage } = useIntl();
  const { component } = useComponent();
  const { dashboardKey = '' } = useParams<{ dashboardKey?: string }>();
  const query = useGetProjectBuiltInDashboardQuery(
    { dashboardKey },
    { enabled: Boolean(dashboardKey) },
  );

  if (!component || query.isError) {
    return <NotFound />;
  }
  if (query.isPending || !query.data) {
    return (
      <ProjectPageTemplate
        disableBranchSelector
        title={formatMessage({ id: 'project_dashboards.page' })}
      >
        <Spinner isLoading />
      </ProjectPageTemplate>
    );
  }

  const dashboard = query.data;
  const breadcrumbs: BreadcrumbsProps['items'] = [
    {
      linkElement: formatMessage({ id: 'project_dashboards.page' }),
      to: getProjectDashboardsListRoute(component.key),
    },
    { hasEllipsis: true, linkElement: dashboard.name },
  ];

  return (
    <ProjectPageTemplate
      breadcrumbs={breadcrumbs}
      contentHeaderTitle={
        <div className="sw-flex sw-items-center sw-gap-2">
          {dashboard.name}
          <DashboardTypeBadge dashboardType={dashboard.type} />
        </div>
      }
      description={<Text isSubtle>{formatMessage({ id: 'project_dashboard.built_in' })}</Text>}
      disableBranchSelector
      title={dashboard.name}
    >
      <A11ySkipTarget anchor="project_dashboard_main" />
      {isStringDefined(dashboard.description) && (
        <DashboardDescriptionAccordion description={dashboard.description} />
      )}
      <Dashboard<ProjectDashboardWidgetPropMap>
        bodyMap={projectDashboardWidgetBodyMap}
        dashboard={dashboard.layout}
        editBehaviorMap={widgetEditBehaviorMap}
        headerMap={projectDashboardWidgetHeaderMap}
        isEditing={false}
        onAddWidgetToSection={() => undefined}
        onDashboardChange={() => undefined}
        onWidgetEdit={() => undefined}
        width={12}
      />
    </ProjectPageTemplate>
  );
}
