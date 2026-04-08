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

import { TooltipProvider } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Outlet, Route, Routes, useOutletContext } from 'react-router-dom';
import { render } from '~shared/helpers/test-utils';
import { mockQualityProfile } from '~sq-server-commons/helpers/testMocks';
import { QualityProfilesContextProps } from '~sq-server-commons/types/quality-profiles';
import ProfileContainer from '../ProfileContainer';

it('should render the header and child', () => {
  const targetProfile = mockQualityProfile({ name: 'profile1' });
  const { container } = renderProfileContainer('/?language=js&name=profile1', {
    profiles: [mockQualityProfile({ language: 'Java', name: 'profile1' }), targetProfile],
  });

  expect(container).toHaveTextContent('profile1');
});

it('should render "not found"', () => {
  renderProfileContainer('/?language=java&name=profile2', {
    profiles: [mockQualityProfile({ name: 'profile1' }), mockQualityProfile({ name: 'profile2' })],
  });

  expect(screen.getByText('quality_profiles.not_found')).toBeInTheDocument();
});

it('should render "not found" for wrong key', () => {
  renderProfileContainer('/?key=wrongKey', {
    profiles: [mockQualityProfile({ key: 'profileKey' })],
  });

  expect(screen.getByText('quality_profiles.not_found')).toBeInTheDocument();
});

it('should handle getting profile by key', () => {
  const { container } = renderProfileContainer('/?key=profileKey', {
    profiles: [mockQualityProfile({ key: 'profileKey', name: 'found the profile' })],
  });

  expect(container).toHaveTextContent('found the profile');
});

function Child() {
  const { profile } = useOutletContext<QualityProfilesContextProps>();
  return <div>{JSON.stringify(profile)}</div>;
}

function renderProfileContainer(path: string, overrides: Partial<QualityProfilesContextProps>) {
  function ProfileOutlet(props: Partial<QualityProfilesContextProps>) {
    const context = {
      actions: {},
      exporters: [],
      languages: [],
      profiles: [],
      ...props,
    };

    return <Outlet context={context} />;
  }

  return render(
    <HelmetProvider context={{}}>
      <MemoryRouter initialEntries={[path]}>
        <TooltipProvider>
          <Routes>
            <Route element={<ProfileOutlet {...overrides} />}>
              <Route element={<ProfileContainer />}>
                <Route element={<Child />} path="*" />
              </Route>
            </Route>
          </Routes>
        </TooltipProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}
