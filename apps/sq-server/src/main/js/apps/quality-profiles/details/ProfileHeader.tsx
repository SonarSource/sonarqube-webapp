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

import { Breadcrumbs, Link, LinkHighlight, LinkStandalone, Text } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { Badge, PageContentFontWrapper } from '~design-system';
import { useLocation } from '~shared/components/hoc/withRouter';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { AdminPageHeader } from '~sq-server-commons/components/ui/AdminPageHeader';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { Feature } from '~sq-server-commons/types/features';
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
  const { hasFeature } = useAvailableFeatures();
  const isComparePage = location.pathname.endsWith(`/${QualityProfilePath.COMPARE}`);
  const isChangeLogPage = location.pathname.endsWith(`/${QualityProfilePath.CHANGELOG}`);
  const hasAicaFeature = hasFeature(Feature.AiCodeAssurance);
  const showAicaIntro = Boolean(
    hasAicaFeature && addons.aica?.isQualityProfileRecommendedForAI?.(profile),
  );
  const getDocUrl = useDocUrl();

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
        description={
          profile.isBuiltIn && (
            <FormattedMessage
              id={
                showAicaIntro
                  ? 'quality_profiles.built_in.aica_description'
                  : 'quality_profiles.built_in.description'
              }
              values={{
                aica: (text) => <Text>{text}</Text>,
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
          )
        }
        title={
          <span className="sw-inline-flex sw-items-center sw-gap-1">
            <span className="sw-mr-1">{profile.name}</span>
            {profile.isBuiltIn && <BuiltInQualityProfileBadge tooltip={false} />}
            {profile.isDefault && <Badge>{translate('default')}</Badge>}
            {isDefined(addons.aica?.ProfileRecommendedForAiIcon) && hasAicaFeature && (
              <addons.aica.ProfileRecommendedForAiIcon profile={profile} />
            )}
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
