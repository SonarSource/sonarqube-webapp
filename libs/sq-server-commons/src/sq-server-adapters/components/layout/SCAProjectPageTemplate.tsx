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

import { BreadcrumbsProps, PageGridProps } from '@sonarsource/echoes-react';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import { To } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';

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

export const SCAProjectPageTemplate = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, header, width = 'default', ...templateProps } = props;
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  return (
    <ProjectPageTemplate
      {...templateProps}
      // TODO The page header is only used with the old layout, to be removed when we drop the frontEndEngineeringEnableSidebarNavigation flag
      header={!frontEndEngineeringEnableSidebarNavigation && header}
      ref={ref}
      width={width}
    >
      {children}
    </ProjectPageTemplate>
  );
});

SCAProjectPageTemplate.displayName = 'SCAProjectPageTemplate';
