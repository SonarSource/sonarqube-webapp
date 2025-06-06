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

import { Breadcrumbs, LinkStandalone } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { Badge, PageContentFontWrapper } from '~design-system';
import { useLocation } from '~shared/components/hoc/withRouter';
import DateFromNow from '~sq-server-commons/components/intl/DateFromNow';
import { AdminPageHeader } from '~sq-server-commons/components/ui/AdminPageHeader';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import {
  getProfileChangelogPath,
  getProfilesForLanguagePath,
  isProfileComparePath,
} from '~sq-server-commons/utils/quality-profiles-utils';
import BuiltInQualityProfileBadge from '../components/BuiltInQualityProfileBadge';
import ProfileActions from '../components/ProfileActions';
import { QualityProfilePath } from '../routes';

interface Props {
  isComparable: boolean;
  profile: Profile;
  updateProfiles: () => Promise<void>;
}

export default function ProfileHeader(props: Props) {
  const { profile, isComparable, updateProfiles } = props;
  const location = useLocation();
  const isComparePage = location.pathname.endsWith(`/${QualityProfilePath.COMPARE}`);
  const isChangeLogPage = location.pathname.endsWith(`/${QualityProfilePath.CHANGELOG}`);

  return (
    <div className="it__quality-profiles__header">
      {(isComparePage || isChangeLogPage) && (
        <Helmet
          defer={false}
          title={translateWithParameters(
            isChangeLogPage
              ? 'quality_profiles.page_title_changelog_x'
              : 'quality_profiles.page_title_compare_x',
            profile.name,
          )}
        />
      )}

      <Breadcrumbs
        className="sw-mb-6"
        items={[
          { linkElement: translate('quality_profiles.page'), to: PROFILE_PATH },
          { linkElement: profile.languageName, to: getProfilesForLanguagePath(profile.language) },
          { linkElement: profile.name, to: '#' },
        ]}
      />

      <AdminPageHeader
        description={profile.isBuiltIn && translate('quality_profiles.built_in.description')}
        title={
          <span className="sw-inline-flex sw-items-center sw-gap-2">
            {profile.name}
            {profile.isBuiltIn && <BuiltInQualityProfileBadge tooltip={false} />}
            {profile.isDefault && <Badge>{translate('default')}</Badge>}
          </span>
        }
      >
        <div className="sw-flex sw-items-center sw-gap-3 sw-self-start">
          {!isProfileComparePath(location.pathname) && (
            <PageContentFontWrapper className="sw-typo-default sw-flex sw-gap-3">
              <div>
                <strong className="sw-typo-semibold">
                  {translate('quality_profiles.updated_')}
                </strong>{' '}
                <DateFromNow date={profile.rulesUpdatedAt} />
              </div>

              <div>
                <strong className="sw-typo-semibold">{translate('quality_profiles.used_')}</strong>{' '}
                <DateFromNow date={profile.lastUsed} />
              </div>

              {!isChangeLogPage && (
                <div>
                  <LinkStandalone
                    className="it__quality-profiles__changelog"
                    to={getProfileChangelogPath(profile.name, profile.language)}
                  >
                    {translate('see_changelog')}
                  </LinkStandalone>
                </div>
              )}
            </PageContentFontWrapper>
          )}

          <ProfileActions
            isComparable={isComparable}
            profile={profile}
            updateProfiles={updateProfiles}
          />
        </div>
      </AdminPageHeader>
    </div>
  );
}
