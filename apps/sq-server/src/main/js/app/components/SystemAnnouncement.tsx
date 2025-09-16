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
import { Banner, cssVar } from '@sonarsource/echoes-react';
import { keyBy, throttle } from 'lodash';
import * as React from 'react';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
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
      keys: [
        GlobalSettingKeys.DisplayAnnouncementMessage,
        GlobalSettingKeys.AnnouncementMessage,
        GlobalSettingKeys.AnnouncementHTMLMessage,
      ],
    });

    const settings = keyBy(values, 'key');

    this.setState({
      displayMessage: settings?.[GlobalSettingKeys.DisplayAnnouncementMessage]?.value === 'true',
      // Use the HTML if it exists, otherwise the plain text message
      message:
        settings?.[GlobalSettingKeys.AnnouncementHTMLMessage]?.value ??
        settings?.[GlobalSettingKeys.AnnouncementMessage]?.value ??
        '',
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
        <StyledBannerWithMarkdown aria-live="assertive" disableFollowScroll variety="warning">
          <SafeHTMLInjection htmlAsString={message} sanitizeLevel={SanitizeLevel.USER_INPUT} />
        </StyledBannerWithMarkdown>
      </div>
    );
  }
}

/**
 * This style is copied from Echoes' Link
 * This should be replaced with a proper HTMLFormatter from Echoes, once
 * it exists!
 */
const StyledBannerWithMarkdown = styled(Banner)`
  & a {
    color: ${cssVar('color-text-default')};

    font: inherit;
    font-weight: ${cssVar('font-weight-semi-bold')};
    text-decoration-line: ${cssVar('text-decoration-underline')};
    text-decoration-color: var(--color);
    text-decoration-style: solid;
    text-decoration-skip-ink: auto;
    text-decoration-thickness: auto;
  }

  & a:visited {
    color: ${cssVar('color-text-default')};
  }

  & a:is(:hover, :focus, :active) {
    color: ${cssVar('color-text-link-hover')};
    text-decoration-color: ${cssVar('color-text-link-hover')};
    outline: none;
  }

  & a:focus-visible {
    outline: ${cssVar('color-focus-default')} solid ${cssVar('focus-border-width-default')};
    outline-offset: ${cssVar('focus-border-offset-default')};
    border-radius: ${cssVar('border-radius-200')};
  }
`;

export default withAvailableFeatures(SystemAnnouncement);
