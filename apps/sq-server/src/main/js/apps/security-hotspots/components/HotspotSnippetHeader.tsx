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

import { withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ClipboardIconButton, Note, QualifierIcon, themeBorder, themeColor } from '~design-system';
import withCurrentUserContext from '~sq-server-shared/context/current-user/withCurrentUserContext';

import { LinkHighlight, LinkStandalone } from '@sonarsource/echoes-react';
import { translate } from '~sq-server-shared/helpers/l10n';
import { collapsedDirFromPath, fileFromPath } from '~sq-server-shared/helpers/path';
import { getBranchLikeUrl } from '~sq-server-shared/helpers/urls';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import { Hotspot } from '~sq-server-shared/types/security-hotspots';
import { Component } from '~sq-server-shared/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-shared/types/users';
import HotspotOpenInIdeButton from './HotspotOpenInIdeButton';

export interface HotspotSnippetHeaderProps {
  branchLike?: BranchLike;
  component: Component;
  currentUser: CurrentUser;
  hotspot: Hotspot;
}

function HotspotSnippetHeader(props: HotspotSnippetHeaderProps) {
  const { hotspot, currentUser, component, branchLike } = props;
  const {
    project,
    component: { qualifier, path },
  } = hotspot;

  const displayProjectName = component.qualifier === ComponentQualifier.Application;

  return (
    <StyledHeader
      className={`sw-box-border sw-flex sw-gap-2 sw-justify-between sw-mt-6 sw-px-4
                  sw-py-3`}
    >
      <Note className="sw-flex sw-flex-1 sw-flex-wrap sw-gap-2 sw-items-center sw-my-1/2">
        {displayProjectName && (
          <span>
            <LinkStandalone
              highlight={LinkHighlight.CurrentColor}
              iconLeft={<QualifierIcon className="sw-mr-2" qualifier={qualifier} />}
              to={getBranchLikeUrl(project.key, branchLike)}
            >
              {project.name}
            </LinkStandalone>
          </span>
        )}

        <span>
          {collapsedDirFromPath(path)}
          {fileFromPath(path)}
        </span>

        <ClipboardIconButton
          copiedLabel={translate('copied_action')}
          copyLabel={translate('component_viewer.copy_path_to_clipboard')}
          copyValue={path}
        />
      </Note>

      {isLoggedIn(currentUser) && (
        <HotspotOpenInIdeButton hotspotKey={hotspot.key} projectKey={project.key} />
      )}
    </StyledHeader>
  );
}

const StyledHeader = withTheme(styled.div`
  background-color: ${themeColor('codeLine')};
  border: ${themeBorder('default', 'codeLineBorder')};
`);

export default withCurrentUserContext(HotspotSnippetHeader);
