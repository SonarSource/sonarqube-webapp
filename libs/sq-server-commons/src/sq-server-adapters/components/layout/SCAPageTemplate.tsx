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

import { BreadcrumbsProps, Layout, PageGridProps } from '@sonarsource/echoes-react';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { To } from 'react-router-dom';

interface Props extends PropsWithChildren {
  asideLeft?: ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  breadcrumbs?: BreadcrumbsProps['items'];
  header?: ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  overrideBranchSelectorPath?: To;
  pageClassName?: string;
  title: string;
  width?: PageGridProps['width'];
}

export const SCAPageTemplate = forwardRef<HTMLDivElement, Props>(
  ({ asideLeft, children, header, pageClassName, title, width = 'default' }, ref) => {
    return (
      <>
        <Helmet defer={false} title={title} />

        {asideLeft}

        <Layout.PageGrid className={pageClassName} ref={ref} width={width}>
          {header}

          <Layout.PageContent>{children}</Layout.PageContent>
        </Layout.PageGrid>
      </>
    );
  },
);

SCAPageTemplate.displayName = 'SCAPageTemplate';
