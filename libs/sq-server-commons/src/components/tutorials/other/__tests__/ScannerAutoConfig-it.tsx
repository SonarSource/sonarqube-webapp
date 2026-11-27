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

import userEvent from '@testing-library/user-event';
import { SCANNER_AUTOCONFIG_ENABLED } from '~shared/components/onboarding/scannerAutoConfig';
import { byRole, byText } from '~shared/helpers/testSelector';
import { getValue } from '../../../../api/settings';
import SettingsServiceMock from '../../../../api/mocks/SettingsServiceMock';
import UserTokensMock from '../../../../api/mocks/UserTokensMock';
import { mockComponent } from '../../../../helpers/mocks/component';
import { mockLoggedInUser } from '../../../../helpers/testMocks';
import { renderApp } from '../../../../helpers/testReactTestingUtils';
import { Component } from '../../../../types/types';
import { getTutorialActionButtons, getTutorialBuildButtons } from '../../test-utils';
import { BuildTools, OSs } from '../../types';
import OtherTutorial from '../OtherTutorial';

jest.mock('../../../../api/settings');

const settingsMock = new SettingsServiceMock();
const tokenMock = new UserTokensMock();

afterEach(() => {
  settingsMock.reset();
  tokenMock.reset();
});

const ui = {
  adminRequired: byText('onboarding.scanner_autoconfig.admin_required'),
  androidInfo: byText('onboarding.scanner_autoconfig.android_info'),
  betaBadge: byText('beta'),
  buildTool: (buildTool: BuildTools) => byRole('radio', { name: `onboarding.build.${buildTool}` }),
  gradleCommand: byText('./gradlew sonar'),
  mavenCommand: byText('mvn clean verify', { exact: false }),
  sonarSources: byText('-Dsonar.sources=.', { exact: false }),
  scannerCommand: byText('-Dsonar.projectKey=my-project', { exact: false }),
  scannerDownloadHeader: (os: OSs) => byText(`onboarding.analysis.sq_scanner.header.${os}`),
  toggle: byRole('switch', { name: 'onboarding.scanner_autoconfig.toggle' }),
  ...getTutorialActionButtons(),
  ...getTutorialBuildButtons(),
};

it.each([BuildTools.JsTs, BuildTools.Python, BuildTools.Maven, BuildTools.Gradle])(
  'offers the automatic configuration opt-in with a beta badge for %s',
  async (buildTool) => {
    const user = userEvent.setup();
    await setup(user, buildTool);

    expect(ui.toggle.get()).toBeVisible();
    expect(ui.toggle.get()).not.toBeChecked();
    expect(ui.betaBadge.get()).toBeVisible();
  },
);

it.each([BuildTools.DotNet, BuildTools.Other])(
  'does not offer the automatic configuration opt-in for %s',
  async (buildTool) => {
    const user = userEvent.setup();
    await setup(user, buildTool);

    expect(ui.toggle.query()).not.toBeInTheDocument();
  },
);

it('only warns Gradle users about Android projects', async () => {
  const user = userEvent.setup();
  await setup(user, BuildTools.Maven);
  expect(ui.androidInfo.query()).not.toBeInTheDocument();

  await user.click(ui.gradleBuildButton.get());
  expect(ui.androidInfo.get()).toBeVisible();
});

it('lets admins opt in and shows the automatic configuration tutorial', async () => {
  const user = userEvent.setup();
  await setup(user, BuildTools.Maven);
  expect(ui.scannerDownloadHeader(OSs.Linux).query()).not.toBeInTheDocument();

  await user.click(ui.toggle.get());

  expect(await ui.toggle.find()).toBeChecked();
  expect(await ui.scannerDownloadHeader(OSs.Linux).find()).toBeVisible();
  expect(ui.scannerCommand.get()).toBeVisible();
  expect(ui.sonarSources.query()).not.toBeInTheDocument();
  expect(byText('-Dsonar.host.url=http://localhost:9000', { exact: false }).get()).toBeVisible();
});

it('reads the stored opt-in back and lets the user pick the platform of the scanner', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');
  await setup(user, BuildTools.JsTs);

  expect(await ui.toggle.find()).toBeChecked();
  expect(ui.scannerDownloadHeader(OSs.Linux).get()).toBeVisible();

  expect(ui.toggle.get().compareDocumentPosition(ui.windowsButton.get())).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );

  await user.click(ui.windowsButton.get());

  expect(ui.scannerDownloadHeader(OSs.Windows).get()).toBeVisible();
  expect(byText('sonar-scanner.bat', { exact: false }).get()).toBeVisible();
});

it('shows the build-specific command again when the stored opt-in is turned off', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');
  await setup(user, BuildTools.Maven);

  expect(await ui.scannerDownloadHeader(OSs.Linux).find()).toBeVisible();
  expect(ui.mavenCommand.query()).not.toBeInTheDocument();

  await user.click(await ui.toggle.find());

  expect(await ui.mavenCommand.find()).toBeVisible();
  expect(ui.toggle.get()).not.toBeChecked();
  expect(ui.scannerDownloadHeader(OSs.Linux).query()).not.toBeInTheDocument();
  expect(ui.windowsButton.query()).not.toBeInTheDocument();
});

it('switches between the build-specific command and the scanner steps as the opt-in is toggled', async () => {
  const user = userEvent.setup();
  await setup(user, BuildTools.Maven);

  expect(await ui.mavenCommand.find()).toBeVisible();
  expect(ui.toggle.get()).not.toBeChecked();

  await user.click(ui.toggle.get());

  expect(await ui.scannerDownloadHeader(OSs.Linux).find()).toBeVisible();
  expect(ui.toggle.get()).toBeChecked();
  expect(ui.mavenCommand.query()).not.toBeInTheDocument();

  await user.click(ui.toggle.get());

  expect(await ui.mavenCommand.find()).toBeVisible();
  expect(ui.toggle.get()).not.toBeChecked();
  expect(ui.scannerDownloadHeader(OSs.Linux).query()).not.toBeInTheDocument();
});

it('keeps the banner above the platform selectors when the opt-in is toggled', async () => {
  const user = userEvent.setup();
  await setup(user, BuildTools.Python);

  expect(await ui.windowsButton.find()).toBeVisible();
  expect(ui.toggle.get().compareDocumentPosition(ui.windowsButton.get())).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );

  await user.click(ui.toggle.get());
  expect(await ui.toggle.find()).toBeChecked();

  expect(ui.toggle.get().compareDocumentPosition(ui.windowsButton.get())).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
});

it('leaves -Dsonar.sources out of the scanner command only while the opt-in is on', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');
  await setup(user, BuildTools.Maven);

  expect(await ui.scannerCommand.find()).toBeVisible();
  expect(ui.sonarSources.query()).not.toBeInTheDocument();

  await user.click(ui.toggle.get());
  expect(await ui.mavenCommand.find()).toBeVisible();

  await user.click(ui.buildTool(BuildTools.Other).get());

  expect(await ui.sonarSources.find()).toBeVisible();
  expect(ui.toggle.query()).not.toBeInTheDocument();
});

it('replaces the Gradle command with the scanner steps when the opt-in is on', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');
  await setup(user, BuildTools.Gradle);

  expect(await ui.scannerDownloadHeader(OSs.Linux).find()).toBeVisible();
  expect(ui.toggle.get()).toBeChecked();
  expect(ui.androidInfo.get()).toBeVisible();
  expect(ui.gradleCommand.query()).not.toBeInTheDocument();
});

it('disables the opt-in and holds back the command until the stored value is known', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');

  const getValueImplementation = jest.mocked(getValue).getMockImplementation();
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  jest.mocked(getValue).mockImplementation(async (...args) => {
    await gate;
    return getValueImplementation?.(...args);
  });

  try {
    await setup(user, BuildTools.Maven);

    expect(ui.toggle.get()).toBeDisabled();
    expect(ui.mavenCommand.query()).not.toBeInTheDocument();
    expect(ui.scannerDownloadHeader(OSs.Linux).query()).not.toBeInTheDocument();

    release?.();

    expect(await ui.scannerDownloadHeader(OSs.Linux).find()).toBeVisible();
    expect(ui.toggle.get()).toBeEnabled();
    expect(ui.mavenCommand.query()).not.toBeInTheDocument();
  } finally {
    release?.();
    jest.mocked(getValue).mockImplementation(getValueImplementation!);
  }
});

it('lets users who analyze on their own computer download the scanner', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');
  await setup(user, BuildTools.Python, undefined, true);

  expect(await ui.scannerDownloadHeader(OSs.Linux).find()).toBeVisible();
  expect(byText('-Dsonar.token=', { exact: false }).get()).toBeVisible();
});

it('ignores a stored opt-in for build tools that do not support it', async () => {
  const user = userEvent.setup();
  settingsMock.set(SCANNER_AUTOCONFIG_ENABLED, 'true');
  await setup(user, BuildTools.DotNet);

  expect(ui.toggle.query()).not.toBeInTheDocument();
  expect(ui.scannerDownloadHeader(OSs.Linux).query()).not.toBeInTheDocument();
});

it('keeps the opt-in read-only for users who cannot administer the project', async () => {
  const user = userEvent.setup();
  await setup(user, BuildTools.Maven, mockComponent({ configuration: { showSettings: false } }));

  expect(ui.toggle.get()).toBeDisabled();
  expect(ui.adminRequired.get()).toBeVisible();
});

async function setup(
  user: ReturnType<typeof userEvent.setup>,
  buildTool: BuildTools,
  component = mockComponent({ configuration: { showSettings: true } }),
  isLocal = false,
) {
  renderOtherTutorial(component, isLocal);

  await user.click(await ui.generateTokenButton.find());
  await user.click(ui.continueButton.get());
  await user.click(ui.buildTool(buildTool).get());
}

function renderOtherTutorial(component: Component, isLocal: boolean) {
  return renderApp(
    '/',
    <OtherTutorial
      baseUrl="http://localhost:9000"
      component={component}
      currentUser={mockLoggedInUser()}
      isLocal={isLocal}
    />,
  );
}
