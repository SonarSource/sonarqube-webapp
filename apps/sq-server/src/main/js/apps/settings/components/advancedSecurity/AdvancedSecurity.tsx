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

import { Divider, Heading, Text, TextSize } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { AdditionalCategoryComponentProps } from '../AdditionalCategories';
import { AdvancedSast } from './AdvancedSast';
import { Sca } from './Sca';

export function AdvancedSecurity({
  definitions,
}: Readonly<Pick<AdditionalCategoryComponentProps, 'definitions'>>) {
  return (
    <>
      <Heading as="h2" hasMarginBottom>
        <FormattedMessage id="settings.advanced_security.title" />
      </Heading>
      <Text as="p" className="sw-mb-6" size={TextSize.Large}>
        <FormattedMessage id="settings.advanced_security.description" />
      </Text>
      <AdvancedSast />
      <Divider className="sw-my-6" />
      <Sca definitions={definitions} />
    </>
  );
}
