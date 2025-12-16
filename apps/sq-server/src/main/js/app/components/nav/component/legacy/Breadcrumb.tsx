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
import { LinkHighlight, LinkStandalone } from '@sonarsource/echoes-react';
import * as React from 'react';
import { ComponentQualifier } from '~shared/types/component';
import Favorite from '~sq-server-commons/components/controls/Favorite';
import { getComponentOverviewUrl } from '~sq-server-commons/helpers/urls';
import { Component } from '~sq-server-commons/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';
import { ProjectBindingStatus } from './ProjectBindingStatus';

export interface BreadcrumbProps {
  component: Component;
  currentUser: CurrentUser;
}

export function Breadcrumb(props: Readonly<BreadcrumbProps>) {
  const { component, currentUser } = props;

  return (
    <div className="sw-text-sm sw-flex sw-justify-center">
      {component.breadcrumbs.map((breadcrumbElement, i) => {
        const isNotLast = i < component.breadcrumbs.length - 1;
        const isLast = !isNotLast;

        return (
          <div className="sw-flex sw-items-center" key={breadcrumbElement.key}>
            {isLast && isLoggedIn(currentUser) && (
              <Favorite
                className="sw-mr-2"
                component={component.key}
                favorite={Boolean(component.isFavorite)}
                qualifier={component.qualifier}
              />
            )}

            <LinkStandalone
              className="js-project-link"
              enableBlurAfterClick
              highlight={LinkHighlight.Subtle}
              key={breadcrumbElement.name}
              title={breadcrumbElement.name}
              to={getComponentOverviewUrl(breadcrumbElement.key, breadcrumbElement.qualifier)}
            >
              {breadcrumbElement.name}
            </LinkStandalone>

            {component.qualifier === ComponentQualifier.Project && (
              <ProjectBindingStatus className="sw-ml-2" component={component} />
            )}

            {isNotLast && <SlashSeparator className="sw-mx-2" />}
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(Breadcrumb);

const SlashSeparator = styled.span`
  &:after {
    content: '/';
    color: rgba(68, 68, 68, 0.3);
  }
`;
