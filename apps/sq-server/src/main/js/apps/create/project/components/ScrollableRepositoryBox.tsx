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

import { cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ReactNode } from 'react';

interface ScrollableRepositoryBoxProps {
  children: ReactNode;
  isBusy?: boolean;
}

/**
 * Fixed-height, scrollable and bordered container for a list of repositories, same as the
 * "select projects" step of the SonarQube Cloud onboarding.
 */
export function ScrollableRepositoryBox({
  children,
  isBusy = false,
}: Readonly<ScrollableRepositoryBoxProps>) {
  return (
    <div
      aria-busy={isBusy}
      className={classNames(
        'sw:relative sw:max-h-[400px] sw:min-h-[100px] sw:overflow-y-auto sw:border sw:rounded',
        { 'sw:opacity-50 sw:pointer-events-none': isBusy },
      )}
      style={{ borderColor: cssVar('color-border-weak') }}
    >
      {children}
    </div>
  );
}
