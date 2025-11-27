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

import {
  Button,
  ButtonVariety,
  DropdownMenu,
  IconFilter,
  Spinner,
  Text,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CoverageIndicator } from '~design-system';
import { isBranch } from '~shared/helpers/branch-like';
import { MetricKey, MetricType } from '~shared/types/metrics';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import Measure from '~sq-server-commons/sonar-aligned/components/measure/Measure';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { ComponentContextShape } from '~sq-server-commons/types/component';
import { HotspotFilters } from '~sq-server-commons/types/security-hotspots';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';

export interface SecurityHotspotsAppRendererProps extends ComponentContextShape {
  branchLike?: BranchLike;
  currentUser: CurrentUser;
  filters: HotspotFilters;
  hotspotsReviewedMeasure?: string;
  isStaticListOfHotspots: boolean;
  loadingMeasure: boolean;
  onChangeFilters: (filters: Partial<HotspotFilters>) => void;
}

function HotspotSidebarHeader(props: SecurityHotspotsAppRendererProps) {
  const {
    branchLike,
    component,
    currentUser,
    filters,
    hotspotsReviewedMeasure,
    isStaticListOfHotspots,
    loadingMeasure,
  } = props;
  const intl = useIntl();

  const userLoggedIn = isLoggedIn(currentUser);

  const filtersCount =
    Number(filters.assignedToMe) + Number(isBranch(branchLike) && filters.inNewCodePeriod);

  const isFiltered = Boolean(filtersCount);

  return (
    <div className="sw-flex sw-h-600 sw-items-center sw-px-4 sw-py-4">
      <Spinner isLoading={loadingMeasure}>
        {hotspotsReviewedMeasure !== undefined && (
          <CoverageIndicator value={hotspotsReviewedMeasure} />
        )}

        {component && (
          <Measure
            branchLike={branchLike}
            className="it__hs-review-percentage sw-typo-semibold sw-ml-2"
            componentKey={component.key}
            metricKey={
              isBranch(branchLike) && !filters.inNewCodePeriod
                ? MetricKey.security_hotspots_reviewed
                : MetricKey.new_security_hotspots_reviewed
            }
            metricType={MetricType.Percent}
            value={hotspotsReviewedMeasure}
          />
        )}
      </Spinner>

      <span className="sw-typo-default sw-ml-1">
        {intl.formatMessage({ id: 'metric.security_hotspots_reviewed.name' })}
      </span>

      <ToggleTip
        ariaLabel={intl.formatMessage({ id: 'toggle_tip.aria_label.security_hotspots' })}
        className="sw-ml-2"
        description={intl.formatMessage({ id: 'hotspots.reviewed.tooltip' })}
        title={intl.formatMessage({ id: 'metric.security_hotspots_reviewed.name' })}
      />

      {!isStaticListOfHotspots && (isBranch(branchLike) || userLoggedIn || isFiltered) && (
        <div className="sw-flex sw-flex-grow sw-justify-end sw-items-center">
          <DropdownMenu
            id="filter-hotspots-menu"
            items={
              <>
                <DropdownMenu.GroupLabel>
                  {intl.formatMessage({ id: 'hotspot.filters.title' })}
                </DropdownMenu.GroupLabel>
                {isBranch(branchLike) && (
                  <DropdownMenu.ItemButtonCheckable
                    isChecked={Boolean(filters.inNewCodePeriod)}
                    onClick={(e) => {
                      e.preventDefault();
                      props.onChangeFilters({ inNewCodePeriod: !filters.inNewCodePeriod });
                    }}
                  >
                    <FormattedMessage id="hotspot.filters.period.since_leak_period" />
                  </DropdownMenu.ItemButtonCheckable>
                )}
                {userLoggedIn && (
                  <DropdownMenu.ItemButtonCheckable
                    isChecked={Boolean(filters.assignedToMe)}
                    isDisabled={Boolean(component?.needIssueSync)}
                    onClick={(e) => {
                      e.preventDefault();
                      props.onChangeFilters({ assignedToMe: !filters.assignedToMe });
                    }}
                  >
                    <FormattedMessage id="hotspot.filters.assignee.assigned_to_me" />
                  </DropdownMenu.ItemButtonCheckable>
                )}
                {isFiltered && (
                  <>
                    <DropdownMenu.Separator />
                    <DropdownMenu.ItemButtonDestructive
                      onClick={() => {
                        props.onChangeFilters({
                          assignedToMe: false,
                          inNewCodePeriod: false,
                        });
                      }}
                    >
                      <FormattedMessage id="hotspot.filters.clear" />
                    </DropdownMenu.ItemButtonDestructive>
                  </>
                )}
              </>
            }
          >
            <Button
              ariaLabel={intl.formatMessage(
                { id: 'hotspot.filters.title_x' },
                { count: filtersCount },
              )}
              variety={ButtonVariety.DefaultGhost}
            >
              <IconFilter />
              <Text>{isFiltered ? filtersCount : null}</Text>
            </Button>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

export default withComponentContext(withCurrentUserContext(HotspotSidebarHeader));
