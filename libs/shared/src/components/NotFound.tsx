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

import { Button, ButtonVariety, EmptyState, IconWarning } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

export default function NotFound() {
  const { formatMessage } = useIntl();
  return (
    <div className="sw-flex sw-flex-col sw-items-center sw-justify-start sw-pt-40">
      <Helmet defaultTitle={formatMessage({ id: '404_not_found' })} defer={false} />
      <EmptyState
        action={
          <Button reloadDocument to="/" variety={ButtonVariety.Primary}>
            <FormattedMessage id="go_back_to_homepage" />
          </Button>
        }
        className="sw-max-w-[32rem]"
        graphic={<IconWarning />}
        text={<FormattedMessage id="address_mistyped_or_page_moved" />}
        title={<FormattedMessage id="page_not_found" />}
        titleAs="h2"
        titleSize="medium"
      />
    </div>
  );
}
