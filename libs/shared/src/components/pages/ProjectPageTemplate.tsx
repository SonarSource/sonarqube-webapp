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
  ContentHeaderProps,
  Layout,
  PageGridProps,
} from '@sonarsource/echoes-react';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { To } from 'react-router-dom';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { ProjectContentHeader } from '~adapters/components/layout/ProjectContentHeader';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useFullWindow } from '../../context/fullWindowContext';

interface ProjectContentHeaderProps {
  /** Content header actions that should be wrapped in a Layout.ContentHeader.Actions */
  actions?: ContentHeaderProps['actions'];
  /** Content header breadcrumbs, default breadcrumbs is the project name followed by the page title */
  breadcrumbs?: BreadcrumbsProps['items'];
  /** Callout message that can be displayed at the top of the content header, should use the MessageCallout component */
  callout?: ContentHeaderProps['callout'];
  /** Content header description, displayed below the title */
  description?: ContentHeaderProps['description'];
  /** Whether to disable the branch selector in the content header */
  disableBranchSelector?: boolean;
  /** Whether to disable the quality gate status in the content header, note that the QG status is only displayed when the branch selector is also visible */
  disableQualityGateStatus?: boolean;
  /** Content header metadata, displayed under the title and description, no need to wrap it in Layout.ContentHeader.Metadata, it's already done for you */
  metadata?: ContentHeaderProps['metadata'];
  /** Override the path used by the branch selector to navigate when changing branch */
  overrideBranchSelectorPath?: To;
}

interface Props extends PropsWithChildren, ProjectContentHeaderProps {
  /** Aside left content of the page, should be wrapped in a Layout.AsideLeft */
  asideLeft?: ReactNode;
  /** Additional Page header, displayed under the Content header, not needed for most pages, must be wrapped in a Layout.PageHeader component */
  header?: ReactNode;
  /** Additional class name to apply to the page grid */
  pageClassName?: string;
  /** Whether to skip wrapping the page content in a Layout.PageContent, useful when finer control is needed, like when using the fullWindow layout for example */
  skipPageContentWrapper?: boolean;
  /** Page title, visible in the breadcrumbs and the content header main text */
  title: string;
  /** Page content width, defaults to 'default' */
  width?: PageGridProps['width'];
}

export const ProjectPageTemplate = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    asideLeft,
    children,
    header,
    pageClassName,
    skipPageContentWrapper,
    title,
    width = 'default',
    ...contentHeaderProps
  } = props;
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const { fullWindow } = useFullWindow();

  return (
    <>
      <Helmet defer={false} title={title} />

      {frontEndEngineeringEnableSidebarNavigation && (
        <ProjectContentHeader {...contentHeaderProps} title={title} />
      )}

      {asideLeft}

      <Layout.PageGrid className={pageClassName} ref={ref} width={width}>
        {header}

        {skipPageContentWrapper ? children : <Layout.PageContent>{children}</Layout.PageContent>}

        {!fullWindow && <GlobalFooter />}
      </Layout.PageGrid>
    </>
  );
});

ProjectPageTemplate.displayName = 'ProjectPageTemplate';
