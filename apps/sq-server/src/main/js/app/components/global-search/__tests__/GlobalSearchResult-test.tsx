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
import { ComponentQualifier } from '~shared/types/component';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { GlobalSearchResult } from '../GlobalSearchResult';
import { ComponentResult } from '../utils';

const COMPONENT: ComponentResult = {
  key: 'foo',
  name: 'Foo',
  qualifier: ComponentQualifier.Project,
};

it('adds favorite to the result accessible name', () => {
  setup({
    component: {
      isFavorite: true,
      isRecentlyBrowsed: true,
    },
  });

  expect(screen.getByRole('menuitem')).toHaveAccessibleName(/favorite/);
  expect(screen.getByRole('menuitem')).not.toHaveAccessibleName(/recently_browsed/);
});

it('adds recently browsed to the result accessible name', () => {
  setup({
    component: {
      isRecentlyBrowsed: true,
    },
  });

  expect(screen.getByRole('menuitem')).toHaveAccessibleName(/recently_browsed/);
  expect(screen.getByRole('menuitem')).not.toHaveAccessibleName(/favorite/);
});

function setup({
  component = {},
  selected = false,
}: Readonly<{
  component?: Partial<ComponentResult>;
  selected?: boolean;
}> = {}) {
  return renderComponent(
    <ul>
      <GlobalSearchResult
        component={{ ...COMPONENT, ...component }}
        innerRef={jest.fn()}
        onClose={jest.fn()}
        selected={selected}
      />
    </ul>,
  );
}
