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

import { Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { ActionCell, Badge, BaseLink, ContentCell, Link, TableRow } from '~design-system';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { addons } from '~sq-server-addons/index';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getRulesUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import BuiltInQualityProfileBadge from '../components/BuiltInQualityProfileBadge';
import ProfileActions from '../components/ProfileActions';
import ProfileLink from '../components/ProfileLink';

export interface ProfilesListRowProps {
  isComparable: boolean;
  profile: Profile;
  updateProfiles: () => Promise<void>;
}

export function ProfilesListRow(props: Readonly<ProfilesListRowProps>) {
  const { profile, isComparable } = props;
  const intl = useIntl();
  const { hasFeature } = useAvailableFeatures();

  const offset = 24 * (profile.depth - 1);
  const activeRulesUrl = getRulesUrl({
    qprofile: profile.key,
    activation: 'true',
  });
  const deprecatedRulesUrl = getRulesUrl({
    qprofile: profile.key,
    activation: 'true',
    statuses: 'DEPRECATED',
  });

  return (
    <TableRow
      className="quality-profiles-table-row"
      data-key={profile.key}
      data-name={profile.name}
    >
      <ContentCell>
        <div className="sw-flex sw-items-center" style={{ paddingLeft: offset }}>
          <ProfileLink language={profile.language} name={profile.name}>
            {profile.name}
          </ProfileLink>
          {profile.isBuiltIn && <BuiltInQualityProfileBadge className="sw-ml-2" />}
          {addons.aica && hasFeature(Feature.AiCodeAssurance) && (
            <addons.aica.ProfileRecommendedForAiIcon className="sw-ml-1" profile={profile} />
          )}
        </div>
      </ContentCell>

      <ContentCell>
        {profile.isDefault ? (
          <Tooltip content={intl.formatMessage({ id: 'quality_profiles.list.default.help' })}>
            <Badge>{intl.formatMessage({ id: 'default' })}</Badge>
          </Tooltip>
        ) : (
          <Text isSubtle>{profile.projectCount}</Text>
        )}
      </ContentCell>

      <ContentCell>
        <div>
          <Link to={activeRulesUrl}>{profile.activeRuleCount}</Link>

          {profile.activeDeprecatedRuleCount > 0 && (
            <span className="sw-ml-2">
              <Tooltip content={intl.formatMessage({ id: 'quality_profiles.deprecated_rules' })}>
                <BaseLink className="sw-border-0" to={deprecatedRulesUrl}>
                  <Badge variant="deleted">{profile.activeDeprecatedRuleCount}</Badge>
                </BaseLink>
              </Tooltip>
            </span>
          )}
        </div>
      </ContentCell>

      <ContentCell>
        <Text isSubtle>
          <DateFromNow date={profile.rulesUpdatedAt} />
        </Text>
      </ContentCell>

      <ContentCell>
        <Text isSubtle>
          <DateFromNow date={profile.lastUsed} />
        </Text>
      </ContentCell>

      <ActionCell>
        <ProfileActions
          isComparable={isComparable}
          profile={profile}
          updateProfiles={props.updateProfiles}
        />
      </ActionCell>
    </TableRow>
  );
}

export default React.memo(ProfilesListRow);
