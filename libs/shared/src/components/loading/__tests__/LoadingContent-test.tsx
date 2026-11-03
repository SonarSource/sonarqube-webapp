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

import { renderWithRouter } from '../../../helpers/test-utils';
import { byRole, byText } from '../../../helpers/testSelector';
import { LoadingBoundary } from '../LoadingBoundary';
import { LoadingContent } from '../LoadingContent';

const ui = {
  pending: byText('Pending rows'),
  loading: byText('loading', { selector: '[aria-live="polite"]' }),
  loaded: byText('loading_container.default_loaded_message'),
};

it('announces initial loading and uses the existing spinner during refresh', () => {
  const { rerender } = renderWithRouter(
    <LoadingContent fallback={<div aria-hidden>Pending rows</div>} isInitialLoading isLoading>
      <button type="button">Loaded action</button>
    </LoadingContent>,
  );
  expect(ui.pending.get()).toBeInTheDocument();
  expect(ui.loading.get()).toBeInTheDocument();
  expect(byRole('button').query()).not.toBeInTheDocument();

  rerender(
    <LoadingContent
      fallback={<div aria-hidden>Pending rows</div>}
      isInitialLoading={false}
      isLoading={false}
    >
      <button type="button">Loaded action</button>
    </LoadingContent>,
  );
  expect(byRole('button', { name: 'Loaded action' }).get()).toBeInTheDocument();
  expect(ui.loaded.get()).toBeInTheDocument();
  expect(ui.pending.query()).not.toBeInTheDocument();

  rerender(
    <LoadingContent
      fallback={<div aria-hidden>Pending rows</div>}
      isInitialLoading={false}
      isLoading
    >
      <button type="button">Loaded action</button>
    </LoadingContent>,
  );
  expect(byRole('button', { name: 'Loaded action' }).query()).not.toBeInTheDocument();
  expect(byRole('status').get()).toBeInTheDocument();
  expect(ui.loading.query()).not.toBeInTheDocument();
  expect(ui.pending.query()).not.toBeInTheDocument();
});

it('keeps table headers available when the caller renders its own skeleton rows', () => {
  renderWithRouter(
    <LoadingContent isInitialLoading isLoading>
      <table>
        <caption>Inventory</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr aria-hidden>
            <td>Pending rows</td>
          </tr>
        </tbody>
      </table>
    </LoadingContent>,
  );
  expect(byRole('table', { name: 'Inventory' }).get()).toBeInTheDocument();
  expect(byRole('columnheader', { name: 'Name' }).get()).toBeInTheDocument();
  expect(ui.loading.get()).toBeInTheDocument();
});

it('lets the enclosing region own the loading announcement', () => {
  const { rerender } = renderWithRouter(
    <LoadingBoundary isLoading>
      <LoadingContent
        announceLoading={false}
        fallback={<div aria-hidden>Pending rows</div>}
        isInitialLoading
        isLoading
      >
        <button type="button">Loaded action</button>
      </LoadingContent>
    </LoadingBoundary>,
  );
  expect(ui.loading.getAll()).toHaveLength(1);
  expect(ui.pending.get()).toBeInTheDocument();

  rerender(
    <LoadingBoundary isLoading={false}>
      <LoadingContent
        announceLoading={false}
        fallback={<div aria-hidden>Pending rows</div>}
        isInitialLoading={false}
        isLoading={false}
      >
        <button type="button">Loaded action</button>
      </LoadingContent>
    </LoadingBoundary>,
  );
  expect(byRole('button', { name: 'Loaded action' }).get()).toBeInTheDocument();
  expect(ui.loaded.getAll()).toHaveLength(1);
  expect(ui.loading.query()).not.toBeInTheDocument();
});
