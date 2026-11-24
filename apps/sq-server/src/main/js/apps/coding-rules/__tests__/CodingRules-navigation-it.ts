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

import { act, screen } from '@testing-library/react';
import { noop } from 'lodash';
import { getRuleDetails } from '~sq-server-commons/api/rules';
import CodingRulesServiceMock from '~sq-server-commons/api/mocks/CodingRulesServiceMock';
import { QP_2 } from '~sq-server-commons/api/mocks/data/ids';
import { LanguagesServiceMock } from '~sq-server-commons/api/mocks/LanguagesServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { mockLoggedInUser, mockRuleDetails } from '~sq-server-commons/helpers/testMocks';
import { Mode } from '~sq-server-commons/types/mode';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { getPageObjects, renderCodingRulesApp } from '../utils-tests';

const rulesHandler = new CodingRulesServiceMock();
const modeHandler = new ModeServiceMock();
const settingsHandler = new SettingsServiceMock();
const languagesHandler = new LanguagesServiceMock();

jest.mock('~sq-server-commons/api/rules');

afterEach(() => {
  rulesHandler.reset();
  modeHandler.reset();
  settingsHandler.reset();
  languagesHandler.reset();
});

function stallFirstAppRuleDetailsCall(pendingRequest: Promise<never>) {
  const originalImpl = jest.mocked(getRuleDetails).getMockImplementation();
  let stalled = false;
  jest.mocked(getRuleDetails).mockImplementation((params) => {
    if (!stalled && !params.actives) {
      stalled = true;
      return pendingRequest;
    }
    return originalImpl!(params);
  });
  return () => {
    jest.mocked(getRuleDetails).mockImplementation(originalImpl);
  };
}

describe('Rules app list', () => {
  it('ignores a late load failure for a rule the user already left', async () => {
    const { ui, user } = getPageObjects();
    let rejectMissing: (reason: unknown) => void = noop;
    const missingRule = new Promise<never>((_resolve, reject) => {
      rejectMissing = reject;
    });
    // Both the app and the header request the missing rule; later calls use the service mock.
    jest
      .mocked(getRuleDetails)
      .mockImplementationOnce(() => missingRule)
      .mockImplementationOnce(() => missingRule);
    renderCodingRulesApp(undefined, 'coding_rules?open=missing');

    await user.click(await screen.findByRole('button', { name: 'back' }));
    await user.click(await ui.ruleListItemLink('Awsome java rule').find());
    expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();

    rejectMissing({ errors: [] });
    await act(() => missingRule.catch(noop));

    expect(ui.ruleTitle('Awsome java rule').get()).toBeInTheDocument();
    expect(ui.rulesList.query()).not.toBeInTheDocument();
  });

  it('ignores a late load failure after leaving and reopening the same rule', async () => {
    const { ui, user } = getPageObjects();
    let rejectFirstVisit: (reason: unknown) => void = noop;
    const firstVisit = new Promise<never>((_resolve, reject) => {
      rejectFirstVisit = reject;
    });
    const restoreGetRuleDetails = stallFirstAppRuleDetailsCall(firstVisit);

    try {
      renderCodingRulesApp(undefined, 'coding_rules?open=rule1');

      await user.click(await screen.findByRole('button', { name: 'back' }));
      await user.click(await ui.ruleListItemLink('Awsome java rule').find());
      expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();

      rejectFirstVisit({ errors: [] });
      await act(() => firstVisit.catch(noop));

      expect(ui.ruleTitle('Awsome java rule').get()).toBeInTheDocument();
      expect(ui.rulesList.query()).not.toBeInTheDocument();
    } finally {
      restoreGetRuleDetails();
    }
  });

  it('keeps header, body, and Back destination in sync while switching to another rule', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule1');

    expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();
    expect(await screen.findByText('Why')).toBeInTheDocument();

    const originalImpl = jest.mocked(getRuleDetails).getMockImplementation();
    const pendingNextRule = new Promise<never>(noop);
    jest.mocked(getRuleDetails).mockImplementation(() => pendingNextRule);

    try {
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('link', { name: 'coding_rules.page' })).toHaveAttribute(
        'href',
        '/coding_rules?selected=rule2',
      );
      expect(screen.queryByText('Why')).not.toBeInTheDocument();
    } finally {
      jest.mocked(getRuleDetails).mockImplementation(originalImpl);
    }
  });

  it('returns to the rules list from a directly opened rule', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule1');

    expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();
    expect(ui.filtersHeading.query()).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'back' }));

    expect(await ui.rulesList.find()).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'coding_rules.page' })).toBeInTheDocument();
  });

  it.each([
    ['coding_rules?open=rule1&q=Awsome%20java', 'button', 'back'],
    ['coding_rules?open=rule1&rule_key=rule1&q=Awsome%20java', 'button', 'back'],
    ['coding_rules?open=rule1&q=Awsome%20java', 'link', 'coding_rules.page'],
  ] as const)(
    'preserves filters when returning from %s via %s %s',
    async (navigateTo, role, name) => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(undefined, navigateTo);

      expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();
      await user.click(screen.getByRole(role, { name }));

      expect(await ui.rulesList.find()).toBeInTheDocument();
      expect(ui.searchInput.get()).toHaveValue('Awsome java');
      expect(ui.getAllRuleListItems()).toHaveLength(1);
    },
  );

  it('keeps list filters after opening and closing a rule', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?q=Awsome%20java');

    await user.click(await ui.ruleListItemLink('Awsome java rule').find());
    expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'back' }));

    expect(await ui.rulesList.find()).toBeInTheDocument();
    expect(ui.searchInput.get()).toHaveValue('Awsome java');
    expect(ui.getAllRuleListItems()).toHaveLength(1);
  });

  it('returns to the full list from a rule permalink', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule1&rule_key=rule1');

    expect(screen.getByRole('button', { name: 'back' })).toBeInTheDocument();
    expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'back' }));

    expect(await ui.rulesList.find()).toBeInTheDocument();
    expect(ui.ruleListItemLink('Hot hotspot').get()).toBeInTheDocument();
  });

  it('should not show prioritized rule switcher if feature is not enabled', async () => {
    const { ui, user } = getPageObjects();
    rulesHandler.setIsAdmin();
    renderCodingRulesApp(mockLoggedInUser());
    await ui.facetsLoaded();

    await user.click(ui.qpFacet.get());
    await user.click(ui.facetItem('QP Bar Python').get());

    await user.click(ui.changeButton('QP Bar').getAll()[0]);
    expect(ui.prioritizedSwitch.query()).not.toBeInTheDocument();
  });

  it('can not deactivate rules for quality profile if setting is false', async () => {
    const { ui } = getPageObjects();
    rulesHandler.setIsAdmin();
    settingsHandler.set(SettingsKey.QPAdminCanDisableInheritedRules, 'false');

    renderCodingRulesApp(
      mockLoggedInUser(),
      'coding_rules?activation=true&tags=cute&qprofile=' + QP_2,
    );

    await ui.listLoaded();

    // Only rule 9 is shown (inherited, activated)
    expect(ui.getAllRuleListItems()).toHaveLength(1);
    expect(ui.deactivateButton.get()).toBeDisabled();
  });

  it('navigates by keyboard', async () => {
    const { user, ui } = getPageObjects();
    renderCodingRulesApp();
    await ui.listLoaded();

    await user.click(await ui.ruleListItemLink('Awsome java rule').find());

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowRight}');
    expect(await ui.ruleTitle('Hot hotspot').find()).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');

    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowRight}');
    expect(await ui.ruleTitle('Awsome java rule').find()).toBeInTheDocument();
  });

  it('navigates correctly to rule details from second page', async () => {
    // create 121 rules to have 2 pages (100 rules per page)
    const rules = Array.from({ length: 121 }, (_, i) =>
      mockRuleDetails({
        key: `rule${i + 1}`,
        name: `Rule ${i + 1}`,
      }),
    );

    rulesHandler.rules = rules;

    const { user, ui } = getPageObjects();
    renderCodingRulesApp();
    await ui.listLoaded();

    const ruleOnSecondPage = rules[103];
    await user.click(await ui.showMoreButton.find());
    await user.click(await ui.ruleListItemLink(ruleOnSecondPage.name).find());

    expect(await ui.ruleTitle(ruleOnSecondPage.name).find()).toBeInTheDocument();
  });
});

describe('redirects', () => {
  it('should open with permalink', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?rule_key=rule1');
    await ui.listLoaded();
    expect(await ui.ruleListItemLink('Awsome java rule').find()).toBeInTheDocument();
    expect(ui.ruleListItemLink('Hot hotspot').query()).not.toBeInTheDocument();
  });

  it('should open rule details with permalink from second page', async () => {
    // create 121 rules to have 2 pages (100 rules per page)
    const rules = Array.from({ length: 121 }, (_, i) =>
      mockRuleDetails({
        key: `rule${i + 1}`,
        name: `Rule ${i + 1}`,
      }),
    );

    rulesHandler.rules = rules;
    const ruleOnSecondPage = rules[103];

    const { ui } = getPageObjects();
    renderCodingRulesApp(undefined, `coding_rules?open=${ruleOnSecondPage.key}`);

    expect(await ui.ruleTitle(ruleOnSecondPage.name).find()).toBeInTheDocument();
  });

  it('should open rules list if rule does not exist', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp(undefined, `coding_rules?open=non_existent_rule`);

    await ui.listLoaded();
    expect(ui.ruleTitle('non_existent_rule').query()).not.toBeInTheDocument();
  });

  it('should handle hash parameters', async () => {
    const { ui, user } = getPageObjects();

    renderCodingRulesApp(
      mockLoggedInUser(),
      'coding_rules#languages=c,js|impactSoftwareQualities=MAINTAINABILITY|cleanCodeAttributeCategories=INTENTIONAL',
    );

    await ui.facetsLoaded();
    await user.click(ui.cleanCodeCategoriesFacet.get());

    expect(
      await ui.facetItem('issue.clean_code_attribute_category.INTENTIONAL').find(),
    ).toBeChecked();

    expect(ui.facetItem('software_quality.MAINTAINABILITY').get()).toBeChecked();

    // Only 2 rules shown
    expect(screen.getByText('x_of_y_shown.2.2')).toBeInTheDocument();
  });

  it('should handle hash parameters in STANDARD mode', async () => {
    const { ui } = getPageObjects();

    modeHandler.setMode(Mode.Standard);

    renderCodingRulesApp(
      mockLoggedInUser(),
      'coding_rules#languages=c,js|severities=MAJOR|types=BUG',
    );

    await ui.listLoaded();

    expect(ui.facetItem(/issue.type.BUG/).get()).toBeChecked();
    expect(ui.facetItem(/severity.MAJOR/).get()).toBeChecked();

    // Only 2 rules shown
    expect(screen.getByText('x_of_y_shown.2.2')).toBeInTheDocument();
  });
});
