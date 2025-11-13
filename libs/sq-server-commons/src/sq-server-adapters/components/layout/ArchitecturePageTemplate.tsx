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
import classNames from 'classnames';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFullWindow } from '~shared/context/fullWindowContext';
import { GlobalFooter } from './GlobalFooter';

interface Props extends PropsWithChildren {
  actions?: ReactNode;
  asideLeft?: ReactNode;
  breadcrumbs?: BreadcrumbsProps['items'];
  header?: ReactNode;
  legacyContentHeader?: ReactNode;
  metadata?: ReactNode;
  title: string;
  width?: PageGridProps['width'];
}

export const ArchitecturePageTemplate = forwardRef<HTMLDivElement, Readonly<Props>>(
  (props, ref) => {
    const { asideLeft, children, header, legacyContentHeader, title, width = 'default' } = props;
    const { fullWindow } = useFullWindow();

    // This will need to be reworked when we migrate SQS to the new layout with sidebar navigation and architecture is actually available on SQS too.

    return (
      <>
        <Helmet defer={false} title={title} />

        {asideLeft}
        {legacyContentHeader}

        <Layout.PageGrid ref={ref} width={width}>
          {header}

          <Layout.PageContent className={classNames({ 'sw-p-0': fullWindow })}>
            {children}
          </Layout.PageContent>

          <GlobalFooter />
        </Layout.PageGrid>
      </>
    );
  },
);

ArchitecturePageTemplate.displayName = 'ArchitecturePageTemplate';
