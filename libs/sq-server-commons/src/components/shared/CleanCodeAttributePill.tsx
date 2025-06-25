/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { CleanCodeAttribute, CleanCodeAttributeCategory } from '~shared/types/clean-code-taxonomy';
import { DocLink } from '../../helpers/doc-links';
import { translate } from '../../helpers/l10n';
import DocumentationLink from '../common/DocumentationLink';

export interface Props {
  className?: string;
  cleanCodeAttribute?: CleanCodeAttribute;
  cleanCodeAttributeCategory: CleanCodeAttributeCategory;
  type?: 'issue' | 'rule';
}

export function CleanCodeAttributePill(props: Readonly<Props>) {
  const { className, cleanCodeAttributeCategory, cleanCodeAttribute, type = 'issue' } = props;

  return (
    <Popover
      description={translate(
        'issue',
        cleanCodeAttribute ? 'clean_code_attribute' : 'clean_code_attribute_category',
        cleanCodeAttribute ?? cleanCodeAttributeCategory,
        'advice',
      )}
      footer={
        <DocumentationLink shouldOpenInNewTab standalone to={DocLink.CleanCodeIntroduction}>
          {translate('clean_code_attribute.learn_more')}
        </DocumentationLink>
      }
      title={translate(
        type,
        cleanCodeAttribute ? 'clean_code_attribute' : 'clean_code_attribute_category',
        cleanCodeAttribute ?? cleanCodeAttributeCategory,
        'title',
      )}
    >
      <Badge className={className} data-guiding-id="issue-1" isInteractive variety="info">
        <span className={cleanCodeAttribute ? 'sw-font-semibold' : ''}>
          {translate(type, 'clean_code_attribute_category', cleanCodeAttributeCategory)}
        </span>
        {cleanCodeAttribute && (
          <span> | {translate(type, 'clean_code_attribute', cleanCodeAttribute)}</span>
        )}
      </Badge>
    </Popover>
  );
}
