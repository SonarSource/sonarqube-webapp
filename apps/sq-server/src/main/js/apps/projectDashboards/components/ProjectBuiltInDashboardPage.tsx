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
  BreadcrumbsProps,
  Button,
  ButtonSize,
  ButtonVariety,
  Heading,
  Layout,
  Link,
  LinkHighlight,
  Spinner,
  Text,
  TooltipSide,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '~adapters/helpers/users';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { DashboardDescriptionAccordion } from '~feature-dashboards/dashboard-description/DashboardDescriptionAccordion';
import { Dashboard } from '~feature-dashboards/dashboard-layout/Dashboard';
import { DashboardTypeBadge } from '~feature-dashboards/dashboard-list/DashboardTypeBadge';
import {
  widgetEditBehaviorMap,
  type ProjectDashboardWidgetPropMap,
} from '~feature-dashboards/types/dashboard-widget';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { DismissableMessageCallout } from '~shared/components/common/DismissableMessageCallout';
import NotFound from '~shared/components/NotFound';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { Tags } from '~shared/components/tags/Tags';
import { isBranch } from '~shared/helpers/branch-like';
import { isStringDefined } from '~shared/helpers/types';
import { MetricKey } from '~shared/types/metrics';
import Favorite from '~sq-server-commons/components/controls/Favorite';
import HomePageSelect from '~sq-server-commons/components/controls/HomePageSelect';
import { ComponentNavBindingStatus } from '~sq-server-commons/components/nav/ComponentNavBindingStatus';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { getComponentAsHomepage } from '~sq-server-commons/helpers/homepage';
import { enhanceMeasuresWithMetrics } from '~sq-server-commons/helpers/measures';
import { PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY } from '~sq-server-commons/helpers/project-dashboard-routes';
import { getProjectUrl } from '~sq-server-commons/helpers/urls';
import { useMeasuresAndLeakQuery } from '~sq-server-commons/queries/measures';
import { Branch } from '~sq-server-commons/types/branch-like';
import { Component } from '~sq-server-commons/types/types';
import { HomePage } from '~sq-server-commons/types/users';
import { useGetProjectBuiltInDashboardQuery } from '../../../queries/project-dashboards';
import ComponentReportActions from '../../overview/branches/ComponentReportActions';
import MetaContentHeader from '../../overview/branches/MetaContentHeader';
import { App as ProjectOverviewApp } from '../../overview/components/App';
import { getProjectDashboardsListRoute } from '../routes';
import {
  projectDashboardWidgetBodyMap,
  projectDashboardWidgetHeaderMap,
} from './projectDashboardWidgetMaps';

const NEW_PROJECT_OVERVIEW_BANNER_KEY = 'new-project-overview';

export function ProjectBuiltInDashboardPage() {
  const { formatMessage } = useIntl();
  const { component } = useComponent();
  const { dashboardKey = '' } = useParams<{ dashboardKey?: string }>();
  const { isLoggedIn } = useCurrentUser();
  const { data: branchLike } = useCurrentBranchQuery(component);
  const branch = isBranch(branchLike) ? branchLike : undefined;
  const isProjectOverview = dashboardKey === PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY;
  const isProjectAnalyzed = isStringDefined(component?.analysisDate);
  const overviewPageClassName = isProjectOverview ? 'it__overview' : undefined;
  const { data: measuresAndLeak } = useMeasuresAndLeakQuery(
    {
      branchLike: branch,
      componentKey: component?.key ?? '',
      metricKeys: [MetricKey.ncloc],
    },
    { enabled: Boolean(component) && isProjectOverview && isProjectAnalyzed },
  );
  const query = useGetProjectBuiltInDashboardQuery(
    { dashboardKey },
    { enabled: Boolean(dashboardKey) && (!isProjectOverview || isProjectAnalyzed) },
  );

  if (!component) {
    return <NotFound />;
  }

  const fallback = getProjectPageFallback(
    component,
    isProjectAnalyzed,
    isProjectOverview,
    Boolean(query.isError),
  );
  if (fallback) {
    return fallback;
  }

  const measures = enhanceMeasuresWithMetrics(
    measuresAndLeak?.component.measures ?? [],
    measuresAndLeak?.metrics ?? [],
  );
  const currentPage = getComponentAsHomepage(component, branch);
  const overviewTitle = formatMessage({ id: 'overview.page' });
  const overviewActions = (
    <ProjectOverviewActions
      branch={branch}
      component={component}
      currentPage={currentPage}
      isLoggedIn={isLoggedIn}
      isVisible={isProjectOverview}
    />
  );
  const overviewMetadata = isProjectOverview ? (
    <ProjectOverviewMetadata branch={branch} component={component} measures={measures} />
  ) : undefined;
  const overviewCallout = (
    <ProjectOverviewIntroduction
      branch={branch}
      component={component}
      isVisible={isProjectOverview}
    />
  );

  if (query.isPending || !query.data) {
    return (
      <ProjectPageTemplate
        actions={overviewActions}
        callout={overviewCallout}
        disableBranchSelector
        metadata={overviewMetadata}
        pageClassName={overviewPageClassName}
        title={isProjectOverview ? overviewTitle : formatMessage({ id: 'project_dashboards.page' })}
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
      actions={overviewActions}
      breadcrumbs={isProjectOverview ? undefined : breadcrumbs}
      callout={overviewCallout}
      contentHeaderTitle={
        isProjectOverview ? undefined : (
          <div className="sw-flex sw-items-center sw-gap-2">
            {dashboard.name}
            <DashboardTypeBadge dashboardType={dashboard.type} />
          </div>
        )
      }
      description={
        isProjectOverview ? undefined : (
          <Text isSubtle>{formatMessage({ id: 'project_dashboard.built_in' })}</Text>
        )
      }
      disableBranchSelector
      metadata={overviewMetadata}
      pageClassName={overviewPageClassName}
      title={isProjectOverview ? overviewTitle : dashboard.name}
    >
      <A11ySkipTarget anchor="project_dashboard_main" />
      <div className="sw-flex sw-flex-col sw-gap-6">
        <ProjectDashboardHeader
          dashboardDescription={dashboard.description}
          dashboardName={dashboard.name}
          isProjectOverview={isProjectOverview}
          projectKey={component.key}
        />
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
      </div>
    </ProjectPageTemplate>
  );
}

function getProjectPageFallback(
  component: Component,
  isProjectAnalyzed: boolean,
  isProjectOverview: boolean,
  hasQueryError: boolean,
) {
  if (isProjectOverview && !isProjectAnalyzed) {
    return <ProjectOverviewApp component={component} />;
  }

  return hasQueryError ? <NotFound /> : undefined;
}

interface ProjectOverviewMetadataProps {
  branch?: Branch;
  component: Component;
  measures: ReturnType<typeof enhanceMeasuresWithMetrics>;
}

function ProjectOverviewMetadata(props: Readonly<ProjectOverviewMetadataProps>) {
  const { branch, component, measures } = props;

  return (
    <>
      <MetaContentHeader branch={branch} component={component} measures={measures} />
      <Tags allowUpdate={false} tags={component.tags ?? []} />
    </>
  );
}

interface ProjectDashboardHeaderProps {
  dashboardDescription?: string;
  dashboardName: string;
  isProjectOverview: boolean;
  projectKey: string;
}

function ProjectDashboardHeader(props: Readonly<ProjectDashboardHeaderProps>) {
  const { dashboardDescription, dashboardName, isProjectOverview, projectKey } = props;

  if (!isProjectOverview) {
    return isStringDefined(dashboardDescription) ? (
      <DashboardDescriptionAccordion description={dashboardDescription} />
    ) : null;
  }

  return (
    <div className="sw-flex sw-items-start sw-justify-between sw-gap-4">
      <div className="sw-flex sw-flex-col sw-gap-2">
        <Heading as="h2">{dashboardName}</Heading>
        {isStringDefined(dashboardDescription) && <Text isSubtle>{dashboardDescription}</Text>}
      </div>
      <Button to={getProjectDashboardsListRoute(projectKey)}>
        <FormattedMessage id="dashboard.view_all_dashboards" />
      </Button>
    </div>
  );
}

interface ProjectOverviewIntroductionProps {
  branch?: Branch;
  component: Component;
  isVisible: boolean;
}

function ProjectOverviewIntroduction(props: Readonly<ProjectOverviewIntroductionProps>) {
  const { branch, component, isVisible } = props;
  const { formatMessage } = useIntl();

  if (!isVisible) {
    return null;
  }

  return (
    <DismissableMessageCallout
      alertKey={NEW_PROJECT_OVERVIEW_BANNER_KEY}
      title={formatMessage({ id: 'project_dashboard.overview.banner.title' })}
      variety="info"
    >
      <Text as="p">
        <FormattedMessage
          id="project_dashboard.overview.banner.description"
          values={{
            link: (text) => (
              <Link
                highlight={LinkHighlight.CurrentColor}
                to={getProjectUrl(component.key, branch?.name)}
              >
                {text}
              </Link>
            ),
          }}
        />
      </Text>
    </DismissableMessageCallout>
  );
}

interface ProjectOverviewActionsProps {
  branch?: Branch;
  component: Component;
  currentPage?: HomePage;
  isLoggedIn: boolean;
  isVisible: boolean;
}

function ProjectOverviewActions(props: Readonly<ProjectOverviewActionsProps>) {
  const { branch, component, currentPage, isLoggedIn, isVisible } = props;

  if (!isVisible) {
    return null;
  }

  return (
    <Layout.ContentHeader.Actions>
      <ComponentReportActions branch={branch} component={component} />
      {currentPage && <HomePageSelect currentPage={currentPage} type="button" />}
      <ComponentNavBindingStatus component={component} />
      {isLoggedIn && (
        <Favorite
          component={component.key}
          componentName={component.name}
          favorite={Boolean(component.isFavorite)}
          qualifier={component.qualifier}
          side={TooltipSide.Top}
          size={ButtonSize.Large}
          variety={ButtonVariety.Default}
        />
      )}
    </Layout.ContentHeader.Actions>
  );
}
