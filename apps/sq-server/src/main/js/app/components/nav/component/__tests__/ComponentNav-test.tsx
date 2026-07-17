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

import { fireEvent, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { useFlags } from '~adapters/helpers/feature-flags';
import { RecentHistory } from '~shared/helpers/recent-history';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import BranchesServiceMock from '~sq-server-commons/api/mocks/BranchesServiceMock';
import { MeasuresServiceMock } from '~sq-server-commons/api/mocks/MeasuresServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { AppState } from '~sq-server-commons/types/appstate';
import { EditionKey } from '~sq-server-commons/types/editions';
import { Feature } from '~sq-server-commons/types/features';
import { ComponentNav } from '../ComponentNav';

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: jest.fn(),
}));
const mockUseFlags = useFlags as unknown as jest.Mock;

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
  mockUseFlags.mockReturnValue({ organizationReportingEnablePortfolioDashboards: false });
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
  onboardingLink: byText('onboarding.project_analysis.menu_entry'),
  overviewLink: byText('overview.page'),
  portfolioHealthDashboardLink: byText('portfolio_dashboards.health.page'),
  allDashboardsLink: byText('portfolio_dashboards.all.page'),
  issuesLink: byText('issues.page'),
  securityHotspotsLink: byText('layout.security_hotspots'),
  securityReportsLink: byText('layout.security_reports'),
  measuresLink: byText('layout.measures'),
  appCodeLink: byText('view_projects.page'),
  codeLink: byText('code.page'),
  activityLink: byText('project_activity.page'),
  projectInfoLink: byText('project.info.title'),
  applicationInfoLink: byText('application.info.title'),
  qualityProfilesLink: byText('project_quality_profiles.page'),
  qualityGateLink: byText('project_quality_gate.page'),
  navigationItemsList: () =>
    byRole('link', { hidden: true })
      .getAll()
      .map((n) => n.textContent.slice(1)),

  // Group labels
  analysisGroup: byText('navigation.project.group.analysis'),
  projectGroup: byText('navigation.project.group.project'),
  reportingGroup: byText('navigation.project.group.reporting'),
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
        'layout.security_hotspotsdeprecated',
        'layout.measures',
        'project_activity.page',
        'project_quality_profiles.page',
        'project_quality_gate.page',
        'code.page',
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
      expect(ui.projectGroup.get()).toBeInTheDocument();
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
        'layout.security_hotspotsdeprecated',
        'layout.measures',
        'project_activity.page',
        'code.page',
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
        'layout.security_hotspotsdeprecated',
        'layout.measures',
        'project_activity.page',
        'code.page',
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
        'layout.security_hotspotsdeprecated',
        'layout.measures',
        'project_activity.page',
        'view_projects.page',
        'application.info.title',
      ]);

      // Analysis menu
      expect(ui.overviewLink.get()).toBeInTheDocument();
      expect(ui.issuesLink.get()).toBeInTheDocument();
      expect(ui.securityHotspotsLink.get()).toBeInTheDocument();
      expect(ui.appCodeLink.get()).toBeInTheDocument();

      // Project menu
      expect(ui.projectGroup.get()).toBeInTheDocument();
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
      expect(ui.projectGroup.query()).not.toBeInTheDocument();
      expect(ui.policiesGroup.query()).not.toBeInTheDocument();

      expect(ui.navigationItemsList()).toEqual(['overview.page']);
    });
  });

  describe('portfolio and security reports navigation', () => {
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
        'layout.security_hotspotsdeprecated',
        'Custom Extension',
        'layout.measures',
        'project_activity.page',
        'code.page',
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
      expect(byText('dependencies.risks').get()).toBeInTheDocument();
    });

    it('should not render risks link when SCA feature is disabled', () => {
      const component = mockComponent({
        analysisDate: '2024-01-01',
      });

      renderComponentNav({ component }, []);
      expect(byText('dependencies.risks').query()).not.toBeInTheDocument();
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

      renderComponentNav({ component: projectComponent });

      fireEvent.keyDown(getInteractiveElement(byText('MyProject').get()), { key: 'ArrowDown' });

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

function renderComponentNav(
  props: ComponentProps<typeof ComponentNav>,
  features: Feature[] = [],
  edition = EditionKey.community,
) {
  const { component, isInProgress = false, isPending = false } = props;

  measuresHandler.setComponents({ component, ancestors: [], children: [] });

  return renderWithRouter(
    <ComponentNav component={component} isInProgress={isInProgress} isPending={isPending} />,
    {
      availableFeatures: features,
      appState: {
        edition,
        qualifiers: edition === EditionKey.enterprise ? [ComponentQualifier.Portfolio] : [],
      } as AppState,
    },
  );
}

/* eslint-disable testing-library/no-node-access -- The standalone sidebar is aria-hidden. */
function getInteractiveElement(element: HTMLElement) {
  // The standalone sidebar is aria-hidden, so role queries cannot reach its interactive parent.
  const interactiveElement = element.closest('a, button');

  if (interactiveElement === null) {
    throw new Error('Expected navigation label to have an interactive parent');
  }

  return interactiveElement;
}
/* eslint-enable testing-library/no-node-access */
