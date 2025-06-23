/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { Badge, IconBranch, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isView } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { collapsePath, limitComponentName } from '~sq-server-commons/helpers/path';
import { Component, Issue } from '~sq-server-commons/types/types';
import { getSelectedLocation } from '~sq-server-commons/utils/issues-utils';

interface Props {
  component?: Component;
  issue: Issue;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
}

export default function ComponentBreadcrumbs({
  component,
  issue,
  selectedFlowIndex,
  selectedLocationIndex,
}: Props) {
  const intl = useIntl();
  const displayProject =
    !component ||
    ![ComponentQualifier.Project, ComponentQualifier.Directory].includes(
      component.qualifier as ComponentQualifier,
    );

  const displayBranchInformation = isView(component?.qualifier);

  const selectedLocation = getSelectedLocation(issue, selectedFlowIndex, selectedLocationIndex);
  const componentName = selectedLocation ? selectedLocation.componentName : issue.componentLongName;
  const projectName = [issue.projectName, issue.branch].filter((s) => !!s).join(' - ');

  return (
    <Text
      aria-label={intl.formatMessage(
        { id: 'issues.on_file_x' },
        { file: `${displayProject ? issue.projectName + ', ' : ''}${componentName}` },
      )}
      className="sw-flex sw-box-border sw-w-full sw-pb-2 sw-pt-4 sw-truncate"
      isSubdued
    >
      {displayProject && (
        <span title={projectName}>
          {limitComponentName(issue.projectName)}

          {displayBranchInformation && (
            <>
              {' - '}
              {issue.branch ? (
                <>
                  <IconBranch />
                  <span>{issue.branch}</span>
                </>
              ) : (
                <Badge variety="neutral">
                  <FormattedMessage id="branches.main_branch" />
                </Badge>
              )}
            </>
          )}

          <SlashSeparator className="sw-mx-1" />
        </span>
      )}

      <span title={componentName}>{collapsePath(componentName ?? '')}</span>
    </Text>
  );
}

const SlashSeparator = styled.span`
  &:after {
    content: '/';
    color: var(--echoes-color-text-subdued);
  }
`;
