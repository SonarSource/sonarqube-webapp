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

import { mockDefinition } from '../../../helpers/mocks/settings';
import { render } from '../../../helpers/test-utils';
import { byRole, byText } from '../../../helpers/testSelector';
import DefinitionDescriptionBase from '../DefinitionDescriptionBase';

const defaultDefinition = mockDefinition();

it('renders correctly', () => {
  renderComponent();

  expect(
    byRole('heading', { name: `property.${defaultDefinition.key}.name` }).get(),
  ).toBeInTheDocument();
  expect(byText(`property.${defaultDefinition.key}.description`).get()).toBeInTheDocument();
});

it('renders with overrides', () => {
  const nameOverride = 'Name override';
  const descriptionOverride = 'Description override';

  renderComponent({ descriptionOverride, nameOverride });

  expect(byRole('heading', { name: nameOverride }).get()).toBeInTheDocument();
  expect(byText(descriptionOverride).get()).toBeInTheDocument();
});

function renderComponent(props: Partial<Parameters<typeof DefinitionDescriptionBase>[0]> = {}) {
  return render(<DefinitionDescriptionBase definition={defaultDefinition} {...props} />);
}
