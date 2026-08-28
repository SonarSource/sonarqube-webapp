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

import { waitForElementToBeRemoved } from '@testing-library/react';
import {
  renderAllProjectsCard,
  search,
  seedPagedProjects,
  setupOnboardingServiceMock,
  ui,
} from './allProjectsCardTestSetup';

setupOnboardingServiceMock();

/**
 * Narrowing the "all projects" table: the search box, the two filter dropdowns, and paging. Each of
 * these sends its state to the backend, so the assertions are about which rows come back.
 */

it('filters by search and by the scan-status dropdown', async () => {
  const { user } = renderAllProjectsCard();

  // web-core is one of the seeded projects and is listed by default.
  expect(await ui.repoWebCore.find()).toBeInTheDocument();

  // Search narrows the list to matching repositories (debounced + server-side).
  await search(user, 'platform');
  await waitForElementToBeRemoved(() => ui.repoWebCore.query());
  expect(ui.repoPlatformJobs.get()).toBeInTheDocument();

  // Clearing the search brings every repository back.
  await user.clear(ui.searchInput.get());
  expect(await ui.repoWebCore.find()).toBeInTheDocument();

  // Picking "Not scanned" keeps only projects that have never been scanned.
  await user.click(ui.scanStatusFilter.get());
  await user.click(await ui.notScannedOption.find());
  await waitForElementToBeRemoved(() => ui.repoWebCore.query());
  expect(ui.repoPlatformJobs.get()).toBeInTheDocument();
});

it('ANDs the scan-status and analysis-mode dropdowns', async () => {
  const { user } = renderAllProjectsCard();

  // Of the three scanned fixture projects, only payments-gateway is also analysed by CI —
  // web-core and identity-lib are not. Both params must reach the backend together for this to
  // hold; sending only the last one picked would keep all three.
  expect(await ui.repoWebCore.find()).toBeInTheDocument();

  await user.click(ui.scanStatusFilter.get());
  await user.click(await ui.scannedOption.find());

  // platform-jobs and mobile-worker are not scanned, so the scan-status filter alone already
  // excludes them.
  await waitForElementToBeRemoved(() => ui.repoPlatformJobs.query());
  expect(ui.repoWebCore.get()).toBeInTheDocument();

  await user.click(ui.analysisModeFilter.get());
  await user.click(await ui.ciOption.find());

  await waitForElementToBeRemoved(() => ui.repoWebCore.query());
  expect(ui.table.byText('payments-gateway').get()).toBeInTheDocument();
  expect(ui.repoIdentityLib.query()).not.toBeInTheDocument();
});

it('shows pagination when the total exceeds the page size', async () => {
  // Three projects over a page of two: the total the backend reports exceeds its page size, which
  // is the only thing that makes pagination appear — confirming the count comes from the server
  // total and not from the length of the page slice.
  seedPagedProjects(3, 2);
  renderAllProjectsCard();

  expect(await ui.title.find()).toBeInTheDocument();
  // Echoes' Pagination component renders a <div> wrapper, not a <nav>, so we probe for the
  // page-2 button whose aria-label is produced by the react-intl mock as 'pagination.page_x.2'
  // (formatMessage({id:'pagination.page_x'}, {page:'2'}) → [id, '2'].join('.')).
  expect(await ui.paginationPage(2).find()).toBeInTheDocument();
});

it('stays on the selected page until a filter or the search actually changes', async () => {
  // Page 1 holds repo-0 and repo-1, page 2 holds repo-2 alone.
  seedPagedProjects(3, 2);
  const { user } = renderAllProjectsCard();

  await user.click(await ui.paginationPage(2).find());

  // The card rebuilds its filter array on every render, so a page reset keyed off the array
  // identity would bounce straight back to page 1 and re-show repo-0.
  expect(await ui.table.byText('repo-2').find()).toBeInTheDocument();
  expect(ui.table.byText('repo-0').query()).not.toBeInTheDocument();

  // Changing a filter, on the other hand, must reset to the first page.
  await user.click(ui.scanStatusFilter.get());
  await user.click(await ui.scannedOption.find());

  expect(await ui.table.byText('repo-0').find()).toBeInTheDocument();
});
