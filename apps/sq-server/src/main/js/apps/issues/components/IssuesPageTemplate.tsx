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

import { BreadcrumbsProps, Layout } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isDefined } from '~shared/helpers/types';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';

export interface IssuesPageTemplateProps extends PropsWithChildren {
  asideLeft?: React.ReactNode;
  breadcrumbs?: BreadcrumbsProps['items'];
  header?: React.ReactNode;
  skipPageContentWrapper?: boolean;
  title: string;
}

export function IssuesPageTemplate(props: Readonly<IssuesPageTemplateProps>) {
  const { children, ...commonProps } = props;
  const intl = useIntl();
  const { component } = useComponent();

  if (isDefined(component)) {
    return (
      <ProjectPageTemplate
        {...commonProps}
        overrideBranchSelectorPath={getComponentIssuesUrl(component.key, {
          issueStatuses: 'OPEN,CONFIRMED', // Default filters
        })}
      >
        {children}
      </ProjectPageTemplate>
    );
  }

  return (
    <Layout.ContentGrid>
      <Helmet defer={false} title={intl.formatMessage({ id: 'issues.page' })} />
      {props.asideLeft}
      <Layout.PageGrid>
        {props.header}
        {props.skipPageContentWrapper ? (
          children
        ) : (
          <Layout.PageContent>{children}</Layout.PageContent>
        )}
        <GlobalFooter />
      </Layout.PageGrid>
    </Layout.ContentGrid>
  );
}
