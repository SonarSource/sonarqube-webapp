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

import { cssVar } from '@sonarsource/echoes-react';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Image } from '~adapters/components/common/Image';
import { FCProps } from '../../../types/misc';
import { LAYOUT_LOGO_MAX_WIDTH } from '../../helpers/constants';
import { renderWithContext } from '../../helpers/testUtils';
import { MainAppBar } from '../MainAppBar';
import { SonarQubeLogo } from '../SonarQubeLogo';

it('should render the main app bar with max-height and max-width constraints on the logo', () => {
  setupWithProps();

  expect(screen.getByRole('img')).toHaveStyle({
    border: 'none',
    'max-height': cssVar('sizes-logo-height-small'),
    'max-width': `${LAYOUT_LOGO_MAX_WIDTH}px`,
    'object-fit': 'contain',
  });
});

it('should render the logo', () => {
  const element = setupWithProps({ Logo: SonarQubeLogo });

  // eslint-disable-next-line testing-library/no-node-access
  expect(element.container.querySelector('svg')).toHaveStyle({
    height: '40px',
    width: '132px',
  });
});

it('should add shadow when scrolled', () => {
  setupWithProps();

  expect(screen.getByRole('banner')).toHaveStyle({
    'box-shadow': 'none',
  });

  document.documentElement.scrollTop = 100;
  fireEvent.scroll(document, { target: { scrollTop: 100 } });

  expect(screen.getByRole('banner')).toHaveStyle({
    'box-shadow': cssVar('box-shadow-medium'),
  });
});

function setupWithProps(
  props: FCProps<typeof MainAppBar> = {
    Logo: () => <Image alt="logo" src="http://example.com/logo.png" />,
  },
) {
  return renderWithContext(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<MainAppBar {...props} />} path="/" />
      </Routes>
    </MemoryRouter>,
  );
}
