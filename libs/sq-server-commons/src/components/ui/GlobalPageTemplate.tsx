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
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';

interface Props extends PropsWithChildren {
  actions?: PageHeaderProps['actions'];
  asideLeft?: ReactNode;
  breadcrumbs?: BreadcrumbsProps['items'];
  description?: PageHeaderProps['description'];
  hidePageHeader?: boolean;
  pageClassName?: string;
  scrollBehavior?: PageHeaderProps['scrollBehavior'];
  title: string;
  width?: PageGridProps['width'];
}

// Global page template for non-project, non-admin pages like Portfolios list, etc.
// Does NOT render ContentGrid - expects it from parent container (GlobalPageExtensionContainer or AdminContainer)
export const GlobalPageTemplate = forwardRef<HTMLDivElement, Props>(
  (
    {
      asideLeft,
      breadcrumbs,
      children,
      hidePageHeader = false,
      pageClassName,
      title,
      width = 'default',
      ...headerProps
    },
    ref,
  ) => {
    return (
      <>
        <Helmet defer={false} title={title} />

        {asideLeft}

        <Layout.PageGrid className={pageClassName} ref={ref} width={width}>
          {!hidePageHeader && (
            <Layout.PageHeader
              breadcrumbs={breadcrumbs && <Layout.PageHeader.Breadcrumbs items={breadcrumbs} />}
              title={<Layout.PageHeader.Title headingLevel="h1">{title}</Layout.PageHeader.Title>}
              {...headerProps}
            />
          )}

          <Layout.PageContent>{children}</Layout.PageContent>

          <GlobalFooter />
        </Layout.PageGrid>
      </>
    );
  },
);

GlobalPageTemplate.displayName = 'GlobalPageTemplate';
