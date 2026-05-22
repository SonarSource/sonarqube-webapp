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

import type { Path } from 'react-router-dom';
import { renderWithRouter } from '../../../helpers/test-utils';
import { byLabelText, byRole } from '../../../helpers/testSelector';
import { MetricKey } from '../../../types/metrics';
import { ConditionScaSuffix } from '../ConditionScaSuffix';

const SETTINGS_URL: Partial<Path> = {
  pathname: '/organizations/foo/settings/advanced_security',
};
const ADVANCED_SECURITY_DOCS_URL = 'https://docs.sonarcloud.io/advanced-security/';

const ui = {
  upgradeIconWrapper: byRole('img', { name: 'quality_gates.upgrade_badge.tooltip.aria' }),
  toggleTipButton: byRole('button', { name: 'toggle_tip.aria_label.sca_condition' }),
  toggleTipFallback: byLabelText('toggle_tip.aria_label.sca_condition'),
  settingsLink: byRole('link'),
};

function renderConditionScaSuffix(
  overrides: Partial<Parameters<typeof ConditionScaSuffix>[0]> = {},
) {
  return renderWithRouter(
    <ConditionScaSuffix
      advancedSecurityDocsUrl={ADVANCED_SECURITY_DOCS_URL}
      advancedSecuritySettingsUrl={SETTINGS_URL}
      metricKey={MetricKey.new_sca_severity_any_issue}
      upgradeIcon={<span>upgrade</span>}
      {...overrides}
    />,
  );
}

it('renders nothing when the metric is not a SCA metric', () => {
  const { container } = renderConditionScaSuffix({
    metricKey: MetricKey.new_coverage,
    isScaAvailable: true,
    isScaEnabled: true,
  });

  expect(container).toBeEmptyDOMElement();
});

it('renders the upgrade icon when SCA is not available', () => {
  renderConditionScaSuffix({ isScaAvailable: false, isScaEnabled: false });

  expect(ui.upgradeIconWrapper.get()).toBeInTheDocument();
  expect(ui.toggleTipFallback.query()).not.toBeInTheDocument();
});

it('renders the upgrade icon when SCA is unavailable even if isScaEnabled is true', () => {
  renderConditionScaSuffix({ isScaAvailable: false, isScaEnabled: true });

  expect(ui.upgradeIconWrapper.get()).toBeInTheDocument();
  expect(ui.toggleTipFallback.query()).not.toBeInTheDocument();
});

it('renders the enable-SCA toggle tip with a link to the settings page when SCA is available but disabled', async () => {
  const { user } = renderConditionScaSuffix({ isScaAvailable: true, isScaEnabled: false });

  expect(ui.toggleTipButton.get()).toBeInTheDocument();
  expect(ui.upgradeIconWrapper.query()).not.toBeInTheDocument();

  await user.click(ui.toggleTipButton.get());

  const link = await ui.settingsLink.find();
  expect(link).toHaveAttribute('href', SETTINGS_URL.pathname);
});

it('renders nothing when SCA is available and enabled', () => {
  const { container } = renderConditionScaSuffix({ isScaAvailable: true, isScaEnabled: true });

  expect(container).toBeEmptyDOMElement();
});

it.each([
  MetricKey.sca_severity_any_issue,
  MetricKey.new_sca_severity_vulnerability,
  MetricKey.sca_rating_any_issue,
  MetricKey.new_sca_count_any_issue,
])('treats %s as an SCA metric', (metricKey) => {
  renderConditionScaSuffix({ metricKey, isScaAvailable: false });

  expect(ui.upgradeIconWrapper.get()).toBeInTheDocument();
});
