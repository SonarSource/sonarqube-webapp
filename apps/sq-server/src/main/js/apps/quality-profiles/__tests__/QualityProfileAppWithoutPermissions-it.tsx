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
import { byText } from '~shared/helpers/testSelector';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import QualityProfilesServiceMock from '~sq-server-commons/api/mocks/QualityProfilesServiceMock';
import { renderAppRoutes } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { Mode } from '~sq-server-commons/types/mode';
import routes from '../routes';
import { qualityProfilePageObjects as ui } from './utils';

// Flaky tests without jest-cache
jest.retryTimes(2);

jest.mock('~sq-server-commons/api/quality-profiles');
jest.mock('~sq-server-commons/api/rules');

let serviceMock: QualityProfilesServiceMock;
let modeHandler: ModeServiceMock;

beforeEach(() => {
  serviceMock = new QualityProfilesServiceMock();
  modeHandler = new ModeServiceMock();
  jest.clearAllMocks();
});

describe('Users with no permission', () => {
  it('should not be able to activate more rules', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.rulesSection.find()).toBeInTheDocument();
    expect(ui.activateMoreLink.query()).not.toBeInTheDocument();
  });

  it('should not be able to grant permission to a user', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(ui.permissionSection.query()).not.toBeInTheDocument();
  });

  it("should not be able to change a quality profile's parents", async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.inheritanceSection.find()).toBeInTheDocument();
    expect(ui.inheritanceSection.byText('PHP Sonar way 1').get()).toBeInTheDocument();
    expect(ui.inheritanceSection.byText('PHP way').get()).toBeInTheDocument();

    expect(ui.changeParentButton.query()).not.toBeInTheDocument();
  });

  it('should not be able to change projects for Quality Profile', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.projectSection.find()).toBeInTheDocument();
    expect(ui.changeProjectsButton.query()).not.toBeInTheDocument();
  });
});

describe('Every Users', () => {
  it('should not see aica description', async () => {
    renderQualityProfile('sonar');
    await ui.waitForDataLoaded();

    expect(await byText('quality_profiles.built_in.description').find()).toBeInTheDocument();
    expect(byText('quality_profiles.built_in.aica_description').query()).not.toBeInTheDocument();
  });


  it('should be able to see active/inactive rules for a Quality Profile', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.rulesSectionHeader.find()).toBeInTheDocument();

    ui.checkRuleRow('rule.clean_code_attribute_category.INTENTIONAL', 23, 4);
    ui.checkRuleRow('rule.clean_code_attribute_category.CONSISTENT', 2, 18);
    ui.checkRuleRow('rule.clean_code_attribute_category.ADAPTABLE', 1, 11);
    ui.checkRuleRow('rule.clean_code_attribute_category.RESPONSIBLE', 0, 0);
    ui.checkRuleRow('software_quality.MAINTAINABILITY', 9, 44);
    ui.checkRuleRow('software_quality.RELIABILITY', 16, 1);
    ui.checkRuleRow('software_quality.SECURITY', 0, 14);
  });

  it('should be able to see active/inactive rules for a Quality Profile in Legacy mode', async () => {
    serviceMock.resetSearchRulesResponse();
    modeHandler.setMode(Mode.Standard);
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.rulesSectionHeader.find()).toBeInTheDocument();

    ui.checkRuleRow('issue.type.BUG.plural', 60, 0);
    ui.checkRuleRow('issue.type.VULNERABILITY.plural', 40, 0);
    ui.checkRuleRow('issue.type.CODE_SMELL.plural', 250, 0);
    ui.checkRuleRow('issue.type.SECURITY_HOTSPOT.plural', 50, 0);
  });

  it('should be able to see a warning when some rules are missing compare to Sonar way', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.rulesMissingSonarWayWarning.findAll()).toHaveLength(2);
    expect(ui.rulesMissingSonarWayLink.get()).toBeInTheDocument();
    expect(ui.rulesMissingSonarWayLink.get()).toHaveAttribute(
      'href',
      '/coding_rules?qprofile=old-php-qp&activation=false&languages=php',
    );
  });

  it('should be able to see a warning when some rules are deprecated', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.rulesDeprecatedWarning.findAll()).toHaveLength(1);
    expect(ui.rulesDeprecatedLink.get()).toBeInTheDocument();
    expect(ui.rulesDeprecatedLink.get()).toHaveAttribute(
      'href',
      '/coding_rules?qprofile=old-php-qp&activation=true&statuses=DEPRECATED',
    );
  });

  it('should be able to see exporters links when there are exporters for the language', async () => {
    renderQualityProfile();
    await ui.waitForDataLoaded();

    expect(await ui.exportersSection.find()).toBeInTheDocument();
    expect(ui.exportersSection.byText('SonarLint for Visual Studio').get()).toBeInTheDocument();
    expect(ui.exportersSection.byText('SonarLint for Eclipse').get()).toBeInTheDocument();
  });

  it('should be informed when the quality profile has not been found', async () => {
    renderQualityProfile('i-dont-exist');
    await ui.waitForDataLoaded();

    expect(
      await screen.findByRole('heading', { name: 'quality_profiles.not_found' }),
    ).toBeInTheDocument();
    expect(ui.qualityProfilePageLink.get()).toBeInTheDocument();
  });

  it('should be able to backup quality profile', async () => {
    const user = userEvent.setup();
    renderQualityProfile();
    await ui.waitForDataLoaded();

    await user.click(await ui.qualityProfileActions.find());
    expect(ui.backUpLink.get()).toHaveAttribute(
      'href',
      '/api/qualityprofiles/backup?language=php&qualityProfile=Good%20old%20PHP%20quality%20profile',
    );
    expect(ui.backUpLink.get()).toHaveAttribute('download', 'old-php-qp.xml');
  });

  it('should not be able to backup a built-in quality profile', async () => {
    const user = userEvent.setup();
    renderQualityProfile('sonar');
    await ui.waitForDataLoaded();

    await user.click(await ui.qualityProfileActions.find());
    expect(ui.backUpLink.query()).not.toBeInTheDocument();
  });

  it('should be able to compare quality profile', async () => {
    const user = userEvent.setup();
    renderQualityProfile();
    await ui.waitForDataLoaded();

    await user.click(await ui.qualityProfileActions.find());

    expect(ui.compareLink.get()).toBeInTheDocument();
    expect(ui.compareLink.get()).toHaveAttribute(
      'href',
      '/profiles/compare?language=php&name=Good+old+PHP+quality+profile',
    );
  });
});

function renderQualityProfile(key = 'old-php-qp', featureList: Feature[] = []) {
  renderAppRoutes(`profiles/show?key=${key}`, routes, { featureList });
}
