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

import { Heading, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
  children: ReactNode;
}

export function RescanSettings({ children }: Readonly<Props>) {
  return (
    <div className="sw-ml-12">
      <hr className="sw-mx-0 sw-my-6 sw-p-0" />
      <div className="sw-my-8">
        <Heading as="h3" hasMarginBottom>
          <FormattedMessage id="property.sca.admin.rescan.title" />
        </Heading>
        <Text as="p" className="sw-mb-6">
          <FormattedMessage id="property.sca.admin.rescan.description" />
        </Text>

        {children}
      </div>
    </div>
  );
}
