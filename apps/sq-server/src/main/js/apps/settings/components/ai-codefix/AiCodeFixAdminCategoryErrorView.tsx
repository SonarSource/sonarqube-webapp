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

import styled from '@emotion/styled';
import { Button, Heading, IconError, LinkStandalone, Text } from '@sonarsource/echoes-react';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { themeColor } from '~design-system';
import { COMMUNITY_FORUM_URL } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';

interface ErrorViewProps {
  children?: React.ReactNode;
  headingTag?: 'h2' | 'h3';
  message: string;
  onRetry: any;
}

export default function AiCodeFixAdminCategoryErrorView({
  children,
  message,
  headingTag = 'h2',
  onRetry,
}: Readonly<ErrorViewProps>) {
  return (
    <div className="sw-flex sw-flex-col sw-gap-4 sw-items-start sw-max-w-abs-350 sw-p-6">
      <Heading as={headingTag} hasMarginBottom>
        {translate('property.aicodefix.admin.serviceInfo.result.error.title')}
      </Heading>
      <div className="sw-flex">
        <IconError className="sw-mr-1" color="echoes-color-icon-danger" />
        <div className="sw-flex-col">
          <ErrorLabel text={message} />
          {children}
        </div>
      </div>
      <Button onClick={onRetry}>
        {translate('property.aicodefix.admin.serviceInfo.result.error.retry.action')}
      </Button>
      <p>
        <FormattedMessage
          id="property.aicodefix.admin.serviceInfo.result.error.retry.message"
          values={{
            link: (
              <LinkStandalone enableOpenInNewTab to={COMMUNITY_FORUM_URL}>
                {translate('property.aicodefix.admin.serviceInfo.result.error.retry.get_help')}
              </LinkStandalone>
            ),
          }}
        />
      </p>
    </div>
  );
}

interface TextProps {
  /** The text to display inside the component */
  text: string;
}

export function ErrorLabel({ text }: Readonly<TextProps>) {
  return <Text colorOverride="echoes-color-text-danger">{text}</Text>;
}

export const ErrorListItem = styled.li`
  ::marker {
    color: ${themeColor('errorText')};
  }
`;
