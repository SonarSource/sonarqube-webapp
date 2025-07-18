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

import { Banner } from '@sonarsource/echoes-react';
import { keyBy, throttle } from 'lodash';
import * as React from 'react';
import { getValues } from '~sq-server-commons/api/settings';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';

const THROTTLE_TIME_MS = 10000;

interface State {
  displayMessage: boolean;
  message: string;
}

export class SystemAnnouncement extends React.PureComponent<WithAvailableFeaturesProps, State> {
  state: State = { displayMessage: false, message: '' };

  componentDidMount() {
    if (this.props.hasFeature(Feature.Announcement)) {
      this.getSettings();
      window.addEventListener('focus', this.handleVisibilityChange);
    }
  }

  componentWillUnmount() {
    if (this.props.hasFeature(Feature.Announcement)) {
      window.removeEventListener('focus', this.handleVisibilityChange);
    }
  }

  getSettings = async () => {
    const values = await getValues({
      keys: [GlobalSettingKeys.DisplayAnnouncementMessage, GlobalSettingKeys.AnnouncementMessage],
    });

    const settings = keyBy(values, 'key');

    this.setState({
      displayMessage: settings?.[GlobalSettingKeys.DisplayAnnouncementMessage]?.value === 'true',
      message: settings?.[GlobalSettingKeys.AnnouncementMessage]?.value ?? '',
    });
  };

  // eslint-disable-next-line react/sort-comp
  handleVisibilityChange = throttle(() => {
    if (document.visibilityState === 'visible') {
      this.getSettings();
    }
  }, THROTTLE_TIME_MS);

  render() {
    const { displayMessage, message } = this.state;

    return (
      <div style={!(displayMessage && message.length > 0) ? { display: 'none' } : {}}>
        <Banner aria-live="assertive" type="warning">
          {message}
        </Banner>
      </div>
    );
  }
}

export default withAvailableFeatures(SystemAnnouncement);
