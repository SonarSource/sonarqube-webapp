/*
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import { BreadcrumbsProps, Layout } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
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
      <Helmet defer={false} title={intl.formatMessage({ id: 'issues.my_issues' })} />
      {props.asideLeft}
      <Layout.PageGrid>
        <Layout.PageContent>{children}</Layout.PageContent>
      </Layout.PageGrid>
    </Layout.ContentGrid>
  );
}
