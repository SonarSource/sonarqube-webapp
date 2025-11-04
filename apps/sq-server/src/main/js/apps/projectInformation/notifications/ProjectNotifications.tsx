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

import { Heading, MessageCallout, MessageVariety, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import NotificationsList from '~sq-server-commons/components/notifications/NotificationsList';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Component;
}

export default function ProjectNotifications(props: Readonly<Props>) {
  const { component } = props;

  const intl = useIntl();

  return (
    <form aria-labelledby="notifications-update-title">
      <Heading as="h2" hasMarginBottom>
        {intl.formatMessage({ id: 'project.info.notifications' })}
      </Heading>

      <MessageCallout variety={MessageVariety.Info}>
        <Text isSubtle>
          <FormattedMessage id="notification.dispatcher.information" />
        </Text>
      </MessageCallout>

      <NotificationsList
        className="sw-mt-6"
        projectKey={component.key}
        projectName={component.name}
      />
    </form>
  );
}
