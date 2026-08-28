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

import { IS_AUTOMATIC_ANALYSIS_SUPPORTED } from '~adapters/helpers/onboarding-actions';
import { ALM_ICONS_BASE_URL } from '~adapters/helpers/urls';
import {
  renderAllProjectsCard,
  seedProjects,
  setupOnboardingServiceMock,
  ui,
} from './allProjectsCardTestSetup';

setupOnboardingServiceMock();

/**
 * What the "all projects" table puts on screen: its columns, each row's repository cell, and the
 * actions the row menu offers for a given scan state. Searching, filtering and paging it live in
 * AllProjectsCardFiltering-it.
 */

/**
 * Entries the row menu of a project scanned by automatic analysis offers: configure CI, restore
 * access and view project, plus the re-run entry on the products that run automatic analysis —
 * elsewhere it is dropped rather than shown as a dead end. Resolved here so the tests below stay
 * free of product branching.
 */
const RERUN_AUTOMATIC_ANALYSIS_ENTRIES = IS_AUTOMATIC_ANALYSIS_SUPPORTED ? 1 : 0;
const AUTOSCANNED_ROW_ENTRIES = 3 + RERUN_AUTOMATIC_ANALYSIS_ENTRIES;

/** Repository, scan status, analysis mode, and the visually blank actions column. */
const COLUMN_COUNT = 4;

it('renders the three redesigned columns and the actions column', async () => {
  renderAllProjectsCard();

  expect(await ui.table.find()).toBeInTheDocument();
  expect(ui.colRepository.get()).toBeInTheDocument();
  expect(ui.colScanStatus.get()).toBeInTheDocument();
  expect(ui.colAnalysisMode.get()).toBeInTheDocument();

  // The actions column header is only exposed to assistive technology — the design shows it blank.
  expect(ui.colActions.get()).toBeInTheDocument();

  // Gate status isn't part of the backend contract yet (PROJECT_HEALTH_FEATURE_ENABLED is off), so
  // its column must not appear.
  expect(ui.columnHeaders.getAll()).toHaveLength(COLUMN_COUNT);
});

it('renders the repository ALM icon from the app-specific images path', async () => {
  // web-core is bound to GitLab; its icon must resolve to the per-app ALM images folder
  // ('images/alm' on SQS, '/images/alms' on SQC) — a hardcoded path breaks on one platform.
  seedProjects('web-core');
  renderAllProjectsCard();

  // Folder and file name are asserted separately because only SQS puts the theme in between
  // (`/images/alm/light/gitlab.svg` there, `/images/alms/gitlab.svg` on SQC); requiring the two to
  // be adjacent would pass on one platform and fail on the other.
  //
  // The trailing slash carries the whole guard on SQS: its constant ('images/alm', with no leading
  // slash — that comes from getBaseUrl()) is a bare substring of SQC's ('/images/alms'), so without
  // it this assertion would happily accept the other product's path, which is the one regression it
  // exists to catch.
  const icon = await ui.repoGitlabIcon.find();
  expect(icon).toHaveAttribute('src', expect.stringContaining(`${ALM_ICONS_BASE_URL}/`));
  expect(icon).toHaveAttribute('src', expect.stringContaining('gitlab.svg'));
});

it('offers the first-scan actions on a row that has not been scanned yet', async () => {
  // platform-jobs has never been scanned.
  seedProjects('platform-jobs');
  const { user } = renderAllProjectsCard();

  expect(await ui.repoPlatformJobs.find()).toBeInTheDocument();

  await user.click(ui.rowActionsButton('platform-jobs').get());

  expect(await ui.configureCiAction.find()).toBeInTheDocument();
  expect(ui.restoreAccessAction.get()).toBeInTheDocument();
  expect(ui.viewProjectAction.get()).toBeInTheDocument();
  expect(ui.rowActionItems.getAll()).toHaveLength(3);
});

it('offers the automatic-analysis actions on a row scanned by autoscan', async () => {
  // identity-lib is the fixture scanned by automatic analysis.
  seedProjects('identity-lib');
  const { user } = renderAllProjectsCard();

  expect(await ui.repoIdentityLib.find()).toBeInTheDocument();

  await user.click(ui.rowActionsButton('identity-lib').get());

  expect(await ui.configureCiAction.find()).toBeInTheDocument();
  expect(ui.restoreAccessAction.get()).toBeInTheDocument();
  expect(ui.viewProjectAction.get()).toBeInTheDocument();

  // Automatic analysis is a SQ-Cloud feature: rather than offer a dead entry, SQ-Server drops it.
  // What each entry then does is covered by ProjectRowActionsCell-it.
  expect(ui.rerunAutomaticAnalysisAction.queryAll()).toHaveLength(RERUN_AUTOMATIC_ANALYSIS_ENTRIES);
  expect(ui.rowActionItems.getAll()).toHaveLength(AUTOSCANNED_ROW_ENTRIES);
});
