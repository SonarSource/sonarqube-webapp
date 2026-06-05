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

import { Link, LinkHighlight, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import {
  QUALITY_PROFILE_SONAR_AGENTIC_AI,
  QUALITY_PROFILE_SONAR_WAY,
} from '~sq-server-commons/helpers/quality-profiles';
import { Profile } from '~sq-server-commons/types/quality-profiles';

export function ProfileDescription({
  profile,
  showAicaIntro,
}: Readonly<{
  profile: Profile;
  showAicaIntro: boolean;
}>) {
  const getDocUrl = useDocUrl();

  if (profile.isBuiltIn && profile.name === QUALITY_PROFILE_SONAR_AGENTIC_AI) {
    return (
      <>
        <Text>
          <FormattedMessage
            id="quality_profiles.built_in.agentic.description"
            values={{ agenticQualityProfileName: QUALITY_PROFILE_SONAR_AGENTIC_AI }}
          />
        </Text>
        {showAicaIntro && (
          <Text>
            <FormattedMessage
              id="quality_profiles.built_in.agentic.description.learn_more"
              values={{
                link: (text) => (
                  <Link
                    enableOpenInNewTab
                    highlight={LinkHighlight.CurrentColor}
                    to={getDocUrl(DocLink.AiCodeAssuranceProfiles)}
                  >
                    {text}
                  </Link>
                ),
              }}
            />
          </Text>
        )}
      </>
    );
  }
  if (profile.isBuiltIn && profile.name === QUALITY_PROFILE_SONAR_WAY) {
    return (
      <>
        <Text>
          <FormattedMessage id="quality_profiles.built_in.description" />
        </Text>
        {showAicaIntro && (
          <Text>
            <FormattedMessage
              id="quality_profiles.built_in.description.learn_more"
              values={{
                link: (text) => (
                  <Link
                    enableOpenInNewTab
                    highlight={LinkHighlight.CurrentColor}
                    to={getDocUrl(DocLink.AiCodeAssuranceProfiles)}
                  >
                    {text}
                  </Link>
                ),
              }}
            />
          </Text>
        )}
      </>
    );
  }

  return null;
}
