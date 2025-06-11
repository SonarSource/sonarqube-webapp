/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import AlmSettingsServiceMock from '../../../../api/mocks/AlmSettingsServiceMock';
import { LanguagesServiceMock } from '../../../../api/mocks/LanguagesServiceMock';
import UserTokensMock from '../../../../api/mocks/UserTokensMock';
import { mockAlmSettingsInstance } from '../../../../helpers/mocks/alm-settings';
import { mockComponent } from '../../../../helpers/mocks/component';
import { mockLoggedInUser } from '../../../../helpers/testMocks';
import { renderApp } from '../../../../helpers/testReactTestingUtils';
import { byRole } from '../../../../sonar-aligned/helpers/testSelector';
import { AlmKeys } from '../../../../types/alm-settings';
import { Feature } from '../../../../types/features';
import {
  getCommonNodes,
  getCopyToClipboardHostURLValue,
  getCopyToClipboardValue,
  getTutorialActionButtons,
  getTutorialBuildButtons,
} from '../../test-utils';
import { GradleBuildDSL, TutorialModes } from '../../types';
import GitHubActionTutorial, { GitHubActionTutorialProps } from '../GitHubActionTutorial';

jest.mock('../../../../api/settings', () => ({
  getAllValues: jest.fn().mockResolvedValue([]),
}));

const tokenMock = new UserTokensMock();
const almMock = new AlmSettingsServiceMock();
const languagesService = new LanguagesServiceMock();

afterEach(() => {
  tokenMock.reset();
  almMock.reset();
  languagesService.reset();
});

const ui = {
  ...getCommonNodes(TutorialModes.GitHubActions),
  ...getTutorialActionButtons(),
  ...getTutorialBuildButtons(),
};

it('should follow and complete all steps', async () => {
  const user = userEvent.setup();
  renderGithubActionTutorial();

  expect(await ui.secretsStepTitle.find()).toBeInTheDocument();

  // Env variables step
  expect(
    getCopyToClipboardValue({
      i: 0,
      name: 'copy_to_clipboard',
      inlineSnippet: true,
    }),
  ).toMatchSnapshot('sonar token key');
  expect(
    getCopyToClipboardValue({
      i: 1,
      name: 'copy_to_clipboard',
      inlineSnippet: true,
    }),
  ).toMatchSnapshot('sonarqube host url key');
  expect(getCopyToClipboardHostURLValue({ i: 2, name: 'copy_to_clipboard' })).toMatchSnapshot(
    'sonarqube host url value',
  );

  // Create/update configuration file step
  // Maven
  await user.click(ui.mavenBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'Maven: .github/workflows/build.yml',
  );

  // Gradle
  await user.click(ui.gradleBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot('Groovy: build.gradle');
  await user.click(ui.gradleDSLButton(GradleBuildDSL.Kotlin).get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'Kotlin: build.gradle.kts',
  );
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Gradle: .github/workflows/build.yml',
  );

  // .NET
  await user.click(ui.dotnetBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    '.NET: .github/workflows/build.yml',
  );

  // Cpp
  await user.click(ui.cppBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'C++ (automatic) and other: sonar-project.properties',
  );
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ (automatic) and other: .github/workflows/build.yml',
  );

  await user.click(ui.autoConfigManual.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'C++: sonar-project.properties',
  );
  await user.click(ui.linuxButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ Linux: .github/workflows/build.yml',
  );
  await user.click(ui.arm64Button.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ Linux arm64: .github/workflows/build.yml',
  );
  await user.click(ui.windowsButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ Windows: .github/workflows/build.yml',
  );
  await user.click(ui.macosButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ MacOS: .github/workflows/build.yml',
  );

  // Objective-C
  await user.click(ui.objCBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'Objective-C: sonar-project.properties',
  );

  await user.click(ui.linuxButton.get());
  await user.click(ui.x86_64Button.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Objective-C Linux: .github/workflows/build.yml',
  );
  await user.click(ui.arm64Button.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Objective-C Linux arm64: .github/workflows/build.yml',
  );
  await user.click(ui.windowsButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Objective-C Windows: .github/workflows/build.yml',
  );
  await user.click(ui.macosButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Objective-C MacOS: .github/workflows/build.yml',
  );

  // Dart
  await user.click(ui.dartBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'Dart: sonar-project.properties',
  );

  await user.click(ui.linuxButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Dart Linux: .github/workflows/build.yml',
  );
  await user.click(ui.windowsButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Dart Windows: .github/workflows/build.yml',
  );
  await user.click(ui.macosButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'Dart MacOS: .github/workflows/build.yml',
  );

  // Other
  await user.click(ui.otherBuildButton.get());
  expect(getCopyToClipboardValue({ i: 0, name: 'copy' })).toMatchSnapshot(
    'C++ (automatic) and other: sonar-project.properties',
  );

  await user.click(ui.linuxButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ (automatic) and other Linux: .github/workflows/build.yml',
  );
  await user.click(ui.windowsButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ (automatic) and other Windows: .github/workflows/build.yml',
  );
  await user.click(ui.macosButton.get());
  expect(getCopyToClipboardValue({ i: 1, name: 'copy' })).toMatchSnapshot(
    'C++ (automatic) and other MacOS: .github/workflows/build.yml',
  );

  expect(ui.allSetSentence.get()).toBeInTheDocument();
});

it('should generate/delete a new token or use existing one', async () => {
  const user = userEvent.setup();
  renderGithubActionTutorial();

  expect(await ui.secretsStepTitle.find()).toBeInTheDocument();

  // Generate token
  await user.click(ui.genTokenDialogButton.get());
  await user.click(ui.generateTokenButton.get());
  expect(getCopyToClipboardValue({ inlineSnippet: true })).toEqual('generatedtoken2');

  // Revoke current token and create new one
  await user.click(ui.deleteTokenButton.get());
  await user.type(ui.tokenNameInput.get(), 'newtoken');

  await user.click(ui.expiresInSelect.get());
  await user.click(byRole('option', { name: 'users.tokens.expiration.365' }).get());

  await user.click(ui.generateTokenButton.get());
  expect(ui.tokenValue.get()).toBeInTheDocument();
  await user.click(ui.continueButton.getAll()[0]);
  expect(ui.tokenValue.query()).not.toBeInTheDocument();
});

it('navigates between steps', async () => {
  const user = userEvent.setup();
  almMock.handleSetProjectBinding(AlmKeys.GitHub, {
    almSetting: 'my-project',
    project: 'my-project',
    repository: 'my-project',
    monorepo: true,
  });
  renderGithubActionTutorial({
    almBinding: mockAlmSettingsInstance({
      alm: AlmKeys.GitHub,
      url: 'http://localhost/qube',
    }),
  });

  // If project is bound, link to repo is visible
  expect(await ui.linkToRepo.find()).toBeInTheDocument();

  await user.click(ui.mavenBuildButton.get());
  expect(ui.allSetSentence.get()).toBeInTheDocument();

  await user.click(ui.ymlFileStepTitle.get());
  expect(ui.mavenBuildButton.get()).toBeInTheDocument();
  await user.click(ui.secretsStepTitle.get());
  expect(ui.genTokenDialogButton.get()).toBeInTheDocument();
});

function renderGithubActionTutorial(overrides: Partial<GitHubActionTutorialProps> = {}) {
  return renderApp(
    '/',
    <GitHubActionTutorial
      baseUrl="http://localhost:9000"
      component={mockComponent()}
      currentUser={mockLoggedInUser()}
      mainBranchName="main"
      {...overrides}
    />,
    { featureList: [Feature.BranchSupport] },
  );
}
