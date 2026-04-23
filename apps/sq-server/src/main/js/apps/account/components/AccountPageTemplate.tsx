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
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
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

  const commonHeaderProps = {
    actions,
    breadcrumbs: isIndex ? undefined : (
      <Layout.ContentHeader.Breadcrumbs
        items={[
          {
            linkElement: formatMessage({ id: 'my_account.page' }),
            to: indexPathname,
          },
          { linkElement: title, to: '#' },
        ]}
      />
    ),
    description: <Layout.ContentHeader.Description>{description}</Layout.ContentHeader.Description>,
    title: <Layout.ContentHeader.Title>{title}</Layout.ContentHeader.Title>,
  };

  return (
    <>
      <Helmet
        defaultTitle={formatMessage({ id: 'my_account.page' })}
        defer={false}
        titleTemplate={formatMessage(
          { id: 'page_title.template.with_category' },
          { page: formatMessage({ id: 'my_account.page' }) },
        )}
      />
      <Layout.ContentHeader {...commonHeaderProps} hasDivider />

      <A11ySkipTarget anchor="account_main" />

      <Layout.PageGrid width="default">
        <Helmet defer={false} title={title} />

        <Layout.PageContent className={pageClassName}>{children}</Layout.PageContent>

        <GlobalFooter />
      </Layout.PageGrid>
    </>
  );
}
