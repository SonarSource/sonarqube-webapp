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

import styled from '@emotion/styled';
import { BreadcrumbsProps, ContentHeaderProps, Layout } from '@sonarsource/echoes-react';
import { To } from 'react-router-dom';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { getBranchLikeDisplayName } from '~shared/helpers/branch-like';
import { isDefined } from '~shared/helpers/types';
import ComponentNavProjectBindingErrorNotif from '../../../components/nav/ComponentNavProjectBindingErrorNotif';
import QualityGateStatus from '../../../components/nav/QualityGateStatus';
import NCDAutoUpdateMessage from '../../../components/new-code-definition/NCDAutoUpdateMessage';
import { ComponentMissingMqrMetricsMessage } from '../../../components/shared/ComponentMissingMqrMetricsMessage';
import { useAddons } from '../../../context/addons/AddonsContext';
import { useAvailableFeatures } from '../../../context/available-features/withAvailableFeatures';
import { useComponent } from '../../../context/componentContext/withComponentContext';
import { SeparatorCircleIcon } from '../../../design-system';
import { getComponentOverviewUrl } from '../../../helpers/urls';
import { Feature } from '../../../types/features';

type SelectedContentHeaderProps = Pick<
  ContentHeaderProps,
  'actions' | 'callout' | 'description' | 'metadata' | 'title'
>;

interface Props extends SelectedContentHeaderProps {
  breadcrumbs?: BreadcrumbsProps['items'];
  disableBranchSelector?: boolean;
  disableQualityGateStatus?: boolean;
  overrideBranchSelectorPath?: To;
}

export function ProjectContentHeader(props: Readonly<Props>) {
  const {
    actions,
    breadcrumbs = [{ linkElement: props.title }],
    callout,
    description,
    disableBranchSelector = false,
    disableQualityGateStatus = false,
    metadata,
    overrideBranchSelectorPath,
    title,
  } = props;

  const { ProjectBranchSelector } = useAddons().branches ?? {};
  const { component } = useComponent();
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { hasFeature } = useAvailableFeatures();

  if (!component) {
    return null;
  }

  const hasBranchSupport = hasFeature(Feature.BranchSupport);
  const branchName =
    hasBranchSupport || !isDefined(branchLike) ? undefined : getBranchLikeDisplayName(branchLike);
  const hasBranchSelector = hasBranchSupport && !disableBranchSelector;

  return (
    <Layout.ContentHeader
      actions={actions}
      breadcrumbs={
        <Layout.PageHeader.Breadcrumbs
          className="fs-mask"
          items={[
            {
              hasEllipsis: true,
              className: 'js-project-link',
              linkElement: component.name,
              to: getComponentOverviewUrl(component.key, component.qualifier),
              title: component.name,
            },
            ...breadcrumbs,
          ]}
        />
      }
      callout={
        <>
          {callout}
          <NCDAutoUpdateMessage branchName={branchName} component={component} />
          <ComponentMissingMqrMetricsMessage component={component} />
          <ComponentNavProjectBindingErrorNotif component={component} />
        </>
      }
      description={description}
      hasDivider
      metadata={metadata && <StyledMetadata>{metadata}</StyledMetadata>}
      title={
        <Layout.ContentHeader.Title
          className="fs-mask"
          headingLevel="h1"
          suffix={
            <>
              {hasBranchSelector && isDefined(ProjectBranchSelector) && branchLike && component && (
                <ProjectBranchSelector
                  className="sw-ml-4 sw-mr-2"
                  component={component}
                  currentBranchLike={branchLike}
                  overridePath={overrideBranchSelectorPath}
                />
              )}
              {hasBranchSelector && !disableQualityGateStatus && branchLike && (
                <QualityGateStatus branchLike={branchLike} indicatorSize="md" />
              )}
            </>
          }
        >
          {title}
        </Layout.ContentHeader.Title>
      }
    />
  );
}

const StyledMetadata = styled(Layout.ContentHeader.Metadata)`
  & > ${SeparatorCircleIcon} + ${SeparatorCircleIcon}, & > ${SeparatorCircleIcon}:is(:first-child),
  & > ${SeparatorCircleIcon}:is(:last-child) {
    display: none;
  }
`;
