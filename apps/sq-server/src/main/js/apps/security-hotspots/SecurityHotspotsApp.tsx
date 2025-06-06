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

import { flatMap, range } from 'lodash';
import * as React from 'react';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { getStandards } from '~shared/helpers/security-standards';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { Location, Router } from '~shared/types/router';
import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';
import { getMeasures } from '~sq-server-commons/api/measures';
import {
  getSecurityHotspotList,
  getSecurityHotspots,
} from '~sq-server-commons/api/security-hotspots';
import withIndexationGuard from '~sq-server-commons/components/hoc/withIndexationGuard';
import { getLeakValue } from '~sq-server-commons/components/measure/utils';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { isSameBranchLike } from '~sq-server-commons/helpers/branch-like';
import { isInput } from '~sq-server-commons/helpers/keyboardEventHelpers';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { withBranchLikes } from '~sq-server-commons/queries/branch';
import { withRouter } from '~sq-server-commons/sonar-aligned/components/hoc/withRouter';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import {
  HotspotFilters,
  HotspotResolution,
  HotspotStatus,
  HotspotStatusFilter,
  RawHotspot,
} from '~sq-server-commons/types/security-hotspots';
import { Component } from '~sq-server-commons/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';
import SecurityHotspotsAppRenderer from './SecurityHotspotsAppRenderer';
import { SECURITY_STANDARDS, getLocations } from './utils';

const PAGE_SIZE = 500;

interface Props {
  branchLike?: BranchLike;
  component?: Component;
  currentUser: CurrentUser;
  location: Location;
  router: Router;
}

interface State {
  filterByCWE?: string;
  filterByCategory?: { category: string; standard: StandardsInformationKey };
  filterByFile?: string;
  filters: HotspotFilters;
  hotspotKeys?: string[];
  hotspots: RawHotspot[];
  hotspotsPageIndex: number;
  hotspotsReviewedMeasure?: string;
  hotspotsTotal: number;
  loading: boolean;
  loadingMeasure: boolean;
  loadingMore: boolean;
  selectedHotspot?: RawHotspot;
  selectedHotspotLocationIndex?: number;
  standards: StandardsInformation;
}

export class SecurityHotspotsApp extends React.PureComponent<Props, State> {
  mounted = false;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      filters: {
        ...this.constructFiltersFromProps(props),
        status: HotspotStatusFilter.TO_REVIEW,
      },

      hotspots: [],
      hotspotsPageIndex: 1,
      hotspotsTotal: 0,
      loading: true,
      loadingMeasure: false,
      loadingMore: false,
      selectedHotspot: undefined,

      standards: {
        [StandardsInformationKey.CWE]: {},
        [StandardsInformationKey.OWASP_ASVS_4_0]: {},
        [StandardsInformationKey.OWASP_TOP10_2021]: {},
        [StandardsInformationKey.OWASP_TOP10]: {},
        [StandardsInformationKey.PCI_DSS_3_2]: {},
        [StandardsInformationKey.PCI_DSS_4_0]: {},
        [StandardsInformationKey.SONARSOURCE]: {},
        [StandardsInformationKey.CASA]: {},
        [StandardsInformationKey.STIG_ASD_V5R3]: {},
      },
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.fetchInitialData();

    this.registerKeyboardEvents();
  }

  componentDidUpdate(previous: Props) {
    if (
      !isSameBranchLike(previous.branchLike, this.props.branchLike) ||
      (this.props.component !== undefined &&
        this.props.component.key !== previous.component?.key) ||
      this.props.location.query.hotspots !== previous.location.query.hotspots ||
      SECURITY_STANDARDS.some((s) => this.props.location.query[s] !== previous.location.query[s]) ||
      this.props.location.query.files !== previous.location.query.files
    ) {
      this.fetchInitialData();
    }

    if (
      !isSameBranchLike(previous.branchLike, this.props.branchLike) ||
      isLoggedIn(this.props.currentUser) !== isLoggedIn(previous.currentUser) ||
      this.props.location.query.assignedToMe !== previous.location.query.assignedToMe ||
      this.props.location.query.inNewCodePeriod !== previous.location.query.inNewCodePeriod
    ) {
      this.setState(({ filters }) => ({
        filters: { ...this.constructFiltersFromProps, ...filters },
      }));
    }
  }

  componentWillUnmount() {
    this.unregisterKeyboardEvents();
    this.mounted = false;
  }

  registerKeyboardEvents() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (isInput(event)) {
      return;
    }

    if (event.key === KeyboardKeys.Alt) {
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case KeyboardKeys.DownArrow: {
        event.preventDefault();

        if (event.altKey) {
          this.selectNextLocation();
        } else {
          this.selectNeighboringHotspot(+1);
        }

        break;
      }
      case KeyboardKeys.UpArrow: {
        event.preventDefault();

        if (event.altKey) {
          this.selectPreviousLocation();
        } else {
          this.selectNeighboringHotspot(-1);
        }

        break;
      }
    }
  };

  selectNextLocation = () => {
    const { selectedHotspotLocationIndex, selectedHotspot } = this.state;

    if (selectedHotspot === undefined) {
      return;
    }

    const locations = getLocations(selectedHotspot.flows, undefined);

    if (locations.length === 0) {
      return;
    }

    const lastIndex = locations.length - 1;

    let newIndex;

    if (selectedHotspotLocationIndex === undefined) {
      newIndex = 0;
    } else if (selectedHotspotLocationIndex === lastIndex) {
      newIndex = undefined;
    } else {
      newIndex = selectedHotspotLocationIndex + 1;
    }

    this.setState({ selectedHotspotLocationIndex: newIndex });
  };

  selectPreviousLocation = () => {
    const { selectedHotspotLocationIndex } = this.state;

    let newIndex;

    if (selectedHotspotLocationIndex === 0) {
      newIndex = undefined;
    } else if (selectedHotspotLocationIndex !== undefined) {
      newIndex = selectedHotspotLocationIndex - 1;
    }

    this.setState({ selectedHotspotLocationIndex: newIndex });
  };

  selectNeighboringHotspot = (shift: number) => {
    this.setState({ selectedHotspotLocationIndex: undefined });

    this.setState(({ hotspots, selectedHotspot }) => {
      const index = selectedHotspot && hotspots.findIndex((h) => h.key === selectedHotspot.key);

      if (index !== undefined && index > -1) {
        const newIndex = Math.max(0, Math.min(hotspots.length - 1, index + shift));

        return {
          selectedHotspot: hotspots[newIndex],
        };
      }

      return { selectedHotspot };
    });
  };

  unregisterKeyboardEvents() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  constructFiltersFromProps(
    props: Props,
  ): Pick<HotspotFilters, 'assignedToMe' | 'inNewCodePeriod'> {
    return {
      assignedToMe: props.location.query.assignedToMe === 'true' && isLoggedIn(props.currentUser),
      inNewCodePeriod:
        isPullRequest(props.branchLike) || props.location.query.inNewCodePeriod === 'true',
    };
  }

  handleCallFailure = () => {
    if (this.mounted) {
      this.setState({ loading: false, loadingMore: false });
    }
  };

  fetchInitialData() {
    const { branchLike: previousBranch } = this.props;
    return Promise.all([
      getStandards(),
      this.fetchSecurityHotspots(),
      this.fetchSecurityHotspotsReviewed(),
    ])
      .then(([standards, components]) => {
        if (!this.mounted || components === undefined) {
          return;
        }

        const { hotspots, paging } = components;

        const { branchLike } = this.props;

        if (isSameBranchLike(previousBranch, branchLike)) {
          const selectedHotspot = hotspots.length > 0 ? hotspots[0] : undefined;

          this.setState({
            hotspots,
            hotspotsTotal: paging.total,
            loading: false,
            selectedHotspot,
            standards,
          });
        }
      })
      .catch(this.handleCallFailure);
  }

  fetchSecurityHotspotsReviewed = () => {
    const { branchLike: previousBranch, component } = this.props;
    const { filters } = this.state;

    const reviewedHotspotsMetricKey = filters.inNewCodePeriod
      ? MetricKey.new_security_hotspots_reviewed
      : MetricKey.security_hotspots_reviewed;

    this.setState({ loadingMeasure: true });

    if (component === undefined) {
      return Promise.resolve();
    }

    return getMeasures({
      component: component.key,
      metricKeys: reviewedHotspotsMetricKey,
      ...getBranchLikeQuery(previousBranch),
    })
      .then((measures) => {
        const { branchLike } = this.props;
        if (!this.mounted) {
          return;
        }

        if (isSameBranchLike(previousBranch, branchLike)) {
          const measure = measures && measures.length > 0 ? measures[0] : undefined;

          const hotspotsReviewedMeasure = filters.inNewCodePeriod
            ? getLeakValue(measure)
            : measure?.value;

          this.setState({ hotspotsReviewedMeasure, loadingMeasure: false });
        }
      })
      .catch(() => {
        if (this.mounted) {
          this.setState({ loadingMeasure: false });
        }
      });
  };

  fetchFilteredSecurityHotspots({
    filterByCategory,
    filterByCWE,
    filterByFile,
    page,
  }: {
    filterByCWE: string | undefined;

    filterByCategory:
      | {
          category: string;
          standard: StandardsInformationKey;
        }
      | undefined;
    filterByFile: string | undefined;
    page: number;
  }) {
    const { branchLike, component, location } = this.props;
    const { filters } = this.state;
    if (component === undefined) {
      return Promise.resolve(undefined);
    }

    const hotspotFilters: Record<string, string> = {};

    if (filterByCategory) {
      hotspotFilters[filterByCategory.standard] = filterByCategory.category;
    }

    if (filterByCWE) {
      hotspotFilters[StandardsInformationKey.CWE] = filterByCWE;
    }

    if (filterByFile) {
      hotspotFilters.files = filterByFile;
    }

    hotspotFilters.owaspAsvsLevel = location.query.owaspAsvsLevel;

    return getSecurityHotspots(
      {
        ...hotspotFilters,
        inNewCodePeriod: filters.inNewCodePeriod && Boolean(filterByFile), // only add new code period when filtering by file
        p: page,
        project: component.key,
        ps: PAGE_SIZE,
        status: HotspotStatus.TO_REVIEW, // we're only interested in unresolved hotspots
        ...getBranchLikeQuery(branchLike),
      },
      component.needIssueSync,
    );
  }

  fetchSecurityHotspots(page = 1) {
    const { branchLike, component, location } = this.props;
    const { filters } = this.state;

    if (component === undefined) {
      return Promise.resolve(undefined);
    }

    const hotspotKeys = location.query.hotspots
      ? (location.query.hotspots as string).split(',')
      : undefined;

    const standard = SECURITY_STANDARDS.find(
      (stnd) => stnd !== StandardsInformationKey.CWE && location.query[stnd] !== undefined,
    );

    const filterByCategory = standard
      ? { standard, category: location.query[standard] }
      : undefined;

    const filterByCWE: string | undefined = location.query.cwe;

    const filterByFile: string | undefined = location.query.files;

    this.setState({ filterByCategory, filterByCWE, filterByFile, hotspotKeys });

    if (hotspotKeys && hotspotKeys.length > 0) {
      return getSecurityHotspotList(
        hotspotKeys,
        {
          project: component.key,
          ...getBranchLikeQuery(branchLike),
        },
        component.needIssueSync,
      );
    }

    if (filterByCategory || filterByCWE || filterByFile) {
      return this.fetchFilteredSecurityHotspots({
        filterByCategory,
        filterByCWE,
        filterByFile,
        page,
      });
    }

    const status =
      filters.status === HotspotStatusFilter.TO_REVIEW
        ? HotspotStatus.TO_REVIEW
        : HotspotStatus.REVIEWED;

    const resolution =
      filters.status === HotspotStatusFilter.TO_REVIEW
        ? undefined
        : HotspotResolution[filters.status];

    return getSecurityHotspots(
      {
        inNewCodePeriod: filters.inNewCodePeriod,
        ...(component.needIssueSync ? {} : { onlyMine: filters.assignedToMe }),
        p: page,
        project: component.key,
        ps: PAGE_SIZE,
        resolution,
        status,
        ...getBranchLikeQuery(branchLike),
      },
      component.needIssueSync,
    );
  }

  reloadSecurityHotspotList = () => {
    this.setState({ loading: true });

    return this.fetchSecurityHotspots()
      .then((components) => {
        if (!this.mounted || components === undefined) {
          return;
        }

        const { hotspots, paging } = components;

        this.setState({
          hotspots,
          hotspotsPageIndex: 1,
          hotspotsTotal: paging.total,
          loading: false,
          selectedHotspot: hotspots.length > 0 ? hotspots[0] : undefined,
        });
      })
      .catch(this.handleCallFailure);
  };

  handleChangeFilters = (changes: Partial<HotspotFilters>) => {
    this.setState(
      ({ filters }) => ({ filters: { ...filters, ...changes } }),
      () => {
        this.reloadSecurityHotspotList();

        if (changes.inNewCodePeriod !== undefined) {
          this.fetchSecurityHotspotsReviewed();
        }
      },
    );
  };

  handleShowAllHotspots = () => {
    if (this.props.component === undefined) {
      return;
    }
    this.props.router.push({
      pathname: this.props.location.pathname,
      query: {
        assignedToMe: undefined,
        file: undefined,
        fileUuid: undefined,
        hotspots: [],
        id: this.props.component.key,
        sinceLeakPeriod: undefined,
      },
    });
  };

  handleChangeStatusFilter = (status: HotspotStatusFilter) => {
    this.handleChangeFilters({ status });
  };

  handleHotspotClick = (selectedHotspot: RawHotspot) => {
    this.setState({ selectedHotspot, selectedHotspotLocationIndex: undefined });
  };

  handleHotspotUpdate = (hotspotKey: string) => {
    const { hotspots, hotspotsPageIndex } = this.state;
    const index = hotspots.findIndex((h) => h.key === hotspotKey);

    return Promise.all(
      range(hotspotsPageIndex).map((p) =>
        this.fetchSecurityHotspots(p + 1 /* pages are 1-indexed */),
      ),
    )
      .then((hotspotPages) => {
        const allHotspots = flatMap(hotspotPages, 'hotspots');
        const { paging } = hotspotPages[hotspotPages.length - 1]!;

        const nextHotspot = allHotspots[Math.min(index, allHotspots.length - 1)];

        this.setState(({ selectedHotspot }) => ({
          hotspots: allHotspots,
          hotspotsPageIndex: paging.pageIndex,
          hotspotsTotal: paging.total,
          selectedHotspot: selectedHotspot?.key === hotspotKey ? nextHotspot : selectedHotspot,
        }));
      })
      .then(this.fetchSecurityHotspotsReviewed);
  };

  handleLoadMore = () => {
    const { hotspots, hotspotsPageIndex: hotspotPages } = this.state;

    this.setState({ loadingMore: true });

    return this.fetchSecurityHotspots(hotspotPages + 1)
      .then((components) => {
        if (!this.mounted || components === undefined) {
          return;
        }

        const { hotspots: additionalHotspots } = components;

        this.setState({
          hotspots: [...hotspots, ...additionalHotspots],
          hotspotsPageIndex: hotspotPages + 1,
          loadingMore: false,
        });
      })
      .catch(this.handleCallFailure);
  };

  handleLocationClick = (locationIndex?: number) => {
    const { selectedHotspotLocationIndex } = this.state;

    if (locationIndex === undefined || locationIndex === selectedHotspotLocationIndex) {
      this.setState({
        selectedHotspotLocationIndex: undefined,
      });
    } else {
      this.setState({
        selectedHotspotLocationIndex: locationIndex,
      });
    }
  };

  render() {
    const { branchLike, component } = this.props;

    const {
      filterByCategory,
      filterByCWE,
      filterByFile,
      filters,
      hotspotKeys,
      hotspots,
      hotspotsReviewedMeasure,
      hotspotsTotal,
      loading,
      loadingMeasure,
      loadingMore,
      selectedHotspot,
      selectedHotspotLocationIndex,
      standards,
    } = this.state;

    return (
      <SecurityHotspotsAppRenderer
        branchLike={branchLike}
        component={component}
        filterByCWE={filterByCWE}
        filterByCategory={filterByCategory}
        filterByFile={filterByFile}
        filters={filters}
        hotspots={hotspots}
        hotspotsReviewedMeasure={hotspotsReviewedMeasure}
        hotspotsTotal={hotspotsTotal}
        isStaticListOfHotspots={Boolean(
          (hotspotKeys && hotspotKeys.length > 0) ||
            filterByCategory ||
            filterByCWE ||
            filterByFile,
        )}
        loading={loading}
        loadingMeasure={loadingMeasure}
        loadingMore={loadingMore}
        onChangeFilters={this.handleChangeFilters}
        onHotspotClick={this.handleHotspotClick}
        onLoadMore={this.handleLoadMore}
        onLocationClick={this.handleLocationClick}
        onShowAllHotspots={this.handleShowAllHotspots}
        onSwitchStatusFilter={this.handleChangeStatusFilter}
        onUpdateHotspot={this.handleHotspotUpdate}
        securityCategories={standards[StandardsInformationKey.SONARSOURCE]}
        selectedHotspot={selectedHotspot}
        selectedHotspotLocation={selectedHotspotLocationIndex}
        standards={standards}
      />
    );
  }
}

export default withRouter(
  withComponentContext(
    withCurrentUserContext(
      withBranchLikes(
        withIndexationGuard({
          Component: SecurityHotspotsApp,
          showIndexationMessage: ({ component }) =>
            component !== undefined &&
            !!(component.qualifier === ComponentQualifier.Application && component.needIssueSync),
        }),
      ),
    ),
  ),
);
