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

import { Spinner } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { useProfilesCompareQuery } from '~sq-server-commons/queries/quality-profiles';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { getProfileComparePath } from '~sq-server-commons/utils/quality-profiles-utils';
import { ProfilePageTemplate } from '../details/ProfilePageTemplate';
import { withQualityProfilesContext } from '../qualityProfilesContext';
import ComparisonForm from './ComparisonForm';
import ComparisonResults from './ComparisonResults';

interface Props {
  profile: Profile;
  profiles: Profile[];
}

export function ComparisonContainer(props: Readonly<Props>) {
  const { profile, profiles } = props;
  const location = useLocation();
  const router = useRouter();

  const { formatMessage } = useIntl();

  const { data: inheritRulesSetting } = useGetValueQuery({
    key: SettingsKey.QPAdminCanDisableInheritedRules,
  });
  const canDeactivateInheritedRules = inheritRulesSetting?.value === 'true';

  const { withKey } = location.query;
  const {
    data: compareResults,
    isLoading,
    refetch,
  } = useProfilesCompareQuery(profile.key, withKey);

  const handleCompare = (withKey: string) => {
    const path = getProfileComparePath(profile.name, profile.language, withKey);
    router.push(path);
  };

  const refresh = async () => {
    await refetch();
  };

  return (
    <ProfilePageTemplate
      additionalBreadcrumbs={[{ linkElement: <FormattedMessage id="compare" /> }]}
      helmetTitle={formatMessage(
        { id: 'quality_profiles.page_title_compare_x' },
        { profile: profile.name },
      )}
      hideMetadata
    >
      <div className="sw-flex sw-items-center">
        <ComparisonForm
          onCompare={handleCompare}
          profile={profile}
          profiles={profiles}
          withKey={withKey}
        />

        <Spinner className="sw-ml-2" isLoading={isLoading} />
      </div>

      {compareResults && (
        <ComparisonResults
          canDeactivateInheritedRules={canDeactivateInheritedRules}
          inLeft={compareResults.inLeft}
          inRight={compareResults.inRight}
          left={compareResults.left}
          leftProfile={profile}
          modified={compareResults.modified}
          refresh={refresh}
          right={compareResults.right}
          rightProfile={profiles.find((p) => p.key === withKey)}
        />
      )}
    </ProfilePageTemplate>
  );
}

export default withQualityProfilesContext(ComparisonContainer);
