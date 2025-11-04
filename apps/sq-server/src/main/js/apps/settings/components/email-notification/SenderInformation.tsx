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

import { BasicSeparator } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { EmailNotificationFormField } from './EmailNotificationFormField';
import { EmailNotificationGroupProps, FROM_ADDRESS, FROM_NAME, SUBJECT_PREFIX } from './utils';

export function SenderInformation(props: Readonly<EmailNotificationGroupProps>) {
  const { configuration, onChange } = props;

  return (
    <div className="sw-pt-6">
      <EmailNotificationFormField
        description={translate('email_notification.form.from_address.description')}
        id={FROM_ADDRESS}
        name={translate('email_notification.form.from_address')}
        onChange={(value) => {
          onChange({ fromAddress: value });
        }}
        required
        type="email"
        value={configuration.fromAddress}
      />
      <BasicSeparator />
      <EmailNotificationFormField
        description={translate('email_notification.form.from_name.description')}
        id={FROM_NAME}
        name={translate('email_notification.form.from_name')}
        onChange={(value) => {
          onChange({ fromName: value });
        }}
        required
        value={configuration.fromName}
      />
      <BasicSeparator />
      <EmailNotificationFormField
        description={translate('email_notification.form.subject_prefix.description')}
        id={SUBJECT_PREFIX}
        name={translate('email_notification.form.subject_prefix')}
        onChange={(value) => {
          onChange({ subjectPrefix: value });
        }}
        required
        value={configuration.subjectPrefix}
      />
    </div>
  );
}
