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

import {
  BreadcrumbsProps,
  Layout,
  PageGridProps,
  PageHeaderProps,
} from '@sonarsource/echoes-react';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';

interface Props extends PropsWithChildren {
  actions?: PageHeaderProps['actions'];
  asideLeft?: ReactNode;
  breadcrumbs?: BreadcrumbsProps['items'];
  description?: PageHeaderProps['description'];
  pageClassName?: string;
  scrollBehavior?: PageHeaderProps['scrollBehavior'];
  title: string;
  width?: PageGridProps['width'];
}

export const AdminPageTemplate = forwardRef<HTMLDivElement, Props>(
  (
    { asideLeft, breadcrumbs, children, pageClassName, title, width = 'default', ...headerProps },
    ref,
  ) => {
    return (
      <>
        <Helmet defer={false} title={title} />

        {asideLeft}

        <Layout.PageGrid className={pageClassName} ref={ref} width={width}>
          <Layout.PageHeader
            breadcrumbs={
              <Layout.PageHeader.Breadcrumbs
                items={[
                  { linkElement: <FormattedMessage id="layout.settings" />, to: '/admin/settings' },
                  ...(breadcrumbs ?? [{ linkElement: title }]),
                ]}
              />
            }
            title={<Layout.PageHeader.Title headingLevel="h1">{title}</Layout.PageHeader.Title>}
            {...headerProps}
          />

          <Layout.PageContent>{children}</Layout.PageContent>

          <GlobalFooter />
        </Layout.PageGrid>
      </>
    );
  },
);

AdminPageTemplate.displayName = 'AdminPageTemplate';
