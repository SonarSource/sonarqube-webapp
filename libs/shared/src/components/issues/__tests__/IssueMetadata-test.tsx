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

import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byText } from '../../../helpers/testSelector';
import { CodeAttribute, CodeAttributeCategory } from '../../../types/clean-code-taxonomy';
import { IssueMetadata } from '../IssueMetadata';

it('should render the attribute pill when an attribute is given', () => {
  setupWithProps({
    cleanCodeAttribute: CodeAttribute.Conventional,
    cleanCodeAttributeCategory: CodeAttributeCategory.Adaptable,
  });

  expect(
    byText(`cct.clean_code_attribute.${CodeAttribute.Conventional}`, {
      exact: false,
    }).get(),
  ).toBeInTheDocument();
  expect(
    byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Adaptable}`, {
      exact: false,
    }).get(),
  ).toBeInTheDocument();
});

function setupWithProps(props: Partial<ComponentProps<typeof IssueMetadata>> = {}) {
  return renderWithContext(
    <IssueMetadata
      cleanCodeAttribute={CodeAttribute.Clear}
      cleanCodeAttributeCategory={CodeAttributeCategory.Intentional}
      {...props}
    />,
  );
}
