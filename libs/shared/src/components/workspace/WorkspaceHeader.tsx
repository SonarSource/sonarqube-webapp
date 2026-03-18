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
  ButtonIconProps,
  ButtonSize,
  ButtonVariety,
  cssVar,
  IconCollapse,
  IconDash,
  IconExpand,
  IconX,
  ThemeProvider,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';

export interface WorkspaceHeaderProps {
  children: React.ReactNode;
  maximized?: boolean;
  onClose: () => void;
  onCollapse: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onResize: (deltaY: number) => void;
}

export function WorkspaceHeader({
  children,
  maximized,
  onClose,
  onCollapse,
  onMaximize,
  onMinimize,
  onResize,
}: Readonly<WorkspaceHeaderProps>) {
  const lastY = React.useRef<number | null>(null);

  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    lastY.current = event.clientY;
  }, []);

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (lastY.current === null) {
        return;
      }
      const deltaY = event.clientY - lastY.current;
      lastY.current = event.clientY;
      onResize(deltaY);
    },
    [onResize],
  );

  const handlePointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    lastY.current = null;
  }, []);

  return (
    <StyledWorkSpaceHeader>
      <StyledWorkspaceName className="sw-typo-default sw-inline-flex sw-items-center fs-mask">
        {children}
      </StyledWorkspaceName>

      <StyledWorkspaceResizer
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      <div className="it__workspace-viewer-actions sw-flex sw-gap-1">
        <ThemeProvider theme="dark">
          <WorkspaceHeaderButton
            icon={IconDash}
            onClick={onCollapse}
            tooltipContent="workspace.minimize"
          />

          {maximized ? (
            <WorkspaceHeaderButton
              icon={IconCollapse}
              onClick={onMinimize}
              tooltipContent="workspace.normal_size"
            />
          ) : (
            <WorkspaceHeaderButton
              icon={IconExpand}
              onClick={onMaximize}
              tooltipContent="workspace.full_window"
            />
          )}

          <WorkspaceHeaderButton icon={IconX} onClick={onClose} tooltipContent="workspace.close" />
        </ThemeProvider>
      </div>
    </StyledWorkSpaceHeader>
  );
}

const StyledWorkSpaceHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 3px 10px;
  font-weight: 300;
  background-color: ${cssVar('color-surface-inverse-default')};
  color: ${cssVar('color-text-on-color')};
`;

const StyledWorkspaceName = styled.h6`
  color: ${cssVar('color-text-on-color')};
`;

const StyledWorkspaceResizer = styled.div`
  position: absolute;
  top: 3px;
  left: 0;
  width: 100%;
  height: 5px;
  cursor: ns-resize;
`;

interface WorkspaceHeaderButtonProps {
  icon: ButtonIconProps['Icon'];
  onClick: () => void;
  tooltipContent: string;
}

function WorkspaceHeaderButton({
  icon,
  onClick,
  tooltipContent,
}: Readonly<WorkspaceHeaderButtonProps>) {
  const { formatMessage } = useIntl();

  return (
    <ButtonIcon
      Icon={icon}
      ariaLabel={formatMessage({ id: tooltipContent })}
      onClick={onClick}
      size={ButtonSize.Medium}
      variety={ButtonVariety.DefaultGhost}
    />
  );
}
