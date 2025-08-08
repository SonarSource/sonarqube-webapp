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

import { Link, Text } from '@sonarsource/echoes-react';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getFormattingHelpUrl } from '~adapters/helpers/urls';

export interface FormattingTipsProps {
  className?: string;
}

export default function FormattingTips({ className }: Readonly<FormattingTipsProps>) {
  const formattingHelpUrl = getFormattingHelpUrl();

  const handleClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      window.open(
        formattingHelpUrl,
        'Formatting Tips',
        'height=300,width=600,scrollbars=1,resizable=1',
      );
    },
    [formattingHelpUrl],
  );

  return (
    <Text className={className} isSubtle>
      <Link className="sw-mr-1" onClick={handleClick} to={formattingHelpUrl}>
        <FormattedMessage id="formatting.helplink" />
      </Link>
      {':'}
      <span className="sw-ml-2">
        *<FormattedMessage id="bold" />*
      </span>
      <span className="sw-ml-2">
        ``
        <FormattedMessage id="code" />
        ``
      </span>
      <span className="sw-ml-2">
        * <FormattedMessage id="bulleted_point" />
      </span>
    </Text>
  );
}
