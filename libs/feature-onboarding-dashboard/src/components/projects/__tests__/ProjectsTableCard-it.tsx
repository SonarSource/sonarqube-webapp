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
import { OnboardingProjectsScanStatusFilter } from '~shared/types/onboarding';
import { ANY_PROJECTS_FILTER } from '../../../types/types';
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
          <Table.Cell>{project.language}</Table.Cell>
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

it('renders nothing when nothing matches the base filters, whatever else the organization holds', async () => {
  onboardingMock.setProjects(
    mockOnboardingProjects().map((project) => ({ ...project, stale: false })),
  );
  const { container } = renderCard({ baseFilters: ['stale'] });

  // Every project is still there, only none of them is stale: the decision has to be keyed off this
  // table's own base filters, not off the organization's total project count.
  await waitForElementToBeRemoved(() => ui.title.query());

  expect(container).toBeEmptyDOMElement();
  expect(ui.table.query()).not.toBeInTheDocument();
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
  // Nothing in the fixture is left to import, so the "not imported" filter matches no project while
  // the unfiltered table still has plenty.
  onboardingMock.setProjects(mockOnboardingProjects().filter((project) => project.stale));
  renderCard({ userFilters: [OnboardingProjectsScanStatusFilter.NotOnboarded] });

  expect(await ui.noDataCell.findAll()).toHaveLength(COLUMN_COUNT);
  expect(ui.title.get()).toBeInTheDocument();
});

it('ignores the "any" filter token, which carries no constraint', async () => {
  renderCard({ userFilters: [ANY_PROJECTS_FILTER] });

  expect(await ui.table.byText('web-core').find()).toBeInTheDocument();
  expect(ui.noDataCell.queryAll()).toHaveLength(0);
});
