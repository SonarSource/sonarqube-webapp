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

import { screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { RecentHistory } from '~shared/helpers/recent-history';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import BranchesServiceMock from '~sq-server-commons/api/mocks/BranchesServiceMock';
import { MeasuresServiceMock } from '~sq-server-commons/api/mocks/MeasuresServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { Feature } from '~sq-server-commons/types/features';
import { ComponentNav } from '../ComponentNav';

jest.mock('~shared/helpers/recent-history', () => ({
  RecentHistory: {
    add: jest.fn(),
    get: jest.fn().mockReturnValue([
      { key: 'foo', name: 'Foo', qualifier: 'TRK' },
      { key: 'portfoolio', name: 'PortFoolio', qualifier: 'VW' },
    ]),
  },
}));

const branchesHandler = new BranchesServiceMock();
const measuresHandler = new MeasuresServiceMock();
const settingsHandler = new SettingsServiceMock();

beforeEach(() => {
  jest.clearAllMocks();
  branchesHandler.reset();
  measuresHandler.reset();
  settingsHandler.reset();
});

const ui = {
  // Header menu
  headerMenu: byRole('menu'),
  headerMenuItemsList: () =>
    byRole('menuitem')
      .getAll()
      .map((n) => n.textContent),

  // Navigation items
  onboardingLink: byRole('link', { name: 'onboarding.project_analysis.menu_entry' }),
  overviewLink: byRole('link', { name: 'overview.page' }),
  issuesLink: byRole('link', { name: 'issues.page' }),
  securityHotspotsLink: byRole('link', { name: 'layout.security_hotspots' }),
  securityReportsLink: byRole('link', { name: 'layout.security_reports' }),
  measuresLink: byRole('link', { name: 'layout.measures' }),
  appCodeLink: byRole('link', { name: 'view_projects.page' }),
  codeLink: byRole('link', { name: 'code.page' }),
  activityLink: byRole('link', { name: 'project_activity.page' }),
  projectInfoLink: byRole('link', { name: 'project.info.title' }),
  applicationInfoLink: byRole('link', { name: 'application.info.title' }),
  qualityProfilesLink: byRole('link', { name: 'project_quality_profiles.page' }),
  qualityGateLink: byRole('link', { name: 'project_quality_gate.page' }),
  navigationItemsList: () =>
    byRole('link')
      .getAll()
      .map((n) => n.textContent.slice(1)),

  // Group labels
  analysisGroup: byText('navigation.project.group.analysis'),
  informationGroup: byText('navigation.project.group.information'),
  policiesGroup: byText('navigation.project.group.policies'),
};

describe('ComponentNav', () => {
  describe('project navigation', () => {
    it('should render onboarding link when project is not analyzed', () => {
      const component = mockComponent({
        analysisDate: undefined,
      });

      renderComponentNav({ component });

      expect(ui.navigationItemsList()).toEqual([
        'onboarding.project_analysis.menu_entry',
        'project.info.title',
      ]);
      expect(ui.onboardingLink.get()).toBeInTheDocument();
      expect(ui.overviewLink.query()).not.toBeInTheDocument();
    });

    it('should render analysis menu when project is analyzed', () => {
      const component = mockComponent({
        analysisDate: '2024-01-01',
        configuration: {
          showQualityProfiles: true,
          showQualityGates: true,
        },
      });

      renderComponentNav({ component });

      expect(ui.navigationItemsList()).toEqual([
        'overview.page',
        'issues.page',
        'layout.security_hotspots',
        'layout.measures',
        'code.page',
        'project_activity.page',
        'project_quality_profiles.page',
        'project_quality_gate.page',
        'project.info.title',
      ]);
      expect(ui.onboardingLink.query()).not.toBeInTheDocument();
      expect(ui.overviewLink.get()).toBeInTheDocument();
      expect(ui.issuesLink.get()).toBeInTheDocument();
      expect(ui.securityHotspotsLink.get()).toBeInTheDocument();
      expect(ui.measuresLink.get()).toBeInTheDocument();
      expect(ui.codeLink.get()).toBeInTheDocument();
      expect(ui.activityLink.get()).toBeInTheDocument();
      expect(ui.policiesGroup.get()).toBeInTheDocument();
      expect(ui.qualityProfilesLink.get()).toBeInTheDocument();
      expect(ui.qualityGateLink.get()).toBeInTheDocument();
      expect(ui.informationGroup.get()).toBeInTheDocument();
      expect(ui.projectInfoLink.get()).toBeInTheDocument();
    });

    it('should not render policies menu when configuration is disabled', () => {
      const component = mockComponent({
        analysisDate: '2024-01-01',
        configuration: {
          showQualityProfiles: false,
          showQualityGates: false,
        },
      });

      renderComponentNav({ component });

      expect(ui.navigationItemsList()).toEqual([
        'overview.page',
        'issues.page',
        'layout.security_hotspots',
        'layout.measures',
        'code.page',
        'project_activity.page',
        'project.info.title',
      ]);
      expect(ui.policiesGroup.query()).not.toBeInTheDocument();
    });

    it('should render administaration menu for admins', () => {
      const component = mockComponent({
        analysisDate: '2024-01-01',
        configuration: {
          showSettings: true,
          showLinks: true,
          showPermissions: true,
          showBackgroundTasks: true,
          showUpdateKey: true,
          extensions: [{ key: 'governance/console', name: 'Governance Console' }],
        },
      });

      renderComponentNav({ component });

      expect(ui.navigationItemsList()).toEqual([
        'overview.page',
        'issues.page',
        'layout.security_hotspots',
        'layout.measures',
        'code.page',
        'project_activity.page',
        'project.info.title',
        'project_settings.page',
        'project_baseline.page',
        'Governance Console',
        'project_dump.page',
        'project_links.page',
        'permissions.page',
        'background_tasks.page',
        'update_key.page',
        'webhooks.page',
        'deletion.page',
      ]);
    });
  });

  describe('application navigation', () => {
    it('should render analysis and information menus for applications', () => {
      const component = mockComponent({
        qualifier: ComponentQualifier.Application,
        breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier: ComponentQualifier.Application }],
        analysisDate: '2024-01-01',
        canBrowseAllChildProjects: true,
      });

      renderComponentNav({ component });

      expect(ui.navigationItemsList()).toEqual([
        'overview.page',
        'issues.page',
        'layout.security_hotspots',
        'layout.measures',
        'view_projects.page',
        'project_activity.page',
        'application.info.title',
      ]);

      // Analysis menu
      expect(ui.overviewLink.get()).toBeInTheDocument();
      expect(ui.issuesLink.get()).toBeInTheDocument();
      expect(ui.securityHotspotsLink.get()).toBeInTheDocument();
      expect(ui.appCodeLink.get()).toBeInTheDocument();

      // Information menu
      expect(ui.informationGroup.get()).toBeInTheDocument();
      expect(ui.applicationInfoLink.get()).toBeInTheDocument();
    });

    it('should hide some menu items when application child projects are inaccessible', () => {
      const component = mockComponent({
        qualifier: ComponentQualifier.Application,
        breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier: ComponentQualifier.Application }],
        analysisDate: '2024-01-01',
        canBrowseAllChildProjects: false,
      });

      renderComponentNav({ component });

      expect(ui.overviewLink.get()).toBeInTheDocument();
      expect(ui.informationGroup.query()).not.toBeInTheDocument();
      expect(ui.policiesGroup.query()).not.toBeInTheDocument();

      expect(ui.navigationItemsList()).toEqual(['overview.page']);
    });
  });

  describe('portfolio and security reports navigation', () => {
    it('should render limited menu items for portfolios', () => {
      const component = mockComponent({
        qualifier: ComponentQualifier.Portfolio,
        breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier: ComponentQualifier.Portfolio }],
        analysisDate: '2024-01-01',
        extensions: [
          { key: 'governance/portfolio', name: 'Governance Portfolio' },
          { key: 'securityreport/', name: 'Security Reports' },
        ],
      });

      renderComponentNav({ component });

      expect(ui.navigationItemsList()).toEqual([
        'overview.page',
        'portfolio_breakdown.page',
        'issues.page',
        'layout.security_reports',
        'layout.measures',
        'project_activity.page',
      ]);
      expect(ui.overviewLink.get()).toBeInTheDocument();
      expect(ui.issuesLink.get()).toBeInTheDocument();
      expect(ui.measuresLink.get()).toBeInTheDocument();
      expect(ui.activityLink.get()).toBeInTheDocument();
      expect(ui.securityReportsLink.get()).toBeInTheDocument();

      // Portfolios don't show security hotspots or code
      expect(ui.securityHotspotsLink.query()).not.toBeInTheDocument();
      expect(ui.codeLink.query()).not.toBeInTheDocument();
      expect(ui.appCodeLink.query()).not.toBeInTheDocument();

      // Portfolios don't show information menu
      expect(ui.informationGroup.query()).not.toBeInTheDocument();
    });
  });

  describe('extensions menu', () => {
    it('should render extensions items', () => {
      const projectComponent = mockComponent({
        analysisDate: '2024-01-01',
        extensions: [{ key: 'custom-extension', name: 'Custom Extension' }],
      });

      renderComponentNav({ component: projectComponent });

      expect(ui.navigationItemsList()).toEqual([
        'overview.page',
        'issues.page',
        'layout.security_hotspots',
        'layout.measures',
        'code.page',
        'project_activity.page',
        'Custom Extension',
        'project.info.title',
      ]);
      expect(screen.getByText('Custom Extension')).toBeInTheDocument();
    });
  });

  describe('SCA features', () => {
    it('should render risks link only when SCA feature is enabled', () => {
      const component = mockComponent({
        analysisDate: '2024-01-01',
      });

      renderComponentNav({ component }, [Feature.Sca]);
      expect(byRole('link', { name: 'dependencies.risks' }).get()).toBeInTheDocument();
    });

    it('should not render risks link when SCA feature is disabled', () => {
      const component = mockComponent({
        analysisDate: '2024-01-01',
      });

      renderComponentNav({ component }, []);
      expect(byRole('link', { name: 'dependencies.risks' }).query()).not.toBeInTheDocument();
    });
  });

  describe('recent history', () => {
    it('should add projects to recent history but not files', () => {
      const projectComponent = mockComponent({
        breadcrumbs: [
          { key: 'my-project', name: 'MyProject', qualifier: ComponentQualifier.Project },
        ],
        analysisDate: '2024-01-01',
      });

      renderComponentNav({ component: projectComponent });
      expect(RecentHistory.add).toHaveBeenCalledWith({
        key: projectComponent.key,
        name: projectComponent.name,
        qualifier: projectComponent.qualifier,
      });
    });

    it('should display the recently browsed projects when clicking on the sidebar header', async () => {
      const projectComponent = mockComponent({
        breadcrumbs: [
          { key: 'my-project', name: 'MyProject', qualifier: ComponentQualifier.Project },
        ],
        analysisDate: '2024-01-01',
      });

      const { user } = renderComponentNav({ component: projectComponent });

      await user.click(byRole('button', { name: /MyProject/ }).get());

      expect(await ui.headerMenu.find()).toBeInTheDocument();
      expect(ui.headerMenuItemsList()).toEqual([
        expect.stringContaining('MyProject'),
        expect.stringContaining('Foo'),
        expect.stringContaining('PortFoolio'),
        'navigation.view_all',
      ]);
    });
  });
});

function renderComponentNav(props: ComponentProps<typeof ComponentNav>, features: Feature[] = []) {
  const { component, isInProgress = false, isPending = false } = props;

  measuresHandler.setComponents({ component, ancestors: [], children: [] });

  return renderWithRouter(
    <ComponentNav component={component} isInProgress={isInProgress} isPending={isPending} />,
    { availableFeatures: features },
  );
}
