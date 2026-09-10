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
import userEvent from '@testing-library/user-event';
import { first } from 'lodash';
import { byRole, byText } from '~shared/helpers/testSelector';
import SystemServiceMock from '~sq-server-commons/api/mocks/SystemServiceMock';
import { getSystemInfo } from '~sq-server-commons/api/system';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderAppRoutes } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AppState } from '~sq-server-commons/types/appstate';
import { EditionKey } from '~sq-server-commons/types/editions';
import { LogsLevels } from '~sq-server-commons/types/system';
import routes from '../../routes';

const systemMock = new SystemServiceMock();

afterEach(() => {
  systemMock.reset();
});

describe('System Info Standalone', () => {
  it('renders correctly', async () => {
    const { user, ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    expect(byText('asd564-asd54a-5dsfg45').get()).toBeInTheDocument();

    expect(ui.sectionButton('System').get()).toBeInTheDocument();
    expect(ui.agenticHarnessTitle.query()).not.toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'High Availability' })).not.toBeInTheDocument();
    await user.click(ui.sectionButton('System').get());
    expect(screen.getByRole('cell', { name: 'High Availability' })).toBeInTheDocument();
  });

  it('renders agentic harness containers outside the System section', async () => {
    addAgenticHarnessInfo();
    const { user, ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    expect(
      ui.sectionButton('Search Engine').get().compareDocumentPosition(ui.agenticHarnessTitle.get()),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    const sectionNames = [
      'Agent Orchestrator',
      'Vortex Analysis',
      'Hunter Agent',
      'Remediation Agent',
      'MCP',
    ];
    const sectionButtons = sectionNames.map((name) => ui.sectionButton(name).get());
    expect(ui.agenticHarnessTitle.get().compareDocumentPosition(sectionButtons[0])).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    sectionButtons.slice(0, -1).forEach((button, index) => {
      expect(button.compareDocumentPosition(sectionButtons[index + 1])).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(ui.sectionButton('Agentic Analysis').query()).not.toBeInTheDocument();
    expect(
      ui.sectionButton('Agent Orchestrator').byText('system.current_health.red').get(),
    ).toBeInTheDocument();
    expect(
      ui.sectionButton('Agent Orchestrator').byText('Orchestrator unreachable').get(),
    ).toBeInTheDocument();

    await user.click(ui.sectionButton('Hunter Agent').get());
    expect(screen.getByRole('cell', { name: 'Hunter unavailable' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Healthy' })).toBeInTheDocument();
  });

  it('can change logs level', async () => {
    const { user, ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    await user.click(ui.changeLogLevelButton.get());
    expect(ui.logLevelWarning.queryAll()).toHaveLength(0);
    await user.click(ui.logLevelsRadioButton(LogsLevels.DEBUG).get());
    expect(ui.logLevelWarning.get()).toBeInTheDocument();

    await user.click(ui.saveButton.get());
    expect(ui.logLevelWarningShort.queryAll()).toHaveLength(2);
  });

  it('can download logs & system info', async () => {
    const { user, ui } = getPageObjects();
    renderSystemApp();
    expect(await ui.downloadLogsButton.find()).toBeInTheDocument();

    await user.click(ui.downloadLogsButton.get());
    [
      'system.logs.app',
      'system.logs.ce',
      'system.logs.es',
      'system.logs.web',
      'system.logs.access',
      'system.logs.deprecation',
    ].forEach((name) => {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    });
    expect(ui.downloadSystemInfoButton.get()).toBeInTheDocument();
  });

  it('should render current version and status', async () => {
    const { ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    expect(ui.versionLabel('7.8').get()).toBeInTheDocument();
    expect(await ui.ltaDocumentationLinkActive.find()).toBeInTheDocument();
  });

  it('should hide system info and page actions on error', async () => {
    jest.mocked(getSystemInfo).mockRejectedValueOnce(new Error('error'));
    const { ui } = getPageObjects();
    renderSystemApp();

    expect(await ui.pageHeading.find()).toBeInTheDocument();

    expect(screen.queryByText('asd564-asd54a-5dsfg45')).not.toBeInTheDocument();
    expect(ui.downloadLogsButton.query()).not.toBeInTheDocument();
  });
});

describe('System Info Cluster', () => {
  it('renders correctly', async () => {
    systemMock.setIsCluster(true);
    const { user, ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    expect(ui.downloadLogsButton.get()).toBeInTheDocument();
    expect(ui.downloadSystemInfoButton.get()).toBeInTheDocument();

    expect(byText('asd564-asd54a-5dsfg45').get()).toBeInTheDocument();

    // Renders health checks
    expect(ui.healthCauseWarning.get()).toBeInTheDocument();

    // Renders App node
    expect(first(ui.sectionButton('server1.example.com').getAll())).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Web Logging' })).not.toBeInTheDocument();
    await user.click(first(ui.sectionButton('server1.example.com').getAll()) as HTMLElement);
    expect(screen.getByRole('heading', { name: 'Web Logging' })).toBeInTheDocument();
  });

  it('renders agentic harness containers', async () => {
    systemMock.setIsCluster(true);
    addAgenticHarnessInfo();
    const { ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    expect(
      ui
        .sectionButton('server3.example.com')
        .get()
        .compareDocumentPosition(ui.agenticHarnessTitle.get()),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(ui.sectionButton('Vortex Analysis').get()).toBeInTheDocument();
    expect(ui.sectionButton('MCP').get()).toBeInTheDocument();
    expect(ui.sectionButton('Agentic Analysis').query()).not.toBeInTheDocument();
  });

  it('should render current version and status', async () => {
    systemMock.setIsCluster(true);
    const { ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    expect(ui.versionLabel('7.8').get()).toBeInTheDocument();
    expect(await ui.ltaDocumentationLinkActive.find()).toBeInTheDocument();
  });

  it('should not render search engine download button', async () => {
    systemMock.setIsCluster(true);
    const { user, ui } = getPageObjects();
    renderSystemApp();
    await ui.appIsLoaded();

    await user.click(ui.downloadLogsButton.get());
    expect(screen.queryByRole('menuitem', { name: 'Search Engine' })).not.toBeInTheDocument();
  });
});

function addAgenticHarnessInfo() {
  systemMock.systemInfo = {
    ...systemMock.systemInfo,
    'Agent Orchestrator': { Error: 'Orchestrator unreachable', Healthy: false },
    'Agentic Analysis': { Healthy: true },
    'Hunter Agent': { Error: 'Hunter unavailable', Healthy: false },
    'Remediation Agent': { Healthy: true },
    MCP: { Healthy: true },
  };
}

function renderSystemApp(appState?: AppState) {
  return renderAppRoutes('system', routes, {
    appState: mockAppState({ edition: EditionKey.developer, ...appState }),
  });
}

function getPageObjects() {
  const user = userEvent.setup();

  const ui = {
    pageHeading: byRole('heading', { name: 'system_info.page' }),
    agenticHarnessTitle: byText('system.agentic_harness_title'),
    downloadLogsButton: byRole('button', { name: 'system.download_logs' }),
    downloadSystemInfoButton: byRole('link', { name: 'system.download_system_info' }),
    copyIdInformation: byRole('button', { name: 'system.copy_id_info' }),
    sectionButton: (name: string) => byRole('button', { name }),
    changeLogLevelButton: byRole('button', { name: 'system.logs_level.change' }),
    logLevelsRadioButton: (name: LogsLevels) => byRole('radio', { name }),
    logLevelWarning: byText('system.log_level.warning'),
    logLevelWarningShort: byText('system.log_level.warning.short'),
    healthCauseWarning: byText('Friendly warning'),
    saveButton: byRole('button', { name: 'save' }),
    versionLabel: (version?: string) =>
      version ? byText(/footer\.version\.full\s*(\d.\d)/) : byText(/footer\.version\.full/),
    ltaDocumentationLinkActive: byRole('link', {
      name: `footer.version.status.active`,
    }),
  };

  async function appIsLoaded() {
    expect(await ui.pageHeading.find()).toBeInTheDocument();

    expect(await ui.downloadLogsButton.find()).toBeInTheDocument();
  }

  return {
    ui: { ...ui, appIsLoaded },
    user,
  };
}
