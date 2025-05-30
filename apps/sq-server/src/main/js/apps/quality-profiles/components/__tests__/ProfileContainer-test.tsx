/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { mockQualityProfile } from '~sq-server-commons/helpers/testMocks';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import {
  QualityProfilesContextProps,
  withQualityProfilesContext,
} from '../../qualityProfilesContext';
import ProfileContainer from '../ProfileContainer';

it('should render the header and child', () => {
  const targetProfile = mockQualityProfile({ name: 'profile1' });
  renderProfileContainer('/?language=js&name=profile1', {
    profiles: [mockQualityProfile({ language: 'Java', name: 'profile1' }), targetProfile],
  });

  // below, the 2 instances are in the breadcrumbs and in the h1 header
  expect(screen.getAllByText('profile1')).toHaveLength(2);
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
  renderProfileContainer('/?key=profileKey', {
    profiles: [mockQualityProfile({ key: 'profileKey', name: 'found the profile' })],
  });

  // below, the 2 instances are in the breadcrumbs and in the h1 header
  expect(screen.getAllByText('found the profile')).toHaveLength(2);
});

function Child(props: { profile?: Profile }) {
  return <div>{JSON.stringify(props.profile)}</div>;
}

const WrappedChild = withQualityProfilesContext(Child);

function renderProfileContainer(path: string, overrides: Partial<QualityProfilesContextProps>) {
  function ProfileOutlet(props: Partial<QualityProfilesContextProps>) {
    const context = {
      actions: {},
      exporters: [],
      languages: [],
      profiles: [],
      updateProfiles: jest.fn(),
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
                <Route element={<WrappedChild />} path="*" />
              </Route>
            </Route>
          </Routes>
        </TooltipProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}
