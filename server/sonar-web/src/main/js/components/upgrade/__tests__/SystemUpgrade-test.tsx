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
import React from 'react';
import { byRole, byText } from '~sonar-aligned/helpers/testSelector';
import { mockAppState } from '../../../helpers/testMocks';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { EditionKey } from '../../../types/editions';
import { SystemUpgradeButton } from '../SystemUpgradeButton';
import { UpdateUseCase } from '../utils';

const ui = {
  learnMoreButton: byRole('button', { name: 'learn_more' }),

  header: byRole('heading', { name: 'system.system_upgrade' }),
  downloadLink: byRole('link', { name: /system.see_sonarqube_downloads/ }),

  ltaVersionHeader: byRole('heading', { name: /system.lta_version/ }),

  newPatchWarning: byText(/admin_notification.update/),

  latestLtaPatchBanner: byText(/admin_notification.update.on_the_latest_lta.description/),
};

it('should render properly', async () => {
  const user = userEvent.setup();

  renderSystemUpgradeButton();

  await user.click(ui.learnMoreButton.get());

  expect(ui.header.get()).toBeInTheDocument();
  expect(ui.ltaVersionHeader.get()).toBeInTheDocument();
  expect(ui.downloadLink.get()).toBeInTheDocument();
});

it('should render properly for new patch', async () => {
  const user = userEvent.setup();

  renderSystemUpgradeButton(
    {
      updateUseCase: UpdateUseCase.NewPatch,
      latestLTA: '9.9',
      systemUpgrades: [{ downloadUrl: '', version: '9.9.1' }],
    },
    '9.9',
  );

  await user.click(ui.learnMoreButton.get());

  expect(ui.header.get()).toBeInTheDocument();
  expect(ui.newPatchWarning.get()).toBeInTheDocument();
  expect(ui.ltaVersionHeader.get()).toBeInTheDocument();
  expect(ui.downloadLink.get()).toBeInTheDocument();
});

describe('when on the latest LTA', () => {
  it('when there is a new LTA patch, should not render the banner', async () => {
    const user = userEvent.setup();

    renderSystemUpgradeButton(
      {
        updateUseCase: UpdateUseCase.NewPatch,
        latestLTA: '2025.1',
        systemUpgrades: [{ downloadUrl: '', version: '2025.1.3' }],
      },
      '2025.1.2',
    );

    await user.click(ui.learnMoreButton.get());

    expect(ui.latestLtaPatchBanner.query()).not.toBeInTheDocument();
  });

  it('when there is a new LTA patch and when there is another minor version, should not render the banner', async () => {
    const user = userEvent.setup();

    renderSystemUpgradeButton(
      {
        updateUseCase: UpdateUseCase.NewPatch,
        latestLTA: '2025.1',
        systemUpgrades: [
          { downloadUrl: '', version: '2025.1.3' },
          { downloadUrl: '', version: '2025.2' },
        ],
      },
      '2025.1.2',
    );

    await user.click(ui.learnMoreButton.get());

    expect(ui.latestLtaPatchBanner.query()).not.toBeInTheDocument();
  });

  it('when there is another minor version, should render the banner', async () => {
    const user = userEvent.setup();

    renderSystemUpgradeButton(
      {
        updateUseCase: UpdateUseCase.NewVersion,
        latestLTA: '2025.1',
        systemUpgrades: [{ downloadUrl: '', version: '2025.3' }],
      },
      '2025.1.2',
    );

    await user.click(ui.learnMoreButton.get());

    expect(ui.latestLtaPatchBanner.query()).toBeInTheDocument();
  });
});

describe('when not on the latest LTA', () => {
  it('when there is a newer LTA, should not render the latest LTA banner', async () => {
    const user = userEvent.setup();

    renderSystemUpgradeButton(
      {
        updateUseCase: UpdateUseCase.NewVersion,
        latestLTA: '2026.1',
        systemUpgrades: [{ downloadUrl: '', version: '2026.2' }],
      },
      '2025.1',
    );

    await user.click(ui.learnMoreButton.get());

    expect(ui.latestLtaPatchBanner.query()).not.toBeInTheDocument();
  });
});

function renderSystemUpgradeButton(
  props: Partial<React.ComponentPropsWithoutRef<typeof SystemUpgradeButton>> = {},
  version = '9.7',
) {
  renderComponent(
    <SystemUpgradeButton
      updateUseCase={UpdateUseCase.NewVersion}
      latestLTA="9.9"
      systemUpgrades={[
        { downloadUrl: 'eight', version: '9.8' },
        { downloadUrl: 'lts', version: '9.9' },
        { downloadUrl: 'patch', version: '9.9.1' },
      ]}
      {...props}
    />,
    '',
    { appState: mockAppState({ edition: EditionKey.developer, version }) },
  );
}
