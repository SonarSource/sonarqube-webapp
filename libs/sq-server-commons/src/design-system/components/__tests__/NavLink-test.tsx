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

import { screen } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render } from '../../helpers/testUtils';
import NavLink from '../NavLink';

beforeAll(() => {
  const { location: originalLocation } = window;
  jest.spyOn(window, 'location', 'get').mockReturnValue({
    ...originalLocation,
    href: '',
  });
});

afterAll(() => {
  jest.spyOn(window, 'location', 'get').mockRestore();
});

it('should remove focus after link is clicked', async () => {
  const { user } = setupWithMemoryRouter(<NavLink blurAfterClick to="/initial" />);

  await user.click(screen.getByRole('link'));

  expect(screen.getByRole('link')).not.toHaveFocus();
});

it('should prevent default when preventDefault is true', async () => {
  const { user } = setupWithMemoryRouter(<NavLink preventDefault to="/second" />);

  expect(screen.getByText('/initial')).toBeVisible();

  await user.click(screen.getByRole('link'));

  // prevent default behavior of page navigation
  expect(screen.getByText('/initial')).toBeVisible();
  expect(screen.queryByText('/second')).not.toBeInTheDocument();
});

it('should stop propagation when stopPropagation is true', async () => {
  const buttonOnClick = jest.fn();

  const { user } = setupWithMemoryRouter(
    <button onClick={buttonOnClick} type="button">
      <NavLink stopPropagation to="/second" />
    </button>,
  );

  await user.click(screen.getByRole('link'));

  expect(buttonOnClick).not.toHaveBeenCalled();
});

it('should call onClick when one is passed', async () => {
  const onClick = jest.fn();
  const { user } = setupWithMemoryRouter(
    <NavLink onClick={onClick} stopPropagation to="/second" />,
  );

  await user.click(screen.getByRole('link'));

  expect(onClick).toHaveBeenCalled();
});

it('NavLink should be clickable', async () => {
  const { user } = setupWithMemoryRouter(<NavLink to="/second">internal link</NavLink>);
  expect(screen.getByRole('link')).toBeVisible();

  await user.click(screen.getByRole('link'));

  expect(screen.getByText('/second')).toBeVisible();
});

function ShowPath() {
  const { pathname } = useLocation();
  return <pre>{pathname}</pre>;
}

const setupWithMemoryRouter = (component: JSX.Element, initialEntries = ['/initial']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          element={
            // Below: using <></> won't work in extensions ('React' is not defined). This is because the
            // name 'React' would already have been minified to something else when <> is resolved to
            // React.Fragment
            // eslint-disable-next-line react/jsx-fragments
            <React.Fragment>
              {component}
              <ShowPath />
            </React.Fragment>
          }
          path="/initial"
        />
        <Route element={<ShowPath />} path="/second" />
      </Routes>
    </MemoryRouter>,
  );
};
