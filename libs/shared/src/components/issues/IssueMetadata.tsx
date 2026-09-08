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

import { Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { CodeAttribute, CodeAttributeCategory } from '../../types/clean-code-taxonomy';
import { CleanCodeAttributePill } from '../badges/CleanCodeAttributePill';

interface Props {
  cleanCodeAttribute: CodeAttribute;
  cleanCodeAttributeCategory: CodeAttributeCategory;
}

export function IssueMetadata({ cleanCodeAttribute, cleanCodeAttributeCategory }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <aside>
      <dl className="sw-flex sw-flex-col sw-gap-2">
        <dt>
          <Text isHighlighted>{formatMessage({ id: 'issue.details.code_attribute' })}</Text>
        </dt>
        <dd>
          <CleanCodeAttributePill
            cleanCodeAttribute={cleanCodeAttribute}
            cleanCodeAttributeCategory={cleanCodeAttributeCategory}
          />
        </dd>
      </dl>
    </aside>
  );
}
