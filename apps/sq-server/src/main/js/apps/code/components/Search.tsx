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

import { ToggleButtonGroup } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { isEmpty, omit } from 'lodash';
import * as React from 'react';
import { InputSearch, Spinner } from '~design-system';
import { withRouter } from '~shared/components/hoc/withRouter';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { ComponentQualifier } from '~shared/types/component';
import { Location, Router } from '~shared/types/router';
import { getTree } from '~sq-server-commons/api/components';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getIntl } from '~sq-server-commons/helpers/l10nBundle';
import { isPortfolioLike } from '~sq-server-commons/sonar-aligned/helpers/component';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { isView } from '~sq-server-commons/types/component';
import { ComponentMeasure } from '~sq-server-commons/types/types';

enum MEASURES_SCOPE {
  New = 'new',
  Overall = 'overall',
}

interface Props {
  branchLike?: BranchLike;
  className?: string;
  component: ComponentMeasure;
  location: Location;
  newCodeSelected: boolean;
  onNewCodeToggle: (newCode: boolean) => void;
  onSearchClear: () => void;
  onSearchResults: (results?: ComponentMeasure[]) => void;
  router: Router;
}

interface State {
  loading: boolean;
  query: string;
}

class Search extends React.PureComponent<Props, State> {
  intl = getIntl();
  mounted = false;
  state: State = {
    query: '',
    loading: false,
  };

  componentDidMount() {
    this.mounted = true;
    if (this.props.location.query.search) {
      this.handleQueryChange(this.props.location.query.search);
    }
  }

  componentDidUpdate(nextProps: Props) {
    // if the component has change, reset the current state
    if (nextProps.location.query.id !== this.props.location.query.id) {
      this.setState({
        query: '',
        loading: false,
      });
      this.props.onSearchClear();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.nativeEvent.key) {
      case KeyboardKeys.Enter:
      case KeyboardKeys.UpArrow:
      case KeyboardKeys.DownArrow:
        event.preventDefault();
        event.currentTarget.blur();
        break;
    }
  };

  handleSearch = (query: string) => {
    if (this.mounted) {
      const { branchLike, component, router, location } = this.props;
      this.setState({ loading: true });

      if (query !== location.query.search) {
        router.replace({
          pathname: location.pathname,
          query: { ...location.query, search: query },
        });
      }

      const qualifiers = isView(component.qualifier)
        ? [ComponentQualifier.SubPortfolio, ComponentQualifier.Project].join(',')
        : [ComponentQualifier.TestFile, ComponentQualifier.File].join(',');

      getTree({
        component: component.key,
        q: query,
        s: 'qualifier,name',
        qualifiers,
        ...getBranchLikeQuery(branchLike),
      })
        .then((r) => {
          if (this.mounted) {
            this.setState({
              loading: false,
            });
            this.props.onSearchResults(r.components);
          }
        })
        .catch(() => {
          if (this.mounted) {
            this.setState({ loading: false });
          }
        });
    }
  };

  handleQueryChange = (query: string) => {
    const { router, location } = this.props;
    this.setState({ query });
    if (query.length === 0) {
      router.replace({ pathname: location.pathname, query: omit(location.query, 'search') });
      this.props.onSearchClear();
    } else {
      this.handleSearch(query);
    }
  };

  handleNewCodeToggle = (selection: MEASURES_SCOPE) => {
    this.props.onNewCodeToggle(selection === MEASURES_SCOPE.New);
  };

  render() {
    const { className, component, newCodeSelected } = this.props;
    const { loading, query } = this.state;
    const isPortfolio = isPortfolioLike(component.qualifier);

    const searchPlaceholder = getSearchPlaceholderLabel(component.qualifier as ComponentQualifier);

    return (
      <div className={classNames('sw-flex sw-items-center sw-gap-4', className)} id="code-search">
        {isPortfolio && (
          <ToggleButtonGroup
            isDisabled={!isEmpty(query)}
            onChange={this.handleNewCodeToggle}
            options={[
              {
                value: MEASURES_SCOPE.New,
                label: this.intl.formatMessage({ id: 'projects.view.new_code' }),
              },
              {
                value: MEASURES_SCOPE.Overall,
                label: this.intl.formatMessage({ id: 'projects.view.overall_code' }),
              },
            ]}
            selected={newCodeSelected ? MEASURES_SCOPE.New : MEASURES_SCOPE.Overall}
          />
        )}
        <InputSearch
          minLength={3}
          onChange={this.handleQueryChange}
          onKeyDown={this.handleKeyDown}
          placeholder={searchPlaceholder}
          searchInputAriaLabel={searchPlaceholder}
          size="large"
          value={this.state.query}
        />
        <Spinner className="sw-ml-2" loading={loading} />
      </div>
    );
  }
}

export default withRouter(Search);

function getSearchPlaceholderLabel(qualifier: ComponentQualifier) {
  switch (qualifier) {
    case ComponentQualifier.Portfolio:
    case ComponentQualifier.SubPortfolio:
      return translate('code.search_placeholder.portfolio');

    case ComponentQualifier.Application:
      return translate('code.search_placeholder.application');

    default:
      return translate('code.search_placeholder');
  }
}
