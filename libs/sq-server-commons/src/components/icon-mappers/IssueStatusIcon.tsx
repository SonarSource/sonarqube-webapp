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

import * as React from 'react';
import {
  IconProps,
  StatusConfirmedIcon,
  StatusOpenIcon,
  StatusReopenedIcon,
  StatusResolvedIcon,
} from '../../design-system';
import { IssueStatus } from '../../types/issues';

interface Props extends IconProps {
  issueStatus: IssueStatus;
}

const statusIcons: Record<string, (props: IconProps) => React.ReactElement> = {
  [IssueStatus.Accepted]: StatusConfirmedIcon,
  [IssueStatus.Confirmed]: StatusConfirmedIcon,
  [IssueStatus.FalsePositive]: StatusResolvedIcon,
  [IssueStatus.Fixed]: StatusResolvedIcon,
  [IssueStatus.Open]: StatusOpenIcon,
  closed: StatusResolvedIcon,
  confirm: StatusConfirmedIcon,
  confirmed: StatusConfirmedIcon,
  falsepositive: StatusResolvedIcon,
  in_review: StatusConfirmedIcon,
  open: StatusOpenIcon,
  reopened: StatusReopenedIcon,
  reopen: StatusReopenedIcon,
  unconfirm: StatusReopenedIcon,
  resolve: StatusResolvedIcon,
  resolved: StatusResolvedIcon,
  reviewed: StatusResolvedIcon,
  to_review: StatusOpenIcon,
  wontfix: StatusResolvedIcon,
};

export default function IssueStatusIcon({ issueStatus, ...iconProps }: Props) {
  const DesiredStatusIcon = statusIcons[issueStatus.toLowerCase()];

  return DesiredStatusIcon ? <DesiredStatusIcon {...iconProps} /> : null;
}
