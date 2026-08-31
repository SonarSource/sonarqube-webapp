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
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { searchProjects } from '../../../api/components';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { useProjectKeysByUuid } from '../useProjectKeysByUuid';

jest.mock('../../../api/components', () => ({
  ...jest.requireActual('../../../api/components'),
  searchProjects: jest.fn(),
}));

const searchProjectsMock = jest.mocked(searchProjects);

// The only consumer of this adapter, OrganizationArchitecture-it.tsx, jest.mocks
// '~adapters/helpers/useProjectKeysByUuid' to keep its test host-agnostic (SonarCloud resolves
// keys through a real HTTP call, scoped by organization) — so it never executes this file. This
// test is the only place the real Server implementation (paging through every project) gets
// covered.
describe('useProjectKeysByUuid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchProjectsMock.mockResolvedValue({
      components: [
        {
          key: 'project-1',
          name: 'Project One',
          qualifier: ComponentQualifier.Project,
          tags: [],
          uuid: 'project-1-uuid',
          visibility: Visibility.Public,
        },
        {
          key: 'project-2',
          name: 'Project Two',
          qualifier: ComponentQualifier.Project,
          tags: [],
          uuid: 'project-2-uuid',
          visibility: Visibility.Public,
        },
      ],
      facets: [],
      paging: { pageIndex: 1, pageSize: 500, total: 2 },
    });
  });

  it('resolves project uuids to their keys by paging through every project', async () => {
    setup(['project-1-uuid', 'project-2-uuid'], 'unused-on-server');

    expect(await screen.findByText('project-1-uuid=project-1')).toBeInTheDocument();
    expect(screen.getByText('project-2-uuid=project-2')).toBeInTheDocument();
  });

  it('ignores uuids that do not match any project on the instance', async () => {
    setup(['project-1-uuid', 'unknown-uuid'], 'unused-on-server');

    expect(await screen.findByText('project-1-uuid=project-1')).toBeInTheDocument();
    expect(screen.queryByText(/unknown-uuid=/)).not.toBeInTheDocument();
  });

  it('does not fetch when there are no project uuids to resolve', () => {
    setup([], 'unused-on-server');

    expect(screen.getByText('no-data')).toBeInTheDocument();
    expect(searchProjectsMock).not.toHaveBeenCalled();
  });
});

function setup(projectUuids: string[], organizationKey: string) {
  return renderComponent(
    <TestComponent organizationKey={organizationKey} projectUuids={projectUuids} />,
  );
}

function TestComponent({
  organizationKey,
  projectUuids,
}: Readonly<{ organizationKey: string; projectUuids: string[] }>) {
  const { data } = useProjectKeysByUuid(projectUuids, organizationKey);

  if (!data) {
    return <div>no-data</div>;
  }

  return (
    <ul>
      {[...data.entries()].map(([uuid, key]) => (
        <li key={uuid}>{`${uuid}=${key}`}</li>
      ))}
    </ul>
  );
}
