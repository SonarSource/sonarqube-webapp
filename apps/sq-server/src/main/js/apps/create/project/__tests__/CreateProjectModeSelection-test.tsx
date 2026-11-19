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
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { DopSetting } from '~sq-server-commons/types/dop-translation';
import { CreateProjectModeSelection } from '../CreateProjectModeSelection';

const onConfigMode = jest.fn();

beforeEach(() => {
  onConfigMode.mockClear();
});

function mockDopSetting(type: AlmKeys, key: string): DopSetting {
  return { id: `id-${key}`, key, type, url: 'https://example.com' };
}

const NO_SETTINGS: Record<AlmKeys, DopSetting[]> = {
  [AlmKeys.Azure]: [],
  [AlmKeys.BitbucketCloud]: [],
  [AlmKeys.BitbucketServer]: [],
  [AlmKeys.GitHub]: [],
  [AlmKeys.GitLab]: [],
};

it('shows the two steps and keeps Continue disabled until a configuration is chosen', () => {
  renderModeSelection({ canAdmin: true });

  expect(screen.getByRole('navigation', { name: 'Progress stepper' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'onboarding.create_project.configure.continue' }),
  ).toBeDisabled();
});

it.each([
  AlmKeys.BitbucketServer,
  AlmKeys.BitbucketCloud,
  AlmKeys.Azure,
  AlmKeys.GitLab,
  AlmKeys.GitHub,
])('lets an admin create a configuration for %s', async (alm) => {
  const user = userEvent.setup();
  renderModeSelection({ canAdmin: true });

  await user.click(screen.getByRole('radio', { name: getAlmLabel(alm) }));
  await user.click(
    screen.getByRole('button', { name: 'onboarding.create_project.configure.create' }),
  );

  expect(onConfigMode).toHaveBeenCalledWith(alm);
});

it('enables Continue when the selected platform has a single configuration', async () => {
  const user = userEvent.setup();
  renderModeSelection({
    canAdmin: true,
    dopSettings: { ...NO_SETTINGS, [AlmKeys.GitLab]: [mockDopSetting(AlmKeys.GitLab, 'gitlab-1')] },
  });

  await user.click(screen.getByRole('radio', { name: 'alm.gitlab' }));

  expect(
    screen.getByRole('button', { name: 'onboarding.create_project.configure.continue' }),
  ).toBeEnabled();
});

it('does not let a non-admin pick a platform without a configuration', () => {
  renderModeSelection({ canAdmin: false });

  expect(screen.getByRole('radio', { name: 'alm.github' })).toBeDisabled();
});

function getAlmLabel(alm: AlmKeys) {
  if (alm === AlmKeys.BitbucketServer) {
    return 'onboarding.create_project.configure.bitbucket_server_card';
  }
  return alm === AlmKeys.BitbucketCloud ? `alm.${alm}.long` : `alm.${alm}`;
}

function renderModeSelection({
  canAdmin,
  dopSettings = NO_SETTINGS,
}: {
  canAdmin: boolean;
  dopSettings?: Record<AlmKeys, DopSetting[]>;
}) {
  return renderComponent(
    <CreateProjectModeSelection
      appState={mockAppState({ canAdmin })}
      dopSettings={dopSettings}
      loadingBindings={false}
      onConfigMode={onConfigMode}
      onContinue={jest.fn()}
    />,
  );
}
