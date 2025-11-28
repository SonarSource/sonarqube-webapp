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

import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { byRole } from '~shared/helpers/testSelector';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { SimpleListStyleFacet } from '../SimpleListStyleFacet';

it('handles single & multiple selections', async () => {
  const user = userEvent.setup();
  renderSimpleListStyleFacet();

  const firstCheckbox = byRole('checkbox', { name: 'prefix.first 1' }).get();
  const secondCheckbox = byRole('checkbox', { name: 'prefix.second 2' }).get();
  const thirdCheckbox = byRole('checkbox', { name: 'prefix.third' }).get();

  expect(thirdCheckbox).toBeDisabled();

  await user.click(firstCheckbox);
  expect(firstCheckbox).toBeChecked();

  await user.keyboard('{Control>}');
  await user.click(secondCheckbox);
  await user.keyboard('{/Control}');

  expect(firstCheckbox).toBeChecked();
  expect(secondCheckbox).toBeChecked();

  await user.keyboard('{Control>}');
  await user.click(secondCheckbox);
  await user.keyboard('{/Control}');
  expect(firstCheckbox).toBeChecked();
  expect(secondCheckbox).not.toBeChecked();
});

function renderSimpleListStyleFacet(
  props: Partial<React.ComponentProps<typeof SimpleListStyleFacet>> = {},
) {
  function Wrapper(props: Partial<React.ComponentProps<typeof SimpleListStyleFacet>> = {}) {
    const [selectedItems, setItems] = React.useState<string[]>([]);

    return (
      <SimpleListStyleFacet
        fetching={false}
        itemNamePrefix="prefix"
        listItems={['first', 'second', 'third']}
        needIssueSync={false}
        onToggle={jest.fn()}
        open
        property="impactSeverities"
        stats={{ first: 1, second: 2 }}
        {...props}
        onChange={(query) => {
          setItems(query.impactSeverities ?? []);
        }}
        selectedItems={selectedItems}
      />
    );
  }

  return renderComponent(<Wrapper {...props} />);
}
