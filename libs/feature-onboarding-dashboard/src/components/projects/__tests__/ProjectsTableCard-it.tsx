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

import { Table } from '@sonarsource/echoes-react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import { ComponentProps } from 'react';
import {
  mockOnboardingProjects,
  OnboardingServiceMock,
} from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingProjectScanStatus } from '~shared/types/onboarding';
import { NO_DATA } from '../../dashboardConstants';
import { ProjectsTableCard } from '../ProjectsTableCard';

jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingOrganizationKey: jest.fn().mockReturnValue('my-org'),
}));

/** Two columns, so the no-data row is two em dashes wide. */
const COLUMN_COUNT = 2;

let onboardingMock: OnboardingServiceMock;

beforeAll(() => {
  onboardingMock = new OnboardingServiceMock();
  registerServiceMocks(onboardingMock);
});

afterEach(() => {
  onboardingMock.reset();
});

const ui = {
  title: byText('onboarding_dashboard.projects.title'),
  description: byText('onboarding_dashboard.projects.description'),
  table: byRole('table', { name: 'onboarding_dashboard.projects.title' }),
  searchInput: byRole('searchbox', { name: 'onboarding_dashboard.projects.search' }),
  noDataCell: byText(NO_DATA),
};

function renderCard(props: Partial<ComponentProps<typeof ProjectsTableCard>> = {}) {
  return renderWithRouter(
    <ProjectsTableCard
      columns={[
        { labelKey: 'onboarding_dashboard.projects.col.repository' },
        { labelKey: 'onboarding_dashboard.projects.col.onboarding' },
      ]}
      descriptionKey="onboarding_dashboard.projects.description"
      loadingMessageKey="onboarding_dashboard.projects.loading"
      pageSize={10}
      renderRow={(project) => (
        <Table.Row key={project.key}>
          <Table.Cell>{project.name}</Table.Cell>
          <Table.Cell>{project.scanStatus}</Table.Cell>
        </Table.Row>
      )}
      searchPlaceholderKey="onboarding_dashboard.projects.search"
      titleKey="onboarding_dashboard.projects.title"
      {...props}
    />,
  );
}

it('renders the card with its header and the matching project rows', async () => {
  renderCard();

  expect(await ui.table.byText('web-core').find()).toBeInTheDocument();
  expect(ui.title.get()).toBeInTheDocument();
  expect(ui.description.get()).toBeInTheDocument();
});

it('renders nothing when the organization has no project at all', async () => {
  onboardingMock.setProjects([]);
  const { container } = renderCard();

  // The card stays up while its query is in flight — dropping it before the answer lands would make
  // the dashboard flicker — so wait for it to go rather than reading the DOM straight away.
  await waitForElementToBeRemoved(() => ui.title.query());

  expect(container).toBeEmptyDOMElement();
});

it('keeps the card, with a no-data row, when the search empties it', async () => {
  const { user } = renderCard();

  expect(await ui.table.byText('web-core').find()).toBeInTheDocument();

  // The search is debounced and the component only ever reads the final value, so a single paste
  // exercises the same behaviour as typing for a fraction of the cost.
  await user.click(ui.searchInput.get());
  await user.paste('no-such-repository');

  // An empty result the user brought about themselves keeps its card, or the search box that caused
  // it would disappear along with it. One em dash per column.
  expect(await ui.noDataCell.findAll()).toHaveLength(COLUMN_COUNT);
  expect(ui.title.get()).toBeInTheDocument();
});

it('keeps the card, with a no-data row, when a toolbar filter empties it', async () => {
  // Every fixture project is scanned, so filtering for not-scanned matches none of them while the
  // unfiltered table still has plenty.
  onboardingMock.setProjects(
    mockOnboardingProjects().map((project) => ({
      ...project,
      scanStatus: OnboardingProjectScanStatus.Scanned,
    })),
  );
  renderCard({ filters: { scanStatus: OnboardingProjectScanStatus.NotScanned } });

  expect(await ui.noDataCell.findAll()).toHaveLength(COLUMN_COUNT);
  expect(ui.title.get()).toBeInTheDocument();
});
