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

import { Heading, LinkStandalone, Tooltip } from '@sonarsource/echoes-react';
import React, { useContext, useEffect } from 'react';
import { Badge } from '~design-system';
import { ComponentQualityProfile } from '~shared/types/component';
import { searchRules } from '~sq-server-commons/api/rules';
import { LanguagesContext } from '~sq-server-commons/context/languages/LanguagesContext';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { getQualityProfileUrl } from '~sq-server-commons/helpers/urls';
import { Languages } from '~sq-server-commons/types/languages';

interface Props {
  profiles: ComponentQualityProfile[];
}

export function MetaQualityProfiles({ profiles }: Readonly<Props>) {
  const [deprecatedByKey, setDeprecatedByKey] = React.useState<Record<string, number>>({});
  const languages = useContext(LanguagesContext);

  useEffect(() => {
    const existingProfiles = profiles.filter((p) => !p.deleted);
    const requests = existingProfiles.map((profile) => {
      const data = {
        activation: 'true',
        ps: 1,
        qprofile: profile.key,
        statuses: 'DEPRECATED',
      };
      return searchRules(data).then((r) => r.paging.total);
    });
    Promise.all(requests).then(
      (responses) => {
        const deprecatedByKey: Record<string, number> = {};
        responses.forEach((count, i) => {
          const profileKey = existingProfiles[i].key;
          deprecatedByKey[profileKey] = count;
        });
        setDeprecatedByKey(deprecatedByKey);
      },
      () => {},
    );
  }, [profiles]);

  return (
    <section>
      <Heading as="h3">{translate('overview.quality_profiles')}</Heading>
      <ul className="sw-mt-2 sw-flex sw-flex-col sw-gap-3">
        {profiles.map((profile) => (
          <ProfileItem
            deprecatedByKey={deprecatedByKey}
            key={profile.key}
            languages={languages}
            profile={profile}
          />
        ))}
      </ul>
    </section>
  );
}

function ProfileItem({
  profile,
  languages,
  deprecatedByKey,
}: Readonly<{
  deprecatedByKey: Record<string, number>;
  languages: Languages;
  profile: ComponentQualityProfile;
}>) {
  const languageFromStore = languages[profile.language];
  const languageName = languageFromStore ? languageFromStore.name : profile.language;
  const count = deprecatedByKey[profile.key] || 0;

  return (
    <li className="sw-grid sw-grid-cols-[1fr_3fr]">
      <span>{languageName}</span>
      <div>
        {profile.deleted ? (
          <Tooltip
            content={translateWithParameters('overview.deleted_profile', profile.name)}
            key={profile.key}
          >
            <div className="project-info-deleted-profile">{profile.name}</div>
          </Tooltip>
        ) : (
          <>
            <LinkStandalone
              aria-label={translateWithParameters(
                'overview.link_to_x_profile_y',
                languageName,
                profile.name,
              )}
              to={getQualityProfileUrl(profile.name, profile.language)}
            >
              {profile.name}
            </LinkStandalone>
            {count > 0 && (
              <Tooltip
                content={translateWithParameters('overview.deprecated_profile', count)}
                key={profile.key}
              >
                <span>
                  <Badge className="sw-ml-6" variant="deleted">
                    {translate('deprecated')}
                  </Badge>
                </span>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export default MetaQualityProfiles;
