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
import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconX,
  ThemeProvider,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { themeColor } from '../../design-system';
import { translate } from '../../helpers/l10n';

export interface Props {
  children: React.ReactNode;
  onClose: () => void;
  onOpen: () => void;
}

export default class WorkspaceNavItem extends React.PureComponent<Props> {
  handleNameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    this.props.onOpen();
  };

  render() {
    return (
      <StyledWorkspaceNavItem className="sw-mr-2">
        <ThemeProvider theme="dark">
          <StyledWorkSpaceNavItemButton
            className="sw-typo-default sw-pr-10 sw-pl-2"
            onClick={this.handleNameClick}
          >
            {this.props.children}
          </StyledWorkSpaceNavItemButton>
          <ButtonIcon
            Icon={IconX}
            ariaLabel={translate('workspace.close')}
            className="js-close sw-absolute sw-top-0 sw-right-0 sw-m-1/2"
            onClick={this.props.onClose}
            size={ButtonSize.Medium}
            variety={ButtonVariety.DefaultGhost}
          />
        </ThemeProvider>
      </StyledWorkspaceNavItem>
    );
  }
}

const StyledWorkspaceNavItem = styled.li`
  display: inline-flex;
  align-items: center;
  position: relative;
  color: ${themeColor('workSpaceNavItem')};
`;

const StyledWorkSpaceNavItemButton = styled.button`
  display: inline-flex;
  align-items: center;
  border: none;
  height: 2rem;
  background-color: ${themeColor('workSpaceNavItemBackground')};
  color: ${themeColor('workSpaceNavItem')};

  &:hover,
  &:focus {
    color: ${themeColor('workSpaceNavItem')};
    opacity: 0.9;
  }
`;
