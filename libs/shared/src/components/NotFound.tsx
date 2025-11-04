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

import { Card, Link } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

export default function NotFound() {
  const intl = useIntl();
  return (
    <div className="sw-py-8 sw-flex sw-flex-col sw-items-center sw-pb-24 sw-pt-24 js-page-not-found">
      <Card className="sw-w-abs-400 sw-p-12 sw-text-center">
        <Helmet defaultTitle={intl.formatMessage({ id: '404_not_found' })} defer={false} />
        <h2 className="sw-mb-4">
          <FormattedMessage id="page_not_found" />
        </h2>
        <p className="sw-mb-2">
          <FormattedMessage id="address_mistyped_or_page_moved" />
        </p>
        <p className="sw-pt-4">
          <Link reloadDocument to="/">
            <FormattedMessage id="go_back_to_homepage" />
          </Link>
        </p>
      </Card>
    </div>
  );
}
