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
import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCurrentUser } from '~adapters/helpers/users';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { DashboardDescriptionAccordion } from '~feature-dashboards/dashboard-description/DashboardDescriptionAccordion';
import { Dashboard } from '~feature-dashboards/dashboard-layout/Dashboard';
import { DashboardCustomDashboardUnsupportedVersion } from '~feature-dashboards/dashboard-layout/DashboardCustomDashboardViews';
import { DashboardTypeBadge } from '~feature-dashboards/dashboard-list/DashboardTypeBadge';
import { UnsupportedDashboardVersionError } from '~feature-dashboards/helpers/dashboard-layout-validation-reporting';
import {
  widgetEditBehaviorMap,
  type ProjectDashboardWidgetPropMap,
} from '~feature-dashboards/types/dashboard-widget';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { DismissableMessageCallout } from '~shared/components/common/DismissableMessageCallout';
import NotFound from '~shared/components/NotFound';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { Tags } from '~shared/components/tags/Tags';
import { getBranchLikeQuery, isBranch, isPullRequest } from '~shared/helpers/branch-like';
import { isStringDefined } from '~shared/helpers/types';
import { BranchLikeBase } from '~shared/types/branch-like';
import { MetricKey } from '~shared/types/metrics';
import Favorite from '~sq-server-commons/components/controls/Favorite';
import HomePageSelect from '~sq-server-commons/components/controls/HomePageSelect';
import { CustomDashboardEditStatus } from '~sq-server-commons/components/dashboards/CustomDashboardEditStatus';
import { ComponentNavBindingStatus } from '~sq-server-commons/components/nav/ComponentNavBindingStatus';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { FishVisual } from '~sq-server-commons/design-system';
import { getComponentAsHomepage } from '~sq-server-commons/helpers/homepage';
import { enhanceMeasuresWithMetrics } from '~sq-server-commons/helpers/measures';
import { PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY } from '~sq-server-commons/helpers/project-dashboard-routes';
import { getProjectQueryUrl } from '~sq-server-commons/helpers/urls';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { useMeasuresAndLeakQuery } from '~sq-server-commons/queries/measures';
import { Branch } from '~sq-server-commons/types/branch-like';
import { Permissions } from '~sq-server-commons/types/permissions';
import { Component } from '~sq-server-commons/types/types';
import { HomePage } from '~sq-server-commons/types/users';
import { useGetProjectBuiltInDashboardQuery } from '../../../queries/project-dashboards';
import type { ProjectDashboardData } from '../../../types/project-dashboards';
import ComponentReportActions from '../../overview/branches/ComponentReportActions';
import MetaContentHeader from '../../overview/branches/MetaContentHeader';
import { App as ProjectOverviewApp } from '../../overview/components/App';
import { supportsCustomProjectDashboards } from '../permissions';
import { getProjectDashboardsListRoute, isProjectOverviewRoute } from '../routes';
import { ProjectBuiltInDashboardActions } from './ProjectBuiltInDashboardActions';
import {
  projectDashboardWidgetBodyMap,
  projectDashboardWidgetHeaderMap,
} from './projectDashboardWidgetMaps';

const NEW_PROJECT_OVERVIEW_BANNER_KEY = 'new-project-overview';

export function ProjectBuiltInDashboardPage() {
  const { formatMessage } = useIntl();
  const { component } = useComponent();
  const { edition } = useAppState();
  const params = useParams<{ dashboardKey?: string }>();
  const { dashboardKey = PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY } = params;
  const [searchParams] = useSearchParams();
  const { currentUser, isLoggedIn } = useCurrentUser();
  const { data: branchLike } = useCurrentBranchQuery(component);
  const branch = isBranch(branchLike) ? branchLike : undefined;
  const isProjectOverview =
    isProjectOverviewRoute(dashboardKey, searchParams.toString()) || !params.dashboardKey;
  const isPullRequestOverview = isProjectOverview && isPullRequest(branchLike);
  const canDownloadSchema = hasGlobalPermission(currentUser, Permissions.Admin);
  const isProjectAnalyzed = isStringDefined(component?.analysisDate);
  const overviewPageClassName = isProjectOverview ? 'it__overview' : undefined;
  const { data: measuresAndLeak } = useMeasuresAndLeakQuery(
    {
      branchLike: branch,
      componentKey: component?.key ?? '',
      metricKeys: [MetricKey.ncloc],
    },
    {
      enabled:
        Boolean(component) && isProjectOverview && isProjectAnalyzed && !isPullRequestOverview,
    },
  );
  const query = useGetProjectBuiltInDashboardQuery(
    { dashboardKey },
    {
      enabled:
        Boolean(dashboardKey) &&
        (!isProjectOverview || (isProjectAnalyzed && !isPullRequestOverview)),
    },
  );

  if (!component) {
    return <NotFound />;
  }

  if (query.error instanceof UnsupportedDashboardVersionError) {
    return (
      <ProjectPageTemplate
        disableBranchSelector={!isProjectOverview}
        title={formatMessage({
          id: isProjectOverview ? 'overview.page' : 'project_dashboards.page',
        })}
      >
        <DashboardCustomDashboardUnsupportedVersion />
      </ProjectPageTemplate>
    );
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
      branchLike={branchLike}
      component={component}
      isVisible={isProjectOverview}
    />
  );

  return (
    <ProjectBuiltInDashboardContent
      branchLike={branchLike}
      callout={overviewCallout}
      canDownloadSchema={canDownloadSchema}
      canViewAllDashboards={supportsCustomProjectDashboards(edition)}
      component={component}
      dashboard={query.data}
      isLoading={query.isPending || !query.data}
      isLoggedIn={isLoggedIn}
      isProjectOverview={isProjectOverview}
      isPullRequestOverview={isPullRequestOverview}
      metadata={overviewMetadata}
      overviewActions={overviewActions}
      overviewPageClassName={overviewPageClassName}
      overviewTitle={overviewTitle}
    />
  );
}

interface ProjectBuiltInDashboardContentProps {
  branchLike?: BranchLikeBase;
  callout: ReactNode;
  canViewAllDashboards: boolean;
  canDownloadSchema: boolean;
  component: Component;
  dashboard?: ProjectDashboardData;
  isLoading: boolean;
  isLoggedIn: boolean;
  isProjectOverview: boolean;
  isPullRequestOverview: boolean;
  metadata: ReactNode;
  overviewActions: ReactNode;
  overviewPageClassName?: string;
  overviewTitle: string;
}

function ProjectBuiltInDashboardContent(props: Readonly<ProjectBuiltInDashboardContentProps>) {
  const { formatMessage } = useIntl();
  const {
    branchLike,
    callout,
    canViewAllDashboards,
    canDownloadSchema,
    component,
    dashboard,
    isLoading,
    isLoggedIn,
    isProjectOverview,
    isPullRequestOverview,
    metadata,
    overviewActions,
    overviewPageClassName,
    overviewTitle,
  } = props;
  const headerActions = (
    <>
      {overviewActions}
      {!isProjectOverview && dashboard && (
        <ProjectBuiltInDashboardActions
          canCreateCustomDashboard={isLoggedIn}
          canDownloadSchema={canDownloadSchema}
          dashboard={dashboard}
          projectKey={component.key}
        />
      )}
    </>
  );
  const breadcrumbs: BreadcrumbsProps['items'] = dashboard
    ? [
        {
          linkElement: formatMessage({ id: 'project_dashboards.page' }),
          to: getProjectDashboardsListRoute(component.key),
        },
        { hasEllipsis: true, linkElement: dashboard.name },
      ]
    : [];
  let dashboardContent: ReactNode = <Spinner isLoading />;

  if (isPullRequestOverview) {
    dashboardContent = <ProjectHealthDashboardPullRequestEmptyState />;
  } else if (!isLoading && dashboard) {
    dashboardContent = (
      <>
        <A11ySkipTarget anchor="project_dashboard_main" />
        <div className="sw-flex sw-flex-col sw-gap-6">
          <ProjectDashboardHeader
            branchLike={branchLike}
            canViewAllDashboards={canViewAllDashboards}
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
      </>
    );
  }

  return (
    <ProjectPageTemplate
      actions={headerActions}
      breadcrumbs={!isProjectOverview && dashboard ? breadcrumbs : undefined}
      callout={callout}
      contentHeaderTitle={
        !isProjectOverview && dashboard ? (
          <div className="sw-flex sw-items-center sw-gap-2">
            {dashboard.name}
            <DashboardTypeBadge dashboardType={dashboard.type} />
          </div>
        ) : undefined
      }
      description={
        !isProjectOverview && dashboard ? (
          <CustomDashboardEditStatus
            canShowEditor={isLoggedIn}
            isEditing={false}
            showSonarWhenEditorMissing
            updatedAt={dashboard.updatedAt}
          />
        ) : undefined
      }
      disableBranchSelector={!isProjectOverview}
      metadata={metadata}
      pageClassName={overviewPageClassName}
      title={
        isProjectOverview
          ? overviewTitle
          : (dashboard?.name ?? formatMessage({ id: 'project_dashboards.page' }))
      }
    >
      {dashboardContent}
    </ProjectPageTemplate>
  );
}

function ProjectHealthDashboardPullRequestEmptyState() {
  return (
    <div className="sw-flex sw-flex-col sw-items-center sw-justify-center sw-gap-6 sw-h-full">
      <FishVisual />
      <div className="sw-flex sw-flex-col sw-text-center">
        <Heading as="h2" hasMarginBottom>
          <FormattedMessage id="overview.dashboard.not_available_for_pull_requests" />
        </Heading>
        <Text>
          <FormattedMessage id="overview.dashboard.not_available_for_pull_requests.description" />
        </Text>
      </div>
    </div>
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
  branchLike?: BranchLikeBase;
  canViewAllDashboards: boolean;
  dashboardDescription?: string;
  dashboardName: string;
  isProjectOverview: boolean;
  projectKey: string;
}

function ProjectDashboardHeader(props: Readonly<ProjectDashboardHeaderProps>) {
  const {
    branchLike,
    canViewAllDashboards,
    dashboardDescription,
    dashboardName,
    isProjectOverview,
    projectKey,
  } = props;

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
      {canViewAllDashboards && (
        <Button to={getProjectDashboardsListRoute(projectKey, branchLike)}>
          <FormattedMessage id="dashboard.view_all_dashboards" />
        </Button>
      )}
    </div>
  );
}

interface ProjectOverviewIntroductionProps {
  branchLike?: BranchLikeBase;
  component: Component;
  isVisible: boolean;
}

function ProjectOverviewIntroduction(props: Readonly<ProjectOverviewIntroductionProps>) {
  const { branchLike, component, isVisible } = props;
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
                to={getProjectQueryUrl(component.key, getBranchLikeQuery(branchLike))}
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
