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

import { Card, Layout, Link } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

export interface ComponentContainerNotFoundProps {
  isPortfolioLike: boolean;
}

export default function ComponentContainerNotFound({
  isPortfolioLike,
}: Readonly<ComponentContainerNotFoundProps>) {
  const intl = useIntl();
  const componentType = isPortfolioLike ? 'portfolio' : 'project';

  return (
    <Layout.ContentGrid>
      <Layout.PageGrid>
        <Layout.PageContent>
          <Helmet defaultTitle={intl.formatMessage({ id: '404_not_found' })} defer={false} />
          <div className="sw-max-w-abs-500 sw-mx-auto sw-mt-24">
            <Card>
              <Card.Header
                title={<FormattedMessage id={`dashboard.${componentType}.not_found`} />}
              />
              <Card.Body>
                <p className="sw-mb-2">
                  <FormattedMessage id={`dashboard.${componentType}.not_found.2`} />
                </p>
                <Link to="/">
                  <FormattedMessage id="go_back_to_homepage" />
                </Link>
              </Card.Body>
            </Card>
          </div>
        </Layout.PageContent>
      </Layout.PageGrid>
    </Layout.ContentGrid>
  );
}
