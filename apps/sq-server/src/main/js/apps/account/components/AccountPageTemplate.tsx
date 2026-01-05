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

import { Layout } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { useLocation } from '~shared/components/hoc/withRouter';

interface Props {
  actions?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  pageClassName?: string;
  title?: string;
}

const indexPathname = '/account';

export function AccountPageTemplate({
  actions,
  children,
  description,
  pageClassName,
  title,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const isIndex = pathname === indexPathname || pathname === `${indexPathname}/`;

  return (
    <>
      <Helmet defer={false} title={title} />

      <Layout.PageHeader
        actions={actions}
        breadcrumbs={
          isIndex ? undefined : (
            <Layout.PageHeader.Breadcrumbs
              items={[
                {
                  linkElement: formatMessage({ id: 'my_account.page' }),
                  to: indexPathname,
                },
                { linkElement: title, to: '#' },
              ]}
            />
          )
        }
        description={<Layout.PageHeader.Description>{description}</Layout.PageHeader.Description>}
        title={<Layout.PageHeader.Title>{title}</Layout.PageHeader.Title>}
      />

      <Layout.PageContent className={pageClassName}>{children}</Layout.PageContent>

      <GlobalFooter />
    </>
  );
}
