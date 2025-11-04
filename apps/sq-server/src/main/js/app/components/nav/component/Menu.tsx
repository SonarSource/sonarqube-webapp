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

import { DropdownMenu } from '@sonarsource/echoes-react';
import { pick } from 'lodash';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { useLocation } from '~shared/components/hoc/withRouter';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike, isProject } from '~shared/helpers/component';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { BranchParameters } from '~shared/types/branch-like';
import { Extension } from '~shared/types/common';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { DisabledTabLink, NavBarTabLink, NavBarTabs } from '~sq-server-commons/design-system';
import { hasMessage } from '~sq-server-commons/helpers/l10n';
import {
  getPortfolioUrl,
  getProjectQualityProfileSettingsUrl,
  getProjectQueryUrl,
} from '~sq-server-commons/helpers/urls';
import { useBranchesQuery } from '~sq-server-commons/queries/branch';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { Feature } from '~sq-server-commons/types/features';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { Component } from '~sq-server-commons/types/types';
import { MenuMoreDropdown } from './MenuMoreDropdown';

const MAXIMUM_DISPLAYED_LINK_COUNT = 8;

const SETTINGS_URLS = [
  '/project/admin',
  '/project/baseline',
  '/project/branches',
  '/project/settings',
  '/project/license_profiles',
  '/project/quality_profiles',
  '/project/quality_gate',
  '/project/links',
  '/project_roles',
  '/project/history',
  'background_tasks',
  '/project/key',
  '/project/deletion',
  '/project/webhooks',
];

interface Props extends WithAvailableFeaturesProps {
  component: Component;
  isInProgress?: boolean;
  isPending?: boolean;
}
type Query = BranchParameters & { id: string };

export function Menu(props: Readonly<Props>) {
  const { query: urlQuery } = useLocation();
  const { component, hasFeature, isInProgress, isPending } = props;
  const { extensions = [], canBrowseAllChildProjects, qualifier, configuration = {} } = component;

  const { data: branchLikes = [] } = useBranchesQuery(component);
  const { data: branchLike } = useCurrentBranchQuery(component);

  const { data: architectureOptIn, isLoading: isLoadingArchitectureOptIn } = useGetValueQuery({
    key: SettingsKey.DesignAndArchitecture,
  });

  const { currentUser } = useCurrentUser();

  const isApplicationChildInaccessible = isApplication(qualifier) && !canBrowseAllChildProjects;

  const intl = useIntl();
  const location = useLocation();

  const hasAnalysis = () => {
    const hasBranches = branchLikes.length > 1;
    return hasBranches || isInProgress || isPending || component.analysisDate !== undefined;
  };

  const isGovernanceEnabled = extensions.some((extension) =>
    extension.key.startsWith('governance/'),
  );

  const getQuery = (): Query => {
    return {
      ...pick(urlQuery, ['pullRequest', 'branch']),
      id: component.key,
      ...getBranchLikeQuery(branchLike),
    };
  };

  const renderLinkWhenInaccessibleChild = (label: string) => {
    return (
      <DisabledTabLink
        label={label}
        overlay={
          <FormattedMessage
            id="layout.all_project_must_be_accessible"
            values={{ qualifier: <FormattedMessage id={`qualifier.${qualifier}`} /> }}
          />
        }
      />
    );
  };

  const renderDropdownMenuLink = ({
    key,
    label,
    pathname,
    additionalQueryParams = {},
  }: DropdownMenuLinkArgs) => {
    const query = getQuery();

    return (
      <DropdownMenu.ItemLink
        key={key ?? pathname}
        to={{
          pathname,
          search: new URLSearchParams({ ...query, ...additionalQueryParams }).toString(),
        }}
      >
        {label}
      </DropdownMenu.ItemLink>
    );
  };

  const renderMenuLink = ({
    label,
    pathname,
    additionalQueryParams = {},
  }: {
    additionalQueryParams?: Record<string, string>;
    label: string;
    pathname: string;
  }) => {
    const query = getQuery();
    if (isApplicationChildInaccessible) {
      return renderLinkWhenInaccessibleChild(label);
    }
    return hasAnalysis() ? (
      <NavBarTabLink
        text={label}
        to={{
          pathname,
          search: new URLSearchParams({ ...query, ...additionalQueryParams }).toString(),
        }}
      />
    ) : (
      <DisabledTabLink
        label={label}
        overlay={intl.formatMessage({ id: 'layout.must_be_configured' })}
      />
    );
  };

  const renderDashboardLink = () => {
    const { id, ...branchLike } = getQuery();

    const label = intl.formatMessage({ id: 'overview.page' });

    if (isPortfolioLike(qualifier)) {
      return isGovernanceEnabled ? <NavBarTabLink text={label} to={getPortfolioUrl(id)} /> : null;
    }

    const showingTutorial = location.pathname.includes('/tutorials');

    if (showingTutorial) {
      return (
        <DisabledTabLink
          label={label}
          overlay={intl.formatMessage({ id: 'layout.must_be_configured' })}
        />
      );
    }

    if (isApplicationChildInaccessible) {
      return renderLinkWhenInaccessibleChild(label);
    }
    return <NavBarTabLink text={label} to={getProjectQueryUrl(id, branchLike)} />;
  };

  const renderBreakdownLink = () => {
    return isPortfolioLike(qualifier) && isGovernanceEnabled
      ? renderMenuLink({
          label: intl.formatMessage({ id: 'portfolio_breakdown.page' }),
          pathname: '/code',
        })
      : null;
  };

  const getCodeLinkData = () => {
    const label = isApplication(qualifier)
      ? intl.formatMessage({ id: 'view_projects.page' })
      : intl.formatMessage({ id: 'code.page' });

    const pathname = '/code';

    return { label, pathname };
  };

  const getActivityLinkData = () => {
    const label = intl.formatMessage({ id: 'project_activity.page' });
    const pathname = '/project/activity';

    return { label, pathname };
  };

  const renderIssuesLink = () => {
    return renderMenuLink({
      label: intl.formatMessage({ id: 'issues.page' }),
      pathname: '/project/issues',
      additionalQueryParams: DEFAULT_ISSUES_QUERY,
    });
  };

  const getComponentMeasuresLinkData = () => {
    const label = intl.formatMessage({ id: 'layout.measures' });
    const pathname = '/component_measures';

    return { label, pathname };
  };

  const renderSecurityHotspotsLink = () => {
    const isPortfolio = isPortfolioLike(qualifier);
    return (
      !isPortfolio &&
      renderMenuLink({
        label: intl.formatMessage({ id: 'layout.security_hotspots' }),
        pathname: '/security_hotspots',
      })
    );
  };

  const renderReleaseRisksLink = () => {
    if (!hasFeature(Feature.Sca)) {
      return null;
    }

    const { pathname, search } = getRisksUrl({
      newParams: getQuery(),
    });
    const additionalQueryParams = Object.fromEntries(new URLSearchParams(search));

    return renderMenuLink({
      label: intl.formatMessage({ id: 'dependencies.risks' }),
      pathname,
      additionalQueryParams,
    });
  };

  const renderLicenseProfilesLink = (query: Query, isPortfolio: boolean) => {
    // License profiles are only available for Sca and not for portfolios
    if (isPortfolio || !hasFeature(Feature.Sca)) {
      return null;
    }

    /** For right now, license profile permissions are based on quality profiles */
    if (!configuration.showQualityProfiles) {
      return null;
    }

    return (
      <DropdownMenu.ItemLink
        key="license-profiles"
        to={{
          pathname: addons.sca?.PROJECT_LICENSE_ROUTE_NAME,
          search: new URLSearchParams(query).toString(),
        }}
      >
        {intl.formatMessage({ id: 'sca.licenses.page' })}
      </DropdownMenu.ItemLink>
    );
  };

  const renderArchitectureLink = () => {
    if (!currentUser.isLoggedIn || !hasFeature(Feature.Architecture)) {
      return null;
    }
    return renderMenuLink({
      label: intl.formatMessage({ id: 'layout.architecture' }),
      pathname: '/architecture',
    });
  };

  const renderSecurityReports = () => {
    if (isPullRequest(branchLike)) {
      return null;
    }

    const hasSecurityReportsEnabled = extensions.some((extension) =>
      extension.key.startsWith('securityreport/'),
    );

    if (!hasSecurityReportsEnabled) {
      return null;
    }

    return renderMenuLink({
      label: intl.formatMessage({ id: 'layout.security_reports' }),
      pathname: '/project/extension/securityreport/securityreport',
    });
  };

  const renderAdministration = () => {
    const query = getQuery();

    if (!configuration.showSettings || isPullRequest(branchLike)) {
      return null;
    }

    const isSettingsActive = SETTINGS_URLS.some((url) => location.pathname.includes(url));

    const adminLinks = renderAdministrationLinks(
      query,
      isProject(qualifier),
      isApplication(qualifier),
      isPortfolioLike(qualifier),
    );

    if (!adminLinks.some((link) => link != null)) {
      return null;
    }

    return (
      <DropdownMenu data-test="administration" id="component-navigation-admin" items={adminLinks}>
        <NavBarTabLink
          active={isSettingsActive}
          preventDefault // not really a link, we just use the same style to be consistent
          text={
            hasMessage('layout.settings', component.qualifier)
              ? intl.formatMessage({ id: `layout.settings.${component.qualifier}` })
              : intl.formatMessage({ id: 'layout.settings' })
          }
          to={{}} // not really a link, we just use the same style to be consistent
          withChevron
        />
      </DropdownMenu>
    );
  };

  const renderAdministrationLinks = (
    query: Query,
    isProject: boolean,
    isApplication: boolean,
    isPortfolio: boolean,
  ) => {
    return [
      renderSettingsLink(query, isApplication, isPortfolio),
      renderBranchesLink(query, isProject),
      renderBaselineLink(query, isApplication, isPortfolio),
      ...renderAdminExtensions(isApplication),
      renderAiGeneratedCodeLink(query, isProject),
      renderImportExportLink(query, isProject),
      renderProfilesLink(query),
      renderLicenseProfilesLink(query, isPortfolio),
      renderQualityGateLink(query),
      renderLinksLink(query),
      renderPermissionsLink(query),
      renderBackgroundTasksLink(query),
      renderUpdateKeyLink(query),
      renderWebhooksLink(query, isProject),
      renderDeletionLink(query),
    ];
  };

  const renderProjectInformationButton = () => {
    const label = intl.formatMessage({
      id: `${isProject(qualifier) ? 'project' : 'application'}.info.title`,
    });
    const query = getQuery();

    if (isPullRequest(branchLike)) {
      return null;
    }

    if (isApplicationChildInaccessible) {
      return renderLinkWhenInaccessibleChild(label);
    }

    return (
      (isProject(qualifier) || isApplication(qualifier)) && (
        <NavBarTabLink
          text={label}
          to={{ pathname: '/project/information', search: new URLSearchParams(query).toString() }}
        />
      )
    );
  };

  const renderSettingsLink = (query: Query, isApplication: boolean, isPortfolio: boolean) => {
    if (!configuration.showSettings || isApplication || isPortfolio) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="settings"
        to={{ pathname: '/project/settings', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="project_settings.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderBranchesLink = (query: Query, isProject: boolean) => {
    if (
      !hasFeature(Feature.BranchSupport) ||
      !isProject ||
      !configuration.showSettings ||
      !addons.branches
    ) {
      return null;
    }

    return (
      <DropdownMenu.ItemLink
        key="branches"
        to={{ pathname: '/project/branches', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="project_branch_pull_request.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderBaselineLink = (query: Query, isApplication: boolean, isPortfolio: boolean) => {
    if (!configuration.showSettings || isApplication || isPortfolio) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="baseline"
        to={{ pathname: '/project/baseline', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="project_baseline.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderImportExportLink = (query: Query, isProject: boolean) => {
    if (!isProject) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="import-export"
        to={{
          pathname: '/project/import_export',
          search: new URLSearchParams(query).toString(),
        }}
      >
        <FormattedMessage id="project_dump.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderAiGeneratedCodeLink = (query: Query, isProject: boolean) => {
    if (!isProject || !hasFeature(Feature.AiCodeAssurance) || !addons.aica) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="ai-project-settings"
        to={{
          pathname: `/project/${addons.aica?.AICA_SETTINGS_PATH}`,
          search: new URLSearchParams(query).toString(),
        }}
      >
        <FormattedMessage id="ai_generated_code.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderProfilesLink = (query: Query) => {
    if (!configuration.showQualityProfiles) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink key="profiles" to={getProjectQualityProfileSettingsUrl(query.id)}>
        <FormattedMessage id="project_quality_profile.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderQualityGateLink = (query: Query) => {
    if (!configuration.showQualityGates) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="quality_gate"
        to={{ pathname: '/project/quality_gate', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="project_quality_gate.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderLinksLink = (query: Query) => {
    if (!configuration.showLinks) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="links"
        to={{ pathname: '/project/links', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="project_links.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderPermissionsLink = (query: Query) => {
    if (!configuration.showPermissions) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="permissions"
        to={{ pathname: '/project_roles', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="permissions.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderBackgroundTasksLink = (query: Query) => {
    if (!configuration.showBackgroundTasks) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="background_tasks"
        to={{
          pathname: '/project/background_tasks',
          search: new URLSearchParams(query).toString(),
        }}
      >
        <FormattedMessage id="background_tasks.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderUpdateKeyLink = (query: Query) => {
    if (!configuration.showUpdateKey) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="update_key"
        to={{ pathname: '/project/key', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="update_key.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderWebhooksLink = (query: Query, isProject: boolean) => {
    if (!configuration.showSettings || !isProject) {
      return null;
    }
    return (
      <DropdownMenu.ItemLink
        key="webhooks"
        to={{ pathname: '/project/webhooks', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="webhooks.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const renderDeletionLink = (query: Query) => {
    if (!configuration.showSettings) {
      return null;
    }

    if (
      ![
        ComponentQualifier.Project,
        ComponentQualifier.Portfolio,
        ComponentQualifier.Application,
      ].includes(qualifier as ComponentQualifier)
    ) {
      return null;
    }

    return (
      <DropdownMenu.ItemLink
        key="project_delete"
        to={{ pathname: '/project/deletion', search: new URLSearchParams(query).toString() }}
      >
        <FormattedMessage id="deletion.page" />
      </DropdownMenu.ItemLink>
    );
  };

  const getExtensionData = ({ key, name }: Extension, isAdmin: boolean) => {
    const pathname = isAdmin ? `/project/admin/extension/${key}` : `/project/extension/${key}`;
    const additionalQueryParams = { qualifier };

    return { key, label: name, pathname, additionalQueryParams };
  };

  const renderAdminExtensions = (isApplication: boolean) => {
    const extensions = component.configuration?.extensions ?? [];
    return extensions
      .filter((e) => !isApplication || e.key !== 'governance/console')
      .map((e) => {
        return renderDropdownMenuLink(getExtensionData(e, true));
      });
  };

  const getExtensions = () => {
    const withoutSecurityExtension = extensions.filter(
      (extension) =>
        !extension.key.startsWith('securityreport/') && !extension.key.startsWith('governance/'),
    );

    if (withoutSecurityExtension.length === 0) {
      return null;
    }

    return withoutSecurityExtension.map((e) => getExtensionData(e, false));
  };

  /*
   * The inventory links are 'Code' & 'Dependencies'.
   * They appear individually or together in a dropdown
   */
  const renderInventoryLinks = () => {
    const shouldRenderCodeLink = !isPortfolioLike(qualifier);
    const shouldRenderReleasesLink = hasFeature(Feature.Sca) && addons.sca;

    const codeLinkData = getCodeLinkData();
    const releasesesUrl = addons.sca?.getReleasesUrl({ newParams: getQuery() });
    const releasesLinkData = {
      pathname: releasesesUrl?.pathname ?? '',
      additionalQueryParams: Object.fromEntries(new URLSearchParams(releasesesUrl?.search)),
      label: intl.formatMessage({ id: 'dependencies.bill_of_materials' }),
    };

    /*
     * If we need to display both links, put them in a dropdown
     */
    if (shouldRenderCodeLink && shouldRenderReleasesLink) {
      const isActive = [codeLinkData.pathname, releasesLinkData.pathname].some((url) =>
        location.pathname.includes(url),
      );

      const label = intl.formatMessage({ id: 'inventory' });

      if (isApplicationChildInaccessible) {
        return renderLinkWhenInaccessibleChild(label);
      }

      return hasAnalysis() ? (
        <DropdownMenu
          items={
            <>
              {renderDropdownMenuLink(codeLinkData)}
              {renderDropdownMenuLink(releasesLinkData)}
            </>
          }
        >
          <NavBarTabLink active={isActive} preventDefault text={label} to={{}} withChevron />
        </DropdownMenu>
      ) : (
        <DisabledTabLink
          label={label}
          overlay={intl.formatMessage({ id: 'layout.must_be_configured' })}
        />
      );
    }

    /*
     * Otherwise, render either one directly, as needed
     */

    if (shouldRenderCodeLink) {
      return renderMenuLink(codeLinkData);
    }

    if (shouldRenderReleasesLink) {
      return renderMenuLink(releasesLinkData);
    }

    return null;
  };

  /*
   * These are links that may be grouped in the "More" dropdown menu.
   * We limit the number of items to 8, so if we reach that limit,
   * "Measures" & "Activity" collapse into the "More" dropdown.
   */
  const renderAdditionalItems = (linkCount: number) => {
    const shouldRenderActivityLink = !isPullRequest(branchLike);

    const extensions = getExtensions();

    // +1 for Measures, which is always included
    linkCount += 1;

    if (shouldRenderActivityLink) {
      linkCount += 1;
    }

    // extensions are always in the dropdown menu, so they count for 1 if any are present
    if (extensions != null) {
      linkCount += 1;
    }
    const hasMoreLinksThanAllowed = linkCount > MAXIMUM_DISPLAYED_LINK_COUNT;

    const componentMeasuresLinkData = getComponentMeasuresLinkData();
    const activityLinkData = getActivityLinkData();

    return (
      <>
        {/* if we can, render Measures and Activity directly, rather than in the dropdown */}
        {/* Otherwise, the MenuMoreDropdown component renders them */}
        {!hasMoreLinksThanAllowed && (
          <>
            {renderMenuLink(componentMeasuresLinkData)}
            {shouldRenderActivityLink && renderMenuLink(activityLinkData)}
          </>
        )}

        <MenuMoreDropdown
          activityLinkData={activityLinkData}
          componentMeasuresLinkData={componentMeasuresLinkData}
          extensions={extensions}
          hasMoreLinksThanAllowed={hasMoreLinksThanAllowed}
          isApplicationChildInaccessble={isApplicationChildInaccessible}
          renderDropdownMenuLink={renderDropdownMenuLink}
          renderLinkWhenInaccessibleChild={renderLinkWhenInaccessibleChild}
          shouldRenderActivityLink={shouldRenderActivityLink}
        />
      </>
    );
  };

  const linksToRender = (
    <>
      {renderDashboardLink()}
      {renderBreakdownLink()}
      {renderIssuesLink()}
      {renderSecurityHotspotsLink()}
      {renderReleaseRisksLink()}
      {!isLoadingArchitectureOptIn &&
        architectureOptIn?.value === 'true' &&
        renderArchitectureLink()}
      {renderInventoryLinks()}
      {renderSecurityReports()}
    </>
  );

  const renderedLinkCount = React.Children.toArray(linksToRender.props.children).length;

  return (
    <div className="sw-flex sw-justify-between sw-pt-4 it__navbar-tabs">
      <NavBarTabs className="sw-gap-4">
        {linksToRender}
        {renderAdditionalItems(renderedLinkCount)}
      </NavBarTabs>
      <NavBarTabs className="sw-gap-4">
        {renderAdministration()}
        {renderProjectInformationButton()}
      </NavBarTabs>
    </div>
  );
}

export default withAvailableFeatures(Menu);
