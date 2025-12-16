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

import { Badge, BadgeSize, BadgeVariety, Popover } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useCurrentUser } from '~adapters/helpers/users';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useProjectBindingQuery } from '~sq-server-commons/queries/devops-integration';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface UnboundBadgeProps {
  className?: string;
  component: Component;
}

export function MetaUnboundBadge(props: Readonly<UnboundBadgeProps>) {
  const { className, component } = props;
  const { isLoggedIn } = useCurrentUser();
  const { hasFeature } = useAvailableFeatures();
  const hasBranchSupport = hasFeature(Feature.BranchSupport);
  const { data: projectBinding, isLoading: isLoadingProjectBinding } = useProjectBindingQuery(
    component.key,
  );
  const almKey = projectBinding?.alm;

  // Only show unbound badge for projects that aren't bound to users that aren't admin
  if (
    !hasBranchSupport ||
    almKey ||
    projectBinding ||
    isLoadingProjectBinding ||
    !isLoggedIn ||
    component.configuration?.showSettings
  ) {
    return null;
  }

  return (
    <Popover
      description={<FormattedMessage id="project_navigation.binding_status.not_bound.tooltip" />}
    >
      <Badge
        className={className}
        isInteractive
        size={BadgeSize.Small}
        variety={BadgeVariety.Neutral}
      >
        <FormattedMessage id="project_navigation.binding_status.not_bound" />
      </Badge>
    </Popover>
  );
}
