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

import { Link, Select } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getQualityProfileUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';

type ProfileSelectProps = { profiles: BaseProfile[] } & Omit<Parameters<typeof Select>[0], 'data'>;

export default function ProfileSelect({ profiles, ...rest }: Readonly<ProfileSelectProps>) {
  const { hasFeature } = useAvailableFeatures();

  const ProfileRecommendedForAiIcon = addons.aica?.ProfileRecommendedForAiIcon || (() => null);

  const profileOptions = profiles.map((p) => ({
    value: p.key,
    label: p.name,
    disabled: p.activeRuleCount === 0,
    prefix: hasFeature(Feature.AiCodeAssurance) && <ProfileRecommendedForAiIcon profile={p} />,
    suffix:
      p.activeRuleCount === 0 ? (
        <>
          <FormattedMessage id="project_quality_profile.add_language_modal.no_active_rules" />
          <Link to={getQualityProfileUrl(p.name, p.language)}>
            <FormattedMessage id="project_quality_profile.add_language_modal.go_to_profile" />
          </Link>
        </>
      ) : null,
  }));

  const selectedProfile = profiles.find((p) => p.key === rest.value);

  return (
    <Select
      {...(rest as Parameters<typeof Select>[0])} // Somehow Omit<> breaks the type inference
      data={profileOptions}
      valueIcon={
        selectedProfile &&
        hasFeature(Feature.AiCodeAssurance) && (
          <ProfileRecommendedForAiIcon profile={selectedProfile} />
        )
      }
    />
  );
}
