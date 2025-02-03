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
import { Button } from '@sonarsource/echoes-react';
import * as React from 'react';
import { addons } from '~addons/index';
import { Popup, PopupPlacement, PopupZLevel } from '~design-system';
import EscKeydownHandler from '~sq-server-shared/components/controls/EscKeydownHandler';
import FocusOutHandler from '~sq-server-shared/components/controls/FocusOutHandler';
import OutsideClickHandler from '~sq-server-shared/components/controls/OutsideClickHandler';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { isDefined } from '~sq-server-shared/helpers/types';
import { useBranchesQuery, useCurrentBranchQuery } from '~sq-server-shared/queries/branch';
import { isPullRequest } from '~sq-server-shared/sonar-aligned/helpers/branch-like';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { PullRequest } from '~sq-server-shared/types/branch-like';
import { Feature } from '~sq-server-shared/types/features';
import { Component } from '~sq-server-shared/types/types';
import BranchHelpTooltip from './BranchHelpTooltip';
import CurrentBranchLike from './CurrentBranchLike';

interface BranchLikeNavigationProps {
  component: Component;
}

export function BranchLikeNavigation(props: BranchLikeNavigationProps) {
  const { hasFeature } = useAvailableFeatures();

  const {
    component,
    component: { configuration },
  } = props;

  const { data: branchLikes } = useBranchesQuery(component);
  const { data: currentBranchLike } = useCurrentBranchQuery(component);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (currentBranchLike === undefined) {
    return null;
  }

  const isApplication = component.qualifier === ComponentQualifier.Application;

  const branchSupportEnabled = hasFeature(Feature.BranchSupport) && isDefined(addons.branches);

  const Menu = addons.branches?.Menu || (() => undefined);

  const PRLink = (isPullRequest(currentBranchLike) && addons.branches?.PRLink) || (() => undefined);

  const canAdminComponent = configuration?.showSettings;
  const hasManyBranches = branchLikes.length >= 2;
  const isMenuEnabled = branchSupportEnabled && hasManyBranches;

  const currentBranchLikeElement = <CurrentBranchLike currentBranchLike={currentBranchLike} />;

  const handleOutsideClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <SlashSeparator className=" sw-mx-2" />
      <div
        className="sw-flex sw-items-center it__branch-like-navigation-toggler-container"
        data-spotlight-id="cayc-promotion-4"
      >
        <Popup
          allowResizing
          overlay={
            isMenuOpen && (
              <FocusOutHandler onFocusOut={handleOutsideClick}>
                <EscKeydownHandler onKeydown={handleOutsideClick}>
                  <OutsideClickHandler onClickOutside={handleOutsideClick}>
                    {branchSupportEnabled && (
                      <Menu
                        branchLikes={branchLikes}
                        canAdminComponent={canAdminComponent}
                        component={component}
                        currentBranchLike={currentBranchLike}
                        onClose={() => {
                          setIsMenuOpen(false);
                        }}
                      />
                    )}
                  </OutsideClickHandler>
                </EscKeydownHandler>
              </FocusOutHandler>
            )
          }
          placement={PopupPlacement.BottomLeft}
          zLevel={PopupZLevel.Global}
        >
          <Button
            className="sw-max-w-abs-800 sw-px-3"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
            isDisabled={!isMenuEnabled}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
          >
            {currentBranchLikeElement}
          </Button>
        </Popup>

        <div className="sw-ml-2">
          <BranchHelpTooltip
            component={component}
            isApplication={isApplication}
            hasManyBranches={hasManyBranches}
            canAdminComponent={canAdminComponent}
            branchSupportEnabled={branchSupportEnabled}
          />
        </div>

        {branchSupportEnabled && (
          <PRLink currentBranchLike={currentBranchLike as PullRequest} component={component} />
        )}
      </div>
    </>
  );
}

export default React.memo(BranchLikeNavigation);

const SlashSeparator = styled.span`
  &:after {
    content: '/';
    color: rgba(68, 68, 68, 0.3);
  }
`;
