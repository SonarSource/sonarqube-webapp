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

import { FormattedMessage } from 'react-intl';
import { FlagMessage, Link } from '~design-system';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { getRulesUrl } from '~sq-server-shared/helpers/urls';
import HelpTooltip from '~sq-server-shared/sonar-aligned/components/controls/HelpTooltip';

interface Props {
  language: string;
  profile: string;
  sonarWayMissingRules: number;
  sonarway: string;
}

export default function ProfileRulesSonarWayComparison(props: Props) {
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
                aria-label={translateWithParameters(
                  'quality_profiles.sonarway_see_x_missing_rules',
                  props.sonarWayMissingRules,
                )}
                to={url}
              >
                {props.sonarWayMissingRules}
              </Link>
            ),
          }}
        />
        <HelpTooltip
          className="sw-ml-2"
          overlay={translate('quality_profiles.sonarway_missing_rules_description')}
        />
      </div>
    </FlagMessage>
  );
}
