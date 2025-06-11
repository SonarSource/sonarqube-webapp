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
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { LargeCenteredLayout, Spinner } from '~design-system';
import {
  Actions,
  getExporters,
  searchQualityProfiles,
} from '~sq-server-commons/api/quality-profiles';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import withLanguages, {
  WithLanguagesProps,
} from '~sq-server-commons/context/languages/withLanguages';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Exporter, Profile } from '~sq-server-commons/types/quality-profiles';
import { sortProfiles } from '~sq-server-commons/utils/quality-profiles-utils';
import { QualityProfilesContextProps } from '../qualityProfilesContext';

interface State {
  actions?: Actions;
  exporters?: Exporter[];
  loading: boolean;
  profiles?: Profile[];
}

export class QualityProfilesApp extends React.PureComponent<WithLanguagesProps, State> {
  mounted = false;
  state: State = { loading: true };

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchProfiles() {
    return searchQualityProfiles();
  }

  loadData() {
    this.setState({ loading: true });
    Promise.all([getExporters(), this.fetchProfiles()]).then(
      ([exporters, profilesResponse]) => {
        if (this.mounted) {
          this.setState({
            actions: profilesResponse.actions,
            exporters,
            profiles: sortProfiles(profilesResponse.profiles),
            loading: false,
          });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      },
    );
  }

  updateProfiles = () => {
    return this.fetchProfiles().then((r) => {
      if (this.mounted) {
        this.setState({ profiles: sortProfiles(r.profiles) });
      }
    });
  };

  renderChild() {
    const { actions, loading, profiles, exporters } = this.state;

    if (loading) {
      return <Spinner />;
    }
    const finalLanguages = Object.values(this.props.languagesWithRules);

    const context: QualityProfilesContextProps = {
      actions: actions ?? {},
      profiles: profiles ?? [],
      languages: finalLanguages,
      exporters: exporters ?? [],
      updateProfiles: this.updateProfiles,
    };

    return <Outlet context={context} />;
  }

  render() {
    return (
      <LargeCenteredLayout className="sw-my-8">
        <Suggestions suggestion={DocLink.InstanceAdminQualityProfiles} />
        <Helmet defer={false} title={translate('quality_profiles.page')} />

        {this.renderChild()}
      </LargeCenteredLayout>
    );
  }
}

export default withLanguages(QualityProfilesApp);
