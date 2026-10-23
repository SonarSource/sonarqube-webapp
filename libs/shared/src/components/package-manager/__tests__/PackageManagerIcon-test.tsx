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
import { PackageManagers } from '../../../helpers/package-managers';
import { render } from '../../../helpers/test-utils';
import { PackageManagerIcon } from '../PackageManagerIcon';

const UNRECOGNIZED_PACKAGE_MANAGER = 'totally-unknown-manager';

const KNOWN_PACKAGE_MANAGERS = Object.values(PackageManagers).filter(
  (packageManager) => packageManager !== PackageManagers.UNKNOWN,
);

function renderIconMarkup(packageManager: string) {
  return render(<PackageManagerIcon packageManager={packageManager} />).container.innerHTML;
}

it.each(Object.values(PackageManagers))(
  'renders an accessible icon for the %s package manager',
  (packageManager) => {
    render(<PackageManagerIcon ariaLabel={packageManager} packageManager={packageManager} />);

    expect(screen.getByRole('img', { name: packageManager })).toBeInTheDocument();
  },
);

it('falls back to the default icon for an unrecognized package manager', () => {
  render(
    <PackageManagerIcon
      ariaLabel="unknown-manager"
      packageManager={UNRECOGNIZED_PACKAGE_MANAGER}
    />,
  );

  expect(screen.getByRole('img', { name: 'unknown-manager' })).toBeInTheDocument();
});

it('renders without an accessible name when none is provided', () => {
  render(<PackageManagerIcon packageManager={PackageManagers.Swift} />);

  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

// The tests above only check the accessible-name wrapper, which PackageManagerIcon adds
// regardless of which icon is rendered underneath. These tests make sure each known package
// manager actually maps to its own logo, instead of silently falling back to the default icon.
it.each(KNOWN_PACKAGE_MANAGERS)(
  'renders a dedicated logo for the %s package manager',
  (packageManager) => {
    expect(renderIconMarkup(packageManager)).not.toBe(
      renderIconMarkup(UNRECOGNIZED_PACKAGE_MANAGER),
    );
  },
);

it('renders the default icon for the UNKNOWN package manager', () => {
  expect(renderIconMarkup(PackageManagers.UNKNOWN)).toBe(
    renderIconMarkup(UNRECOGNIZED_PACKAGE_MANAGER),
  );
});
