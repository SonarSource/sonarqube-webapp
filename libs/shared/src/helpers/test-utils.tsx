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

import { RenderOptions, RenderResult, render as rtlRender } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { Options as UserEventsOptions } from '@testing-library/user-event/dist/types/options';
import { InitialEntry } from 'history';
import { ldClientMock } from 'jest-launchdarkly-mock';
import { identity, kebabCase } from 'lodash';
import {
  AriaRole,
  Attributes,
  createElement,
  forwardRef,
  PropsWithChildren,
  PropsWithoutRef,
  ReactElement,
  RefObject,
} from 'react';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Link,
  Outlet,
  Path,
  Route,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { ContextWrapperInitProps, getContextWrapper } from '~adapters/helpers/test-utils';

type RenderResultWithUser = RenderResult & { user: UserEvent };

export function render(
  ui: ReactElement,
  options?: RenderOptions,
  userEventOptions?: UserEventsOptions,
): RenderResultWithUser {
  return { ...rtlRender(ui, options), user: userEvent.setup(userEventOptions) };
}

export type RenderContextOptions = Omit<RenderOptions, 'wrapper'> &
  ContextWrapperInitProps & {
    initialEntries?: InitialEntry[];
    userEventOptions?: UserEventsOptions;
  };

export function renderWithContext(
  ui: ReactElement,
  { userEventOptions, ...options }: RenderContextOptions = {},
) {
  return render(ui, { ...options, wrapper: getContextWrapper(options) }, userEventOptions);
}

export function renderWithRoutes(
  ui: ReactElement,
  {
    initialEntries,
    userEventOptions,
    ...options
  }: RenderContextOptions & { initialEntries: InitialEntry[] },
) {
  const ContextWrapper = getContextWrapper(options);

  function Wrapper({ children }: Readonly<PropsWithChildren<{}>>) {
    const router = createMemoryRouter(
      createRoutesFromElements(
        <Route
          element={
            <ContextWrapper>
              <Outlet />
            </ContextWrapper>
          }
        >
          {children}
        </Route>,
      ),
      { initialEntries },
    );
    return <RouterProvider router={router} />;
  }

  return render(ui, { ...options, wrapper: Wrapper }, userEventOptions);
}

export function CatchAll({ backPath }: Readonly<{ backPath: string | Partial<Path> }>) {
  const location = useLocation();

  return (
    <>
      <div>{`${location.pathname}${location.search}`}</div>

      <div>
        <Link to={backPath}>back</Link>
      </div>
    </>
  );
}

/**
 * @description Mock a react component
 * @warning Do not import to use in jest.mock, do jest.requireActual('~helpers/testUtils').mockReactComponent instead
 */
export function mockReactComponent<T extends {}>(
  name: string,
  role?: AriaRole,
  transformProps: (props: PropsWithChildren<T>) => any = identity,
) {
  function MockedComponent({ ...props }: PropsWithChildren<T>) {
    return createElement('mocked-' + kebabCase(name), transformProps({ role, ...props }));
  }

  MockedComponent.displayName = `mocked(${name})`;

  return MockedComponent;
}

/**
 * @description Mock a react component with forwarded ref
 * @warning Do not import to use in jest.mock, do jest.requireActual('~helpers/testUtils').mockForwardRefComponent instead
 */
export function mockForwardRefComponent<T>(
  name: string,
  role?: AriaRole,
  transformProps: (props: PropsWithoutRef<T>) => Attributes | null | undefined = identity,
) {
  function MockedComponent(props: PropsWithoutRef<T>, _: RefObject<HTMLDivElement>) {
    return createElement('mocked-' + kebabCase(name), transformProps({ role, ...props }));
  }

  MockedComponent.displayName = `mocked(${name})`;

  return forwardRef<HTMLDivElement, T>(MockedComponent);
}

/**
 * @description A temporary fix for the jest-launchdarkly-mock library to avoide TS Errors
 * @see https://github.com/launchdarkly/jest-launchdarkly-mock/issues/84
 */
export const LdClientMock = {
  ...ldClientMock,
  addHook: jest.fn(),
};
