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
import { registerServiceMocks, resetServiceMocks } from '~shared/api/mocks/server';
import {
  BranchesServiceDefaultDataset,
  BranchesServiceMock,
} from '~shared/api/mocks/services/BranchesServiceMock';
import {
  MeasuresServiceDefaultDataset,
  MeasuresServiceMock,
} from '~shared/api/mocks/services/MeasuresServiceMock';
import { RecentHistory } from '~shared/helpers/recent-history';
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import { deletePortfolio } from '~sq-server-commons/api/project-management';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { ComponentContextShape } from '~sq-server-commons/types/component';
import App from '../App';

// This test intentionally does NOT mock ~shared/helpers/recent-history: it exercises the
// real localStorage-backed store — the exact data source the sidebar switcher
// (ComponentNavHeader) reads from — to prove a deleted portfolio is actually purged from it,
// not just that the mutation calls a mocked function.
jest.mock('~sq-server-commons/api/project-management');

jest.mock('~sq-server-commons/api/mode', () => ({
  getMode: jest.fn().mockResolvedValue({ mode: 'MQR', modified: false }),
}));

const brancheService = new BranchesServiceMock(BranchesServiceDefaultDataset);
const measuresService = new MeasuresServiceMock(MeasuresServiceDefaultDataset);

beforeEach(() => {
  registerServiceMocks(brancheService, measuresService);
  RecentHistory.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  resetServiceMocks();
});

it('purges a deleted portfolio from the real recent-history store that the switcher reads from', async () => {
  const user = userEvent.setup();
  jest.mocked(deletePortfolio).mockResolvedValue(undefined);

  // Simulate what ComponentNav's recent-history effect does every time a user visits a
  // portfolio: it gets recorded in the switcher's history.
  RecentHistory.add({
    key: 'doomed-portfolio',
    name: 'Doomed Portfolio',
    qualifier: ComponentQualifier.Portfolio,
  });
  expect(RecentHistory.get().map((entry) => entry.key)).toContain('doomed-portfolio');

  renderApp(
    'project-delete',
    <ComponentContext.Provider
      value={
        {
          component: mockComponent({
            key: 'doomed-portfolio',
            name: 'Doomed Portfolio',
            qualifier: ComponentQualifier.Portfolio,
          }),
        } as ComponentContextShape
      }
    >
      <App />
    </ComponentContext.Provider>,
  );

  await user.click(byRole('button', { name: 'delete' }).get());
  await user.click(
    byRole('alertdialog', { name: `qualifier.delete.${ComponentQualifier.Portfolio}` })
      .byRole('button', { name: 'delete' })
      .get(),
  );

  expect(await byText(/project_deletion.resource_dele/).find()).toBeInTheDocument();
  // Confirm the portfolio-specific mutation is what actually ran — otherwise the purge
  // assertion below wouldn't distinguish this from useDeleteProjectMutation, which also
  // purges RecentHistory.
  expect(deletePortfolio).toHaveBeenCalledWith('doomed-portfolio');

  // The proof: the real store no longer contains the deleted portfolio, so the switcher
  // (which builds its list from RecentHistory.get(), then filters by qualifier and caps it)
  // can no longer show it.
  expect(RecentHistory.get().map((entry) => entry.key)).not.toContain('doomed-portfolio');
});
