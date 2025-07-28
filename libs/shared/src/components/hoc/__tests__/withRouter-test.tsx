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

import { MemoryRouter } from 'react-router-dom';
import { render } from '../../../helpers/test-utils';
import { WithRouterProps, useLocation, withRouter } from '../withRouter';

it('should pass the router and location props to the child component', () => {
  function ChildClass(props: Readonly<{ ownProp: string } & WithRouterProps>) {
    return <div>{JSON.stringify(props)}</div>;
  }

  const UnderTest = withRouter(ChildClass);
  const { container } = render(
    <MemoryRouter>
      <UnderTest ownProp="foo" />
    </MemoryRouter>,
  );

  expect(container).toHaveTextContent('"ownProp":"foo"');
  expect(container).toHaveTextContent('"location":{"pathname":"/","search":""');
  expect(container).toHaveTextContent('"query":{}');
  expect(container).toHaveTextContent('"router":{"searchParams":{}}');
});

it('useLocation should be augmented with query', () => {
  function UnderTest() {
    const location = useLocation();
    return <div>{JSON.stringify(location)}</div>;
  }

  const { container } = render(
    <MemoryRouter>
      <UnderTest />
    </MemoryRouter>,
  );

  expect(container).toHaveTextContent('"pathname":"/"');
  expect(container).toHaveTextContent('"query":{}');
  expect(container).toHaveTextContent('"search":""');
  expect(container).toHaveTextContent('"hash":""');
  expect(container).toHaveTextContent('"state":null');
});
