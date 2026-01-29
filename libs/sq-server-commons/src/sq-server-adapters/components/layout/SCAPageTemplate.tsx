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
import { useFlags } from '~adapters/helpers/feature-flags';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isDefined } from '~shared/helpers/types';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { GlobalFooter } from './GlobalFooter';

interface Props extends PropsWithChildren {
  asideLeft?: ReactNode;
  breadcrumbs?: BreadcrumbsProps['items'];
  disableBranchSelector?: boolean;
  header?: ReactNode;
  overrideBranchSelectorPath?: To;
  pageClassName?: string;
  title: string;
  width?: PageGridProps['width'];
}

export const SCAPageTemplate = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, header, width = 'default', ...templateProps } = props;
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  // Gather possible contexts
  const { component } = useComponent();

  // Render the page template that relates to the context in which we show the page

  if (isDefined(component)) {
    return (
      <ProjectPageTemplate
        {...templateProps}
        // The page header is only used with the old layout, to be removed when we drop the frontEndEngineeringEnableSidebarNavigation flag
        header={!frontEndEngineeringEnableSidebarNavigation && header}
        ref={ref}
        width={width}
      >
        {children}
      </ProjectPageTemplate>
    );
  }

  // Default wrapper with no specific page template
  const { asideLeft, pageClassName } = templateProps;

  return (
    <>
      <Helmet defer={false} title={props.title} />

      {asideLeft}

      <Layout.PageGrid className={pageClassName} ref={ref} width={width}>
        {header}

        <Layout.PageContent>{children}</Layout.PageContent>

        <GlobalFooter />
      </Layout.PageGrid>
    </>
  );
});

SCAPageTemplate.displayName = 'SCAPageTemplate';
