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
import { byRole, byText } from '../../../helpers/testSelector';
import { CodeAttribute, CodeAttributeCategory } from '../../../types/clean-code-taxonomy';
import { CleanCodeAttributePill } from '../../badges/CleanCodeAttributePill';

it('should render only the category when no attribute is given', () => {
  setupWithProps();

  expect(
    byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Intentional}`).get(),
  ).toBeInTheDocument();
  expect(
    byText(`cct.clean_code_attribute.${CodeAttribute.Clear}`, { exact: false }).query(),
  ).not.toBeInTheDocument();
});

it('should render both category and attribute when an attribute is given', () => {
  setupWithProps({ cleanCodeAttribute: CodeAttribute.Clear });

  expect(
    byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Intentional}`, {
      exact: false,
    }).get(),
  ).toBeInTheDocument();
  expect(
    byText(`cct.clean_code_attribute.${CodeAttribute.Clear}`, { exact: false }).get(),
  ).toBeInTheDocument();
});

it('should use cct translation keys for the badge and popover title', async () => {
  const { user } = setupWithProps();

  const badge = byRole('button', {
    name: `cct.clean_code_attribute_category.${CodeAttributeCategory.Intentional}`,
  }).get();
  await user.click(badge);

  const popover = await byRole('dialog').find();
  expect(popover).toHaveTextContent(
    `cct.clean_code_attribute_category.${CodeAttributeCategory.Intentional}.title`,
  );
  expect(popover).toHaveTextContent(
    `cct.clean_code_attribute_category.${CodeAttributeCategory.Intentional}.advice`,
  );
});

it('should use attribute-specific keys for the badge and popover when an attribute is given', async () => {
  const { user } = setupWithProps({ cleanCodeAttribute: CodeAttribute.Clear });

  const badge = byRole('button', { name: /cct\.clean_code_attribute\.CLEAR/ }).get();
  await user.click(badge);

  const popover = await byRole('dialog').find();
  expect(popover).toHaveTextContent(`cct.clean_code_attribute.${CodeAttribute.Clear}.issue.title`);
  expect(popover).toHaveTextContent(`cct.clean_code_attribute.${CodeAttribute.Clear}.advice`);
});

it('should use the rule-specific title key when type is rule', async () => {
  const { user } = setupWithProps({ cleanCodeAttribute: CodeAttribute.Clear, type: 'rule' });

  const badge = byRole('button', { name: /cct\.clean_code_attribute\.CLEAR/ }).get();
  await user.click(badge);

  const popover = await byRole('dialog').find();
  expect(popover).toHaveTextContent(`cct.clean_code_attribute.${CodeAttribute.Clear}.rule.title`);
});

function setupWithProps(props: Partial<ComponentProps<typeof CleanCodeAttributePill>> = {}) {
  return renderWithContext(
    <CleanCodeAttributePill
      cleanCodeAttributeCategory={CodeAttributeCategory.Intentional}
      {...props}
    />,
  );
}
