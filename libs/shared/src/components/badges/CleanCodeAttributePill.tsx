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

import { Badge, Popover } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { CodeAttribute, CodeAttributeCategory } from '../../types/clean-code-taxonomy';

export interface Props {
  className?: string;
  cleanCodeAttribute?: CodeAttribute;
  cleanCodeAttributeCategory: CodeAttributeCategory;
  type?: 'issue' | 'rule';
}

export function CleanCodeAttributePill(props: Readonly<Props>) {
  const { className, cleanCodeAttributeCategory, cleanCodeAttribute, type = 'issue' } = props;
  const { formatMessage: translate } = useIntl();
  const attributeKey = cleanCodeAttribute
    ? 'clean_code_attribute'
    : 'clean_code_attribute_category';
  const attributeValue = cleanCodeAttribute ?? cleanCodeAttributeCategory;

  return (
    <Popover
      description={translate({
        id: `cct.${attributeKey}.${attributeValue}.advice`,
      })}
      title={
        cleanCodeAttribute
          ? translate({ id: `cct.clean_code_attribute.${cleanCodeAttribute}.${type}.title` })
          : translate({ id: `cct.clean_code_attribute_category.${attributeValue}.title` }, { type })
      }
    >
      <Badge
        className={className}
        data-guiding-id="issue-1"
        data-spotlight-id="issue-1"
        isInteractive
        variety="info"
      >
        <span className={cleanCodeAttribute ? 'sw-font-semibold' : ''}>
          {translate({
            id: `cct.clean_code_attribute_category.${cleanCodeAttributeCategory}`,
          })}
        </span>
        {cleanCodeAttribute && (
          <>
            {' | '}
            {translate({
              id:
                type === 'rule'
                  ? `cct.clean_code_attribute.${cleanCodeAttribute}.rule`
                  : `cct.clean_code_attribute.${cleanCodeAttribute}`,
            })}
          </>
        )}
      </Badge>
    </Popover>
  );
}
