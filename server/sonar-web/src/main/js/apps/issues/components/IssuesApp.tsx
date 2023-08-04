/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import classNames from 'classnames';
import {
  ButtonSecondary,
  Checkbox,
  FlagMessage,
  LAYOUT_FOOTER_HEIGHT,
  LargeCenteredLayout,
  PageContentFontWrapper,
  ToggleButton,
  themeBorder,
  themeColor,
} from 'design-system';
import { keyBy, omit, without } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { listIssues, searchIssues } from '../../../api/issues';
import { getRuleDetails } from '../../../api/rules';
import withComponentContext from '../../../app/components/componentContext/withComponentContext';
import withCurrentUserContext from '../../../app/components/current-user/withCurrentUserContext';
import A11ySkipTarget from '../../../components/a11y/A11ySkipTarget';
import EmptySearch from '../../../components/common/EmptySearch';
import ScreenPositionHelper from '../../../components/common/ScreenPositionHelper';
import ListFooter from '../../../components/controls/ListFooter';
import Suggestions from '../../../components/embed-docs-modal/Suggestions';
import withIndexationContext, {
  WithIndexationContextProps,
} from '../../../components/hoc/withIndexationContext';
import withIndexationGuard from '../../../components/hoc/withIndexationGuard';
import { Location, Router, withRouter } from '../../../components/hoc/withRouter';
import IssueTabViewer from '../../../components/rules/IssueTabViewer';
import '../../../components/search-navigator.css';
import Spinner from '../../../components/ui/Spinner';
import { fillBranchLike, getBranchLikeQuery, isSameBranchLike } from '../../../helpers/branch-like';
import handleRequiredAuthentication from '../../../helpers/handleRequiredAuthentication';
import { parseIssueFromResponse } from '../../../helpers/issues';
import { isDatePicker, isInput, isShortcut } from '../../../helpers/keyboardEventHelpers';
import { KeyboardKeys } from '../../../helpers/keycodes';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import {
  addSideBarClass,
  addWhitePageClass,
  removeSideBarClass,
  removeWhitePageClass,
} from '../../../helpers/pages';
import { serializeDate } from '../../../helpers/query';
import { withBranchLikes } from '../../../queries/branch';
import { BranchLike } from '../../../types/branch-like';
import { ComponentQualifier, isPortfolioLike, isProject } from '../../../types/component';
import {
  ASSIGNEE_ME,
  Facet,
  FetchIssuesPromise,
  ReferencedComponent,
  ReferencedLanguage,
  ReferencedRule,
} from '../../../types/issues';
import { SecurityStandard } from '../../../types/security';
import { Component, Dict, Issue, Paging, RawQuery, RuleDetails } from '../../../types/types';
import { CurrentUser, UserBase } from '../../../types/users';
import * as actions from '../actions';
import SubnavigationIssuesList from '../issues-subnavigation/SubnavigationIssuesList';
import { FiltersHeader } from '../sidebar/FiltersHeader';
import { Sidebar } from '../sidebar/Sidebar';
import '../styles.css';
import {
  Query,
  STANDARDS,
  areMyIssuesSelected,
  areQueriesEqual,
  getOpen,
  getOpenIssue,
  parseFacets,
  parseQuery,
  saveMyIssues,
  serializeQuery,
  shouldOpenSonarSourceSecurityFacet,
  shouldOpenStandardsChildFacet,
  shouldOpenStandardsFacet,
} from '../utils';
import BulkChangeModal, { MAX_PAGE_SIZE } from './BulkChangeModal';
import IssueGuide from './IssueGuide';
import IssueReviewHistoryAndComments from './IssueReviewHistoryAndComments';
import IssuesList from './IssuesList';
import IssuesSourceViewer from './IssuesSourceViewer';
import NoIssues from './NoIssues';
import NoMyIssues from './NoMyIssues';
import PageActions from './PageActions';
import StyledHeader, { PSEUDO_SHADOW_HEIGHT } from './StyledHeader';

interface Props extends WithIndexationContextProps {
  branchLike?: BranchLike;
  component?: Component;
  currentUser: CurrentUser;
  isFetchingBranch?: boolean;
  location: Location;
  router: Router;
}
export interface State {
  bulkChangeModal: boolean;
  cannotShowOpenIssue?: boolean;
  checkAll?: boolean;
  checked: string[];
  effortTotal?: number;
  facets: Dict<Facet>;
  issues: Issue[];
  loading: boolean;
  loadingRule: boolean;
  loadingFacets: Dict<boolean>;
  loadingMore: boolean;
  locationsNavigator: boolean;
  myIssues: boolean;
  openFacets: Dict<boolean>;
  showVariantsFilter: boolean;
  openIssue?: Issue;
  openPopup?: { issue: string; name: string };
  openRuleDetails?: RuleDetails;
  paging?: Paging;
  query: Query;
  referencedComponentsById: Dict<ReferencedComponent>;
  referencedComponentsByKey: Dict<ReferencedComponent>;
  referencedLanguages: Dict<ReferencedLanguage>;
  referencedRules: Dict<ReferencedRule>;
  referencedUsers: Dict<UserBase>;
  selected?: string;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
}

const DEFAULT_QUERY = { resolved: 'false' };
const MAX_INITAL_FETCH = 1000;
const VARIANTS_FACET = 'codeVariants';
const ISSUES_PAGE_SIZE = 100;

export class App extends React.PureComponent<Props, State> {
  mounted = false;
  bulkButtonRef: React.RefObject<HTMLButtonElement>;

  constructor(props: Props) {
    super(props);
    const query = parseQuery(props.location.query);
    this.bulkButtonRef = React.createRef();

    this.state = {
      bulkChangeModal: false,
      checked: [],
      facets: {},
      issues: [],
      loading: true,
      loadingFacets: {},
      loadingMore: false,
      loadingRule: false,
      locationsNavigator: false,
      myIssues: areMyIssuesSelected(props.location.query),
      openFacets: {
        owaspTop10: shouldOpenStandardsChildFacet({}, query, SecurityStandard.OWASP_TOP10),
        'owaspTop10-2021': shouldOpenStandardsChildFacet(
          {},
          query,
          SecurityStandard.OWASP_TOP10_2021
        ),
        cleanCodeAttributeCategory: true,
        impactSoftwareQuality: true,
        sonarsourceSecurity: shouldOpenSonarSourceSecurityFacet({}, query),
        standards: shouldOpenStandardsFacet({}, query),
      },
      query,
      referencedComponentsById: {},
      referencedComponentsByKey: {},
      referencedLanguages: {},
      referencedRules: {},
      referencedUsers: {},
      selected: getOpen(props.location.query),
      showVariantsFilter: false,
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const {
      location: { query },
    } = props;

    return {
      myIssues: areMyIssuesSelected(query),
      openIssue: getOpenIssue(props, state.issues),
      query: parseQuery(query),
    };
  }

  componentDidMount() {
    this.mounted = true;

    if (this.state.myIssues && !this.props.currentUser.isLoggedIn) {
      handleRequiredAuthentication();
      return;
    }

    addWhitePageClass();
    addSideBarClass();
    this.attachShortcuts();

    if (!this.props.isFetchingBranch) {
      this.fetchFirstIssues(true).catch(() => undefined);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { query } = this.props.location;
    const { query: prevQuery } = prevProps.location;
    const { openIssue } = this.state;

    if (
      prevProps.component !== this.props.component ||
      !isSameBranchLike(prevProps.branchLike, this.props.branchLike) ||
      !areQueriesEqual(prevQuery, query) ||
      areMyIssuesSelected(prevQuery) !== areMyIssuesSelected(query)
    ) {
      this.fetchFirstIssues(false).catch(() => undefined);
      this.setState({ checkAll: false });
    } else if (openIssue && openIssue.key !== this.state.selected) {
      this.setState({
        locationsNavigator: true,
        selected: openIssue.key,
        selectedFlowIndex: 0,
        selectedLocationIndex: undefined,
      });
    }

    if (this.state.openIssue && this.state.openIssue.key !== prevState.openIssue?.key) {
      this.loadRule().catch(() => undefined);
    }
  }

  componentWillUnmount() {
    this.detachShortcuts();
    this.mounted = false;

    removeWhitePageClass();
    removeSideBarClass();
  }

  attachShortcuts() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  detachShortcuts() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if modal is open
    if (this.state.bulkChangeModal) {
      return;
    }

    if (isInput(event) || isShortcut(event)) {
      return;
    }

    // Ignore if date picker is open (to be removed when upgrading to React 17+)
    if (isDatePicker(event)) {
      return;
    }

    if (event.key === KeyboardKeys.Alt) {
      event.preventDefault();
      this.setState(actions.enableLocationsNavigator);

      return;
    }

    switch (event.key) {
      case KeyboardKeys.DownArrow: {
        event.preventDefault();

        if (event.altKey) {
          this.selectNextLocation();
        } else {
          this.selectNextIssue();
        }

        break;
      }
      case KeyboardKeys.UpArrow: {
        event.preventDefault();

        if (event.altKey) {
          this.selectPreviousLocation();
        } else {
          this.selectPreviousIssue();
        }

        break;
      }
      case KeyboardKeys.LeftArrow: {
        event.preventDefault();

        if (event.altKey) {
          this.selectPreviousFlow();
        } else {
          this.closeIssue();
        }

        break;
      }
      case KeyboardKeys.RightArrow: {
        event.preventDefault();

        if (event.altKey) {
          this.selectNextFlow();
        } else {
          this.openSelectedIssue();
        }

        break;
      }
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === KeyboardKeys.Alt) {
      this.setState(actions.disableLocationsNavigator);
    }
  };

  getSelectedIndex() {
    const { issues = [], selected } = this.state;
    const index = issues.findIndex((issue) => issue.key === selected);

    return index !== -1 ? index : undefined;
  }

  selectNextIssue = () => {
    const { issues } = this.state;
    const selectedIndex = this.getSelectedIndex();

    if (selectedIndex !== undefined && selectedIndex < issues.length - 1) {
      if (this.state.openIssue) {
        this.openIssue(issues[selectedIndex + 1].key);
      } else {
        this.setState({
          selected: issues[selectedIndex + 1].key,
          selectedFlowIndex: undefined,
          selectedLocationIndex: undefined,
        });
      }
    }
  };

  async loadRule() {
    const { openIssue } = this.state;

    if (openIssue === undefined) {
      return;
    }

    this.setState({ loadingRule: true });

    const openRuleDetails = await getRuleDetails({ key: openIssue.rule })
      .then((response) => response.rule)
      .catch(() => undefined);

    if (this.mounted) {
      this.setState({ loadingRule: false, openRuleDetails });
    }
  }

  selectPreviousIssue = () => {
    const { issues } = this.state;
    const selectedIndex = this.getSelectedIndex();

    if (selectedIndex !== undefined && selectedIndex > 0) {
      if (this.state.openIssue) {
        this.openIssue(issues[selectedIndex - 1].key);
      } else {
        this.setState({
          selected: issues[selectedIndex - 1].key,
          selectedFlowIndex: undefined,
          selectedLocationIndex: undefined,
        });
      }
    }
  };

  openIssue = (issueKey: string) => {
    const path = {
      pathname: this.props.location.pathname,
      query: {
        ...serializeQuery(this.state.query),
        ...getBranchLikeQuery(this.props.branchLike),
        id: this.props.component?.key,
        myIssues: this.state.myIssues ? 'true' : undefined,
        open: issueKey,
      },
    };

    if (this.state.openIssue) {
      if (path.query.open && path.query.open === this.state.openIssue.key) {
        this.setState({
          locationsNavigator: false,
          selectedLocationIndex: -1,
        });
      } else {
        this.props.router.replace(path);
      }
    } else {
      this.props.router.push(path);
    }
  };

  selectIssue = (issueKey: string) => {
    this.setState({
      selected: issueKey,
      selectedFlowIndex: undefined,
      selectedLocationIndex: undefined,
    });
  };

  closeIssue = () => {
    if (this.state.query) {
      this.props.router.push({
        pathname: this.props.location.pathname,
        query: {
          ...serializeQuery(this.state.query),
          ...getBranchLikeQuery(this.props.branchLike),
          id: this.props.component?.key,
          myIssues: this.state.myIssues ? 'true' : undefined,
          open: undefined,
        },
      });
    }
  };

  openSelectedIssue = () => {
    const { selected } = this.state;

    if (selected) {
      this.openIssue(selected);
    }
  };

  createdAfterIncludesTime = () => Boolean(this.props.location.query.createdAfter?.includes('T'));

  fetchIssuesHelper = (query: RawQuery) => {
    if (this.props.component?.needIssueSync) {
      return listIssues({
        ...query,
      }).then((response) => {
        const { components, issues, rules } = response;

        const parsedIssues = issues.map((issue) =>
          parseIssueFromResponse(issue, components, undefined, rules)
        );

        return { ...response, issues: parsedIssues } as FetchIssuesPromise;
      });
    }

    return searchIssues({
      ...query,
      additionalFields: '_all',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).then((response) => {
      const parsedIssues = response.issues.map((issue) =>
        parseIssueFromResponse(issue, response.components, response.users, response.rules)
      );

      return { ...response, issues: parsedIssues } as FetchIssuesPromise;
    });
  };

  fetchIssues = (
    additional: RawQuery,
    requestFacets = false,
    firstRequest = false
  ): Promise<FetchIssuesPromise> => {
    const { component } = this.props;
    const { myIssues, openFacets, query } = this.state;

    let facets = requestFacets
      ? Object.keys(openFacets)
          .filter((facet) => facet !== STANDARDS && openFacets[facet])
          .join(',')
      : undefined;

    if (firstRequest && isProject(component?.qualifier)) {
      facets = facets ? `${facets},${VARIANTS_FACET}` : VARIANTS_FACET;
    }

    const parameters: Dict<string | undefined> = component?.needIssueSync
      ? {
          ...getBranchLikeQuery(this.props.branchLike, true),
          project: component?.key,
          ...serializeQuery(query),
          ps: `${ISSUES_PAGE_SIZE}`,
          ...additional,
        }
      : {
          ...getBranchLikeQuery(this.props.branchLike),
          componentKeys: component?.key,
          s: 'FILE_LINE',
          ...serializeQuery(query),
          ps: `${ISSUES_PAGE_SIZE}`,
          facets,
          ...additional,
        };

    if (query.createdAfter !== undefined && this.createdAfterIncludesTime()) {
      parameters.createdAfter = serializeDate(query.createdAfter);
    }

    // only sorting by CREATION_DATE is allowed, so let's sort DESC
    if (query.sort) {
      Object.assign(parameters, { asc: 'false' });
    }

    if (myIssues) {
      Object.assign(parameters, { assignees: ASSIGNEE_ME });
    }

    return this.fetchIssuesHelper(parameters);
  };

  fetchFirstIssues(firstRequest: boolean) {
    const prevQuery = this.props.location.query;
    const openIssueKey = getOpen(this.props.location.query);
    let fetchPromise;

    this.setState({ checked: [], loading: true });

    if (openIssueKey !== undefined) {
      fetchPromise = this.fetchIssuesUntil(1, (pageIssues: Issue[], paging: Paging) => {
        if (
          paging.total <= paging.pageIndex * paging.pageSize ||
          paging.pageIndex * paging.pageSize >= MAX_INITAL_FETCH
        ) {
          return true;
        }

        return pageIssues.some((issue) => issue.key === openIssueKey);
      });
    } else {
      fetchPromise = this.fetchIssues({}, true, firstRequest);
    }

    return fetchPromise.then(this.parseFirstIssues(firstRequest, openIssueKey, prevQuery), () => {
      if (this.mounted && areQueriesEqual(prevQuery, this.props.location.query)) {
        this.setState({ loading: false });
      }

      return [];
    });
  }

  parseFirstIssues =
    (firstRequest: boolean, openIssueKey: string | undefined, prevQuery: RawQuery) =>
    ({ effortTotal, facets, issues, paging, ...other }: FetchIssuesPromise) => {
      if (this.mounted && areQueriesEqual(prevQuery, this.props.location.query)) {
        const openIssue = getOpenIssue(this.props, issues);
        let selected: string | undefined = undefined;

        if (issues.length > 0) {
          selected = openIssue ? openIssue.key : issues[0].key;
        }

        this.setState(({ showVariantsFilter }) => ({
          cannotShowOpenIssue: Boolean(openIssueKey) && !openIssue,
          effortTotal,
          facets: parseFacets(facets),
          issues,
          loading: false,
          locationsNavigator: true,
          openIssue,
          paging,
          referencedComponentsById: keyBy(other.components, 'uuid'),
          referencedComponentsByKey: keyBy(other.components, 'key'),
          referencedLanguages: keyBy(other.languages, 'key'),
          referencedRules: keyBy(other.rules, 'key'),
          referencedUsers: keyBy(other.users, 'login'),
          selected,
          selectedFlowIndex: 0,
          selectedLocationIndex: undefined,
          showVariantsFilter: firstRequest
            ? Boolean(facets?.find((f) => f.property === VARIANTS_FACET)?.values.length)
            : showVariantsFilter,
        }));
      }

      return issues;
    };

  fetchIssuesPage = (p: number) => {
    return this.fetchIssues({ p });
  };

  fetchIssuesUntil = (
    page: number,
    done: (pageIssues: Issue[], paging: Paging) => boolean
  ): Promise<FetchIssuesPromise> => {
    const recursiveFetch = (p: number, prevIssues: Issue[]): Promise<FetchIssuesPromise> => {
      return this.fetchIssuesPage(p).then(({ issues: pageIssues, paging, ...other }) => {
        const issues = [...prevIssues, ...pageIssues];

        // eslint-disable-next-line promise/no-callback-in-promise
        return done(pageIssues, paging)
          ? { issues, paging, ...other }
          : recursiveFetch(p + 1, issues);
      });
    };

    return recursiveFetch(page, []);
  };

  fetchMoreIssues = () => {
    const { paging } = this.state;

    if (!paging) {
      return Promise.reject();
    }

    const p = paging.pageIndex + 1;

    this.setState({ checkAll: false, loadingMore: true });

    return this.fetchIssuesPage(p).then(
      (response) => {
        if (this.mounted) {
          this.setState((state) => ({
            issues: [...state.issues, ...response.issues],
            loadingMore: false,
            paging: response.paging,
          }));
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loadingMore: false });
        }
      }
    );
  };

  fetchFacet = (facet: string) => {
    return this.fetchIssues({ ps: 1, facets: facet }, false).then(
      ({ facets, ...other }) => {
        if (this.mounted) {
          this.setState((state) => ({
            facets: { ...state.facets, ...parseFacets(facets) },
            loadingFacets: omit(state.loadingFacets, facet),
            referencedComponentsById: {
              ...state.referencedComponentsById,
              ...keyBy(other.components, 'uuid'),
            },
            referencedComponentsByKey: {
              ...state.referencedComponentsByKey,
              ...keyBy(other.components, 'key'),
            },
            referencedLanguages: {
              ...state.referencedLanguages,
              ...keyBy(other.languages, 'key'),
            },
            referencedRules: { ...state.referencedRules, ...keyBy(other.rules, 'key') },
            referencedUsers: { ...state.referencedUsers, ...keyBy(other.users, 'login') },
          }));
        }
      },
      () => {
        /* Do nothing */
      }
    );
  };

  isFiltered = () => {
    const serialized = serializeQuery(this.state.query);

    return !areQueriesEqual(serialized, DEFAULT_QUERY);
  };

  getCheckedIssues = () => {
    const issues = this.state.checked
      .map((checked) => this.state.issues.find((issue) => issue.key === checked))
      .filter((issue): issue is Issue => issue !== undefined);

    const paging = { pageIndex: 1, pageSize: issues.length, total: issues.length };

    return Promise.resolve({ issues, paging });
  };

  getButtonLabel = (checked: string[], checkAll = false, paging?: Paging) => {
    if (checked.length === 0) {
      return translate('bulk_change');
    }

    let count;

    if (checkAll && paging && !this.props.component?.needIssueSync) {
      count = paging.total > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : paging.total;
    } else {
      count = Math.min(checked.length, MAX_PAGE_SIZE);
    }

    return translateWithParameters('issues.bulk_change_X_issues', count);
  };

  handleFilterChange = (changes: Partial<Query>) => {
    this.props.router.push({
      pathname: this.props.location.pathname,
      query: {
        ...serializeQuery({ ...this.state.query, ...changes }),
        ...getBranchLikeQuery(this.props.branchLike),
        id: this.props.component?.key,
        myIssues: this.state.myIssues ? 'true' : undefined,
      },
    });

    this.setState(({ openFacets }) => ({
      openFacets: {
        ...openFacets,
        sonarsourceSecurity: shouldOpenSonarSourceSecurityFacet(openFacets, changes),
        standards: shouldOpenStandardsFacet(openFacets, changes),
      },
    }));
  };

  handleMyIssuesChange = (myIssues: boolean) => {
    this.closeFacet('assignees');

    if (!this.props.component) {
      saveMyIssues(myIssues);
    }

    this.props.router.push({
      pathname: this.props.location.pathname,
      query: {
        ...serializeQuery({ ...this.state.query, assigned: true, assignees: [] }),
        ...getBranchLikeQuery(this.props.branchLike),
        id: this.props.component?.key,
        myIssues: myIssues ? 'true' : undefined,
      },
    });
  };

  loadSearchResultCount = (property: string, changes: Partial<Query>) => {
    const { component } = this.props;
    const { myIssues, query } = this.state;

    const parameters = {
      ...getBranchLikeQuery(this.props.branchLike),
      componentKeys: component?.key,
      facets: property,
      s: 'FILE_LINE',
      ...serializeQuery({ ...query, ...changes }),
      ps: 1,
    };

    if (myIssues) {
      Object.assign(parameters, { assignees: ASSIGNEE_ME });
    }

    return this.fetchIssuesHelper(parameters).then(({ facets }) => parseFacets(facets)[property]);
  };

  closeFacet = (property: string) => {
    this.setState((state) => ({
      openFacets: { ...state.openFacets, [property]: false },
    }));
  };

  handleFacetToggle = (property: string) => {
    this.setState((state) => {
      const willOpenProperty = !state.openFacets[property];

      const newState = {
        loadingFacets: state.loadingFacets,
        openFacets: { ...state.openFacets, [property]: willOpenProperty },
      };

      // Try to open sonarsource security "subfacet" by default if the standard facet is open
      if (willOpenProperty && property === STANDARDS) {
        newState.openFacets.sonarsourceSecurity = shouldOpenSonarSourceSecurityFacet(
          newState.openFacets,
          state.query
        );

        // Force loading of sonarsource security facet data
        property = newState.openFacets.sonarsourceSecurity ? 'sonarsourceSecurity' : property;
      }

      // No need to load facets data for standard facet
      if (property !== STANDARDS && !state.facets[property]) {
        newState.loadingFacets[property] = true;

        this.fetchFacet(property).catch(() => undefined);
      }

      return newState;
    });
  };

  handleReset = () => {
    this.props.router.push({
      pathname: this.props.location.pathname,
      query: {
        ...DEFAULT_QUERY,
        ...getBranchLikeQuery(this.props.branchLike),
        id: this.props.component?.key,
        myIssues: this.state.myIssues ? 'true' : undefined,
      },
    });
  };

  handlePopupToggle = (issue: string, popupName: string, open: boolean | undefined = undefined) => {
    this.setState((state: State) => {
      const { openPopup } = state;
      const samePopup = openPopup && openPopup.name === popupName && openPopup.issue === issue;

      if (open !== false && !samePopup) {
        return { ...state, openPopup: { issue, name: popupName } };
      } else if (open !== true && samePopup) {
        return { ...state, openPopup: undefined };
      }

      return state;
    });
  };

  handleIssueCheck = (issue: string) => {
    this.setState((state) => ({
      checkAll: false,
      checked: state.checked.includes(issue)
        ? without(state.checked, issue)
        : [...state.checked, issue],
    }));
  };

  handleIssueChange = (issue: Issue) => {
    this.setState((state) => ({
      issues: state.issues.map((candidate) => (candidate.key === issue.key ? issue : candidate)),
    }));
  };

  handleOpenBulkChange = () => {
    this.setState({ bulkChangeModal: true });
  };

  handleCloseBulkChange = () => {
    this.setState({ bulkChangeModal: false }, () => {
      if (this.bulkButtonRef.current) {
        this.bulkButtonRef.current.focus();
      }
    });
  };

  handleBulkChangeDone = () => {
    this.setState({ checkAll: false });
    this.fetchFirstIssues(false).catch(() => undefined);
    this.handleCloseBulkChange();
  };

  selectLocation = (index: number) => {
    const { selectedLocationIndex } = this.state;

    if (index === selectedLocationIndex) {
      this.setState({ selectedLocationIndex: undefined }, () => {
        this.setState({ selectedLocationIndex: index });
      });
    } else {
      this.setState(({ openIssue }) => {
        if (openIssue) {
          return { locationsNavigator: true, selectedLocationIndex: index };
        }

        return null;
      });
    }
  };

  selectNextLocation = () => {
    this.setState(actions.selectNextLocation);
  };

  selectPreviousLocation = () => {
    this.setState(actions.selectPreviousLocation);
  };

  handleCheckAll = (checked: boolean) => {
    if (checked) {
      this.setState((state) => ({
        checkAll: true,
        checked: state.issues.map((issue) => issue.key),
      }));
    } else {
      this.setState({ checkAll: false, checked: [] });
    }
  };

  selectFlow = (index?: number) => {
    this.setState(actions.selectFlow(index));
  };

  selectNextFlow = () => {
    this.setState(actions.selectNextFlow);
  };

  selectPreviousFlow = () => {
    this.setState(actions.selectPreviousFlow);
  };

  renderBulkChange() {
    const { component, currentUser } = this.props;
    const { checkAll, bulkChangeModal, checked, issues, paging } = this.state;

    const isAllChecked = checked.length > 0 && issues.length === checked.length;
    const thirdState = checked.length > 0 && !isAllChecked;
    const isChecked = isAllChecked || thirdState;

    if (!currentUser.isLoggedIn) {
      return null;
    }

    return (
      <div className="pull-left">
        <Checkbox
          checked={isChecked}
          className="spacer-right text-middle"
          disabled={issues.length === 0}
          id="issues-selection"
          onCheck={this.handleCheckAll}
          thirdState={thirdState}
          title={translate('issues.select_all_issues')}
        />

        <ButtonSecondary
          disabled={checked.length === 0}
          id="issues-bulk-change"
          innerRef={this.bulkButtonRef}
          onClick={this.handleOpenBulkChange}
        >
          {this.getButtonLabel(checked, checkAll, paging)}
        </ButtonSecondary>

        {bulkChangeModal && (
          <BulkChangeModal
            fetchIssues={
              checkAll && !component?.needIssueSync ? this.fetchIssues : this.getCheckedIssues
            }
            needIssueSync={component?.needIssueSync}
            onClose={this.handleCloseBulkChange}
            onDone={this.handleBulkChangeDone}
          />
        )}
      </div>
    );
  }

  renderFacets(warning?: React.ReactNode) {
    const { component, currentUser, branchLike } = this.props;
    const {
      facets,
      loadingFacets,
      myIssues,
      openFacets,
      query,
      referencedComponentsById,
      referencedComponentsByKey,
      referencedLanguages,
      referencedRules,
      referencedUsers,
      showVariantsFilter,
    } = this.state;

    return (
      <div
        className={
          'it__layout-page-filters sw-bg-white sw-box-border sw-h-full ' +
          'sw-py-6 sw-pl-3 sw-pr-4 sw-w-[300px] lg:sw-w-[390px]'
        }
      >
        {warning && <div className="sw-pb-6">{warning}</div>}

        {currentUser.isLoggedIn && !component?.needIssueSync && (
          <div className="sw-flex sw-justify-start sw-mb-8">
            <ToggleButton
              onChange={this.handleMyIssuesChange}
              options={[
                { value: true, label: translate('issues.my_issues') },
                { value: false, label: translate('all') },
              ]}
              value={this.state.myIssues}
            />
          </div>
        )}

        <FiltersHeader displayReset={this.isFiltered()} onReset={this.handleReset} />

        <Sidebar
          branchLike={branchLike}
          component={component}
          createdAfterIncludesTime={this.createdAfterIncludesTime()}
          facets={facets}
          loadingFacets={loadingFacets}
          loadSearchResultCount={this.loadSearchResultCount}
          myIssues={myIssues}
          onFacetToggle={this.handleFacetToggle}
          onFilterChange={this.handleFilterChange}
          openFacets={openFacets}
          query={query}
          referencedComponentsById={referencedComponentsById}
          referencedComponentsByKey={referencedComponentsByKey}
          referencedLanguages={referencedLanguages}
          referencedRules={referencedRules}
          referencedUsers={referencedUsers}
          showVariantsFilter={showVariantsFilter}
        />
      </div>
    );
  }

  renderSide(openIssue: Issue | undefined) {
    const { canBrowseAllChildProjects, qualifier = ComponentQualifier.Project } =
      this.props.component ?? {};

    const {
      issues,
      loading,
      loadingMore,
      paging,
      selected,
      selectedFlowIndex,
      selectedLocationIndex,
    } = this.state;

    const warning = !canBrowseAllChildProjects && isPortfolioLike(qualifier) && (
      <FlagMessage
        className="it__portfolio_warning sw-flex"
        title={translate('issues.not_all_issue_show_why')}
        variant="warning"
      >
        {translate('issues.not_all_issue_show')}
      </FlagMessage>
    );

    return (
      <SideBarStyle>
        <ScreenPositionHelper className="sw-z-filterbar">
          {({ top }) => (
            <nav
              aria-label={openIssue ? translate('list_of_issues') : translate('filters')}
              className="it__issues-nav-bar sw-overflow-y-auto issue-filters-list"
              style={{ height: `calc((100vh - ${top}px) - 60px)` }} // 60px (footer)
            >
              <div className="sw-w-[300px] lg:sw-w-[390px]">
                <A11ySkipTarget
                  anchor="issues_sidebar"
                  label={
                    openIssue
                      ? translate('issues.skip_to_list')
                      : translate('issues.skip_to_filters')
                  }
                  weight={10}
                />

                {openIssue ? (
                  <div>
                    {warning && <div className="sw-py-4">{warning}</div>}

                    <SubnavigationIssuesList
                      fetchMoreIssues={this.fetchMoreIssues}
                      issues={issues}
                      loading={loading}
                      loadingMore={loadingMore}
                      onFlowSelect={this.selectFlow}
                      onIssueSelect={this.openIssue}
                      onLocationSelect={this.selectLocation}
                      paging={paging}
                      selected={selected}
                      selectedFlowIndex={selectedFlowIndex}
                      selectedLocationIndex={selectedLocationIndex}
                    />
                  </div>
                ) : (
                  this.renderFacets(warning)
                )}
              </div>
            </nav>
          )}
        </ScreenPositionHelper>
      </SideBarStyle>
    );
  }

  renderList() {
    const { branchLike, component, currentUser } = this.props;
    const { issues, loading, loadingMore, openIssue, paging } = this.state;
    const selectedIndex = this.getSelectedIndex();
    const selectedIssue = selectedIndex !== undefined ? issues[selectedIndex] : undefined;

    if (!paging || openIssue) {
      return null;
    }

    let noIssuesMessage = null;

    if (issues.length === 0 && !loading) {
      if (this.isFiltered()) {
        noIssuesMessage = <EmptySearch />;
      } else if (this.state.myIssues) {
        noIssuesMessage = <NoMyIssues />;
      } else {
        noIssuesMessage = <NoIssues />;
      }
    }

    return (
      <div>
        <h2 className="a11y-hidden">{translate('list_of_issues')}</h2>

        {issues.length > 0 && (
          <IssuesList
            branchLike={branchLike}
            checked={this.state.checked}
            component={component}
            issues={issues}
            onFilterChange={this.handleFilterChange}
            onIssueChange={this.handleIssueChange}
            onIssueCheck={currentUser.isLoggedIn ? this.handleIssueCheck : undefined}
            onIssueClick={this.openIssue}
            onIssueSelect={this.selectIssue}
            onPopupToggle={this.handlePopupToggle}
            openPopup={this.state.openPopup}
            selectedIssue={selectedIssue}
          />
        )}

        {issues.length > 0 && (
          <ListFooter
            count={issues.length}
            loadMore={() => {
              this.fetchMoreIssues().catch(() => undefined);
            }}
            loading={loadingMore}
            pageSize={ISSUES_PAGE_SIZE}
            total={paging.total}
            useMIUIButtons
          />
        )}

        {noIssuesMessage}
      </div>
    );
  }

  renderHeader({
    openIssue,
    paging,
    selectedIndex,
  }: {
    openIssue: Issue | undefined;
    paging: Paging | undefined;
    selectedIndex: number | undefined;
  }) {
    return openIssue ? (
      <A11ySkipTarget anchor="issues_main" />
    ) : (
      <>
        <A11ySkipTarget anchor="issues_main" />
        <StyledHeader headerHeight={84}>
          <div className="sw-p-6 sw-flex sw-w-full sw-items-center sw-justify-between">
            {this.renderBulkChange()}

            <PageActions
              canSetHome={!this.props.component}
              effortTotal={this.state.effortTotal}
              paging={this.props.component?.needIssueSync ? undefined : paging}
              selectedIndex={selectedIndex}
            />
          </div>
        </StyledHeader>
      </>
    );
  }

  renderPage() {
    const {
      cannotShowOpenIssue,
      openRuleDetails,
      checkAll,
      issues,
      loading,
      openIssue,
      paging,
      loadingRule,
    } = this.state;

    const selectedIndex = this.getSelectedIndex();

    return (
      <ScreenPositionHelper>
        {({ top }) => (
          <div
            className={classNames('it__layout-page-main-inner sw-pt-0', {
              'sw-overflow-y-auto': !(openIssue && openRuleDetails),
            })}
            style={{ height: `calc((100vh - ${top + LAYOUT_FOOTER_HEIGHT}px)` }}
          >
            {this.renderHeader({ openIssue, paging, selectedIndex })}

            <Spinner loading={loadingRule}>
              {/* eslint-disable-next-line local-rules/no-conditional-rendering-of-deferredspinner */}
              {openIssue && openRuleDetails ? (
                <IssueTabViewer
                  activityTabContent={
                    <IssueReviewHistoryAndComments
                      issue={openIssue}
                      onChange={this.handleIssueChange}
                    />
                  }
                  codeTabContent={
                    <IssuesSourceViewer
                      branchLike={fillBranchLike(openIssue.branch, openIssue.pullRequest)}
                      issues={issues}
                      locationsNavigator={this.state.locationsNavigator}
                      onIssueSelect={this.openIssue}
                      onLocationSelect={this.selectLocation}
                      openIssue={openIssue}
                      selectedFlowIndex={this.state.selectedFlowIndex}
                      selectedLocationIndex={this.state.selectedLocationIndex}
                    />
                  }
                  extendedDescription={openRuleDetails.htmlNote}
                  issue={openIssue}
                  onIssueChange={this.handleIssueChange}
                  ruleDescriptionContextKey={openIssue.ruleDescriptionContextKey}
                  ruleDetails={openRuleDetails}
                  selectedFlowIndex={this.state.selectedFlowIndex}
                  selectedLocationIndex={this.state.selectedLocationIndex}
                />
              ) : (
                <div
                  className="sw-px-6 sw-pb-6"
                  style={{ marginTop: `-${PSEUDO_SHADOW_HEIGHT}px` }}
                >
                  <Spinner
                    ariaLabel={translate('issues.loading_issues')}
                    className="sw-mt-4"
                    loading={loading}
                  >
                    {checkAll && paging && paging.total > MAX_PAGE_SIZE && (
                      <div className="sw-mt-3">
                        <FlagMessage variant="warning">
                          <span>
                            <FormattedMessage
                              defaultMessage={translate('issue_bulk_change.max_issues_reached')}
                              id="issue_bulk_change.max_issues_reached"
                              values={{ max: <strong>{MAX_PAGE_SIZE}</strong> }}
                            />
                          </span>
                        </FlagMessage>
                      </div>
                    )}

                    {cannotShowOpenIssue && (!paging || paging.total > 0) && (
                      <FlagMessage className="sw-mb-4" variant="warning">
                        {translateWithParameters(
                          'issues.cannot_open_issue_max_initial_X_fetched',
                          MAX_INITAL_FETCH
                        )}
                      </FlagMessage>
                    )}

                    {this.renderList()}
                  </Spinner>
                </div>
              )}
            </Spinner>
          </div>
        )}
      </ScreenPositionHelper>
    );
  }

  render() {
    const { openIssue, issues } = this.state;
    const { component, location } = this.props;
    const open = getOpen(location.query);

    return (
      <PageWrapperStyle id="issues-page">
        <LargeCenteredLayout>
          <PageContentFontWrapper className="sw-body-sm">
            <div className="sw-w-full sw-flex" id="issues-page">
              <Suggestions suggestions="issues" />
              <IssueGuide run={!open && !component?.needIssueSync && issues.length > 0} />

              {openIssue ? (
                <Helmet
                  defer={false}
                  title={openIssue.message}
                  titleTemplate={translateWithParameters(
                    'page_title.template.with_category',
                    translate('issues.page')
                  )}
                />
              ) : (
                <Helmet defer={false} title={translate('issues.page')} />
              )}

              <h1 className="a11y-hidden">{translate('issues.page')}</h1>

              {this.renderSide(openIssue)}

              <MainContentStyle className="sw-relative sw-ml-12 sw-flex-1">
                {this.renderPage()}
              </MainContentStyle>
            </div>
          </PageContentFontWrapper>
        </LargeCenteredLayout>
      </PageWrapperStyle>
    );
  }
}

export default withRouter(
  withComponentContext(
    withCurrentUserContext(
      withBranchLikes(
        withIndexationContext(
          withIndexationGuard<Props & WithIndexationContextProps>({
            Component: App,
            showIndexationMessage: ({
              component,
              indexationContext: {
                status: { completedCount, hasFailures, isCompleted, total },
              },
            }) =>
              (!component &&
                (isCompleted === false || hasFailures === true || completedCount !== total)) ||
              (component?.qualifier !== ComponentQualifier.Project &&
                component?.needIssueSync === true),
          })
        )
      )
    )
  )
);

const PageWrapperStyle = styled.div`
  background-color: ${themeColor('backgroundPrimary')};
`;

const MainContentStyle = styled.main`
  background-color: ${themeColor('subnavigation')};
  border-left: ${themeBorder('default', 'filterbarBorder')};
  border-right: ${themeBorder('default', 'filterbarBorder')};
`;

const SideBarStyle = styled.div`
  border-left: ${themeBorder('default', 'filterbarBorder')};
  border-right: ${themeBorder('default', 'filterbarBorder')};
  background-color: ${themeColor('backgroundSecondary')};
`;
