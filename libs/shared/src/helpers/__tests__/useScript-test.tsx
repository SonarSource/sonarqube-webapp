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

import { fireEvent, screen } from '@testing-library/react';
import { render } from '../test-utils';
import useScript from '../useScript';

const ID = 'test-script';

function X() {
  const { isLoading } = useScript({ id: ID, src: '/test.js' });
  if (isLoading) {
    return null;
  }
  return <div>Script loaded</div>;
}

it('should render correctly', () => {
  const { container } = setup();
  expect(container).toBeEmptyDOMElement();
  // eslint-disable-next-line testing-library/no-node-access
  const scriptElement = document.getElementById(ID) as HTMLElement; // this is the only way
  // RTL by default cannot load the scripts rendered via React, so we need to fire them manually
  // https://github.com/testing-library/dom-testing-library/issues/498
  fireEvent.load(scriptElement);
  expect(screen.getByText('Script loaded')).toBeVisible();
  expect(scriptElement).toBeInTheDocument();
  expect(scriptElement).toHaveAttribute('src', '/test.js');
  expect(scriptElement).toHaveAttribute('id', ID);
  expect(scriptElement).toHaveAttribute('type', 'text/javascript');
  expect(scriptElement).toHaveAttribute('defer', '');
});

function setup() {
  return render(<X />);
}
