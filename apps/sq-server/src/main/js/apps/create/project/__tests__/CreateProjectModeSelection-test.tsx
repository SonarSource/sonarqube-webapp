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
import { CreateProjectModeSelection } from '../CreateProjectModeSelection';

const onConfigMode = jest.fn();

beforeEach(() => {
  onConfigMode.mockClear();
});

it.each([AlmKeys.BitbucketServer, AlmKeys.BitbucketCloud, AlmKeys.Azure, AlmKeys.GitLab])(
  'sets up %s from its own tile',
  async (alm) => {
    const user = userEvent.setup();
    renderModeSelection(alm);

    await user.click(screen.getByRole('button', { name: 'setup' }));

    expect(onConfigMode).toHaveBeenCalledWith(alm);
  },
);

/**
 * A tile only offers a Setup button while its platform has no binding yet. Giving every platform a
 * binding except `unboundAlm` therefore leaves a single Setup button on the page, so the test can
 * click "the" Setup button and know which tile it belongs to.
 */
function renderModeSelection(unboundAlm: AlmKeys) {
  const almCounts = {
    [AlmKeys.Azure]: 1,
    [AlmKeys.BitbucketCloud]: 1,
    [AlmKeys.BitbucketServer]: 1,
    [AlmKeys.GitHub]: 1,
    [AlmKeys.GitLab]: 1,
    [unboundAlm]: 0,
  };

  return renderComponent(
    <CreateProjectModeSelection
      almCounts={almCounts}
      appState={mockAppState({ canAdmin: true })}
      loadingBindings={false}
      onConfigMode={onConfigMode}
    />,
  );
}
