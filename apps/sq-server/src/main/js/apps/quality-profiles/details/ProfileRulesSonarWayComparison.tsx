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

import { Link, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FlagMessage } from '~design-system';
import { getRulesUrl } from '~sq-server-commons/helpers/urls';

interface Props {
  language: string;
  profile: string;
  sonarWayMissingRules: number;
  sonarway: string;
}

export default function ProfileRulesSonarWayComparison(props: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const url = getRulesUrl({
    qprofile: props.profile,
    activation: 'false',
    compareToProfile: props.sonarway,
    languages: props.language,
  });

  return (
    <FlagMessage variant="warning">
      <div className="sw-flex sw-items-center sw-gap-1">
        <FormattedMessage
          id="quality_profiles.x_sonarway_missing_rules"
          values={{
            count: props.sonarWayMissingRules,
            linkCount: (
              <Link
                aria-label={formatMessage(
                  { id: 'quality_profiles.sonarway_see_x_missing_rules' },
                  { 0: props.sonarWayMissingRules },
                )}
                to={url}
              >
                {props.sonarWayMissingRules}
              </Link>
            ),
          }}
        />

        <ToggleTip
          className="sw-ml-2"
          description={
            <FormattedMessage id="quality_profiles.sonarway_missing_rules_description" />
          }
        />
      </div>
    </FlagMessage>
  );
}
