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
import { Popup, PopupPlacement, PopupZLevel } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { PullRequest } from '~shared/types/branch-like';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import EscKeydownHandler from '~sq-server-commons/components/controls/EscKeydownHandler';
import FocusOutHandler from '~sq-server-commons/components/controls/FocusOutHandler';
import OutsideClickHandler from '~sq-server-commons/components/controls/OutsideClickHandler';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useBranchesQuery, useCurrentBranchQuery } from '~sq-server-commons/queries/branch';
import { isPullRequest } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
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
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="sw-max-w-abs-800 sw-px-3"
            isDisabled={!isMenuEnabled}
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {currentBranchLikeElement}
          </Button>
        </Popup>

        <div className="sw-ml-2">
          <BranchHelpTooltip
            branchSupportEnabled={branchSupportEnabled}
            canAdminComponent={canAdminComponent}
            component={component}
            hasManyBranches={hasManyBranches}
            isApplication={isApplication}
          />
        </div>

        {branchSupportEnabled && (
          <PRLink component={component} currentBranchLike={currentBranchLike as PullRequest} />
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
