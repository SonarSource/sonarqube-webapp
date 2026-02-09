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

import { Layout, PageGridProps } from '@sonarsource/echoes-react';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';

interface Props extends PropsWithChildren {
  asideLeft?: ReactNode;
  contentHeader?: ReactNode;
  header?: ReactNode;
  pageClassName?: string;
  skipPageContentWrapper?: boolean;
  title?: string;
  width?: PageGridProps['width'];
}

// Page template for non-Sonar extensions using the new layout.
// Similar to GlobalPageTemplate/ProjectPageTemplate but generic.
// Extensions control which header type to render.
export const DefaultExtensionPageTemplate = forwardRef<HTMLDivElement, Props>(
  (
    {
      asideLeft,
      children,
      contentHeader,
      header,
      pageClassName,
      skipPageContentWrapper,
      title,
      width = 'default',
    },
    ref,
  ) => {
    return (
      <>
        {title && <Helmet defer={false} title={title} />}

        {contentHeader}

        {asideLeft}

        <Layout.PageGrid className={pageClassName} ref={ref} width={width}>
          {header}

          {skipPageContentWrapper ? children : <Layout.PageContent>{children}</Layout.PageContent>}

          <GlobalFooter />
        </Layout.PageGrid>
      </>
    );
  },
);

DefaultExtensionPageTemplate.displayName = 'DefaultExtensionPageTemplate';
