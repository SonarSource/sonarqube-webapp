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

import { Link, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { getApplicationAdminUrl } from '~sq-server-commons/helpers/urls';
import { useProjectBindingQuery } from '~sq-server-commons/queries/devops-integration';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchSupportEnabled: boolean;
  canAdminComponent?: boolean;
  component: Component;
  hasManyBranches: boolean;
  isApplication: boolean;
}

export default function BranchHelpTooltip({
  component,
  isApplication,
  hasManyBranches,
  canAdminComponent,
  branchSupportEnabled,
}: Props) {
  const { data: projectBinding } = useProjectBindingQuery(component.key);
  const { formatMessage } = useIntl();
  const branchLikeType = projectBinding?.alm === AlmKeys.GitLab ? 'mr' : 'pr';

  if (isApplication) {
    if (!hasManyBranches && canAdminComponent) {
      return renderApplicationTooltip();
    }

    return undefined;
  }

  if (!branchSupportEnabled) {
    return renderDisabledBranchSupportTooltip();
  }

  if (!hasManyBranches) {
    return renderSingleBranchTooltip();
  }

  return undefined;

  function renderApplicationTooltip() {
    return (
      <ToggleTip
        description={<FormattedMessage id="application.branches.help" />}
        footer={
          <Link to={getApplicationAdminUrl(component.key)}>
            <FormattedMessage id="application.branches.link" />
          </Link>
        }
      />
    );
  }

  function renderDisabledBranchSupportTooltip() {
    return (
      <span data-test="branches-support-disabled">
        <ToggleTip
          description={getNoBranchSupportDescription()}
          footer={
            <Link enableOpenInNewTab to="https://www.sonarsource.com/plans-and-pricing/developer/">
              <FormattedMessage id="learn_more" />
            </Link>
          }
          title={getNoBranchSupportTitle()}
        />
      </span>
    );
  }

  function renderSingleBranchTooltip() {
    return (
      <span data-test="only-one-branch-like">
        <ToggleTip
          description={<FormattedMessage id="branch_like_navigation.only_one_branch.content" />}
          footer={
            <div className="sw-flex sw-flex-col sw-items-start sw-gap-1">
              <DocumentationLink to={DocLink.BranchAnalysis}>
                <FormattedMessage id="branch_like_navigation.only_one_branch.documentation" />
              </DocumentationLink>

              <DocumentationLink to={DocLink.PullRequestAnalysis}>
                <FormattedMessage id="branch_like_navigation.only_one_branch.pr_analysis" />
              </DocumentationLink>

              <Link to={`/tutorials?id=${component.key}`}>
                <FormattedMessage id="branch_like_navigation.tutorial_for_ci" />
              </Link>
            </div>
          }
          title={<FormattedMessage id="branch_like_navigation.only_one_branch.title" />}
        />
      </span>
    );
  }

  function getNoBranchSupportDescription() {
    if (projectBinding == null) {
      return formatMessage({ id: 'branch_like_navigation.no_branch_support.content' });
    }

    return formatMessage(
      { id: `branch_like_navigation.no_branch_support.content_x.${branchLikeType}` },
      { alm: formatMessage({ id: `alm.${projectBinding.alm}` }) },
    );
  }

  function getNoBranchSupportTitle() {
    return formatMessage({
      id:
        projectBinding == null
          ? 'branch_like_navigation.no_branch_support.title'
          : `branch_like_navigation.no_branch_support.title.${branchLikeType}`,
    });
  }
}
