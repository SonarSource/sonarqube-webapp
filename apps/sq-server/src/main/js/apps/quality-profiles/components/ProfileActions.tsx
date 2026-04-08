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

import {
  ButtonIcon,
  DropdownMenu,
  IconMoreVertical,
  Tooltip,
  TooltipSide,
} from '@sonarsource/echoes-react';
import { some } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { getProfilePath, getRulesUrl } from '~sq-server-commons/helpers/urls';
import {
  useCopyProfileMutation,
  useDeleteProfileMutation,
  useExtendProfileMutation,
  useRenameProfileMutation,
  useSetDefaultProfileMutation,
} from '~sq-server-commons/queries/quality-profiles';
import { Profile, ProfileActionModals } from '~sq-server-commons/types/quality-profiles';
import { getProfileComparePath } from '~sq-server-commons/utils/quality-profiles-utils';
import DeleteProfileForm from './DeleteProfileForm';
import ProfileModalForm from './ProfileModalForm';

interface Props {
  fromList?: boolean;
  isComparable: boolean;
  profile: Profile;
}

export function ProfileActions({ fromList, isComparable, profile }: Readonly<Props>) {
  const router = useRouter();
  const {
    query: { language },
  } = useLocation();

  const { isPending: isCopyPending, mutate: copyProfile } = useCopyProfileMutation();
  const { isPending: isExtendPending, mutate: extendProfile } = useExtendProfileMutation();
  const { isPending: isRenamePending, mutate: renameProfile } = useRenameProfileMutation();
  const { isPending: isDeletePending, mutate: deleteProfile } = useDeleteProfileMutation();
  const { isPending: isSetDefaultPending, mutate: setDefaultProfile } =
    useSetDefaultProfileMutation();

  const loading =
    isCopyPending || isExtendPending || isRenamePending || isDeletePending || isSetDefaultPending;

  const navigateToProfile = (name: string, language: string) => {
    router.push(getProfilePath(name, language));
  };

  const handleProfileCopy = (name: string) => {
    copyProfile(
      { fromKey: profile.key, toName: name },
      {
        onSuccess: () => {
          navigateToProfile(name, profile.language);
        },
      },
    );
  };

  const handleProfileExtend = (name: string) => {
    extendProfile(
      { language: profile.language, name, parentProfile: profile },
      {
        onSuccess: () => {
          navigateToProfile(name, profile.language);
        },
      },
    );
  };

  const handleProfileRename = (name: string) => {
    renameProfile(
      { key: profile.key, name },
      {
        onSuccess: () => {
          if (!fromList) {
            navigateToProfile(name, profile.language);
          }
        },
      },
    );
  };

  const handleProfileDelete = () => {
    deleteProfile(profile, {
      onSuccess: () => {
        router.replace({ pathname: PROFILE_PATH, query: { language } });
      },
    });
  };

  const handleSetDefaultClick = () => {
    if (profile.activeRuleCount > 0) {
      setDefaultProfile(profile);
    }
  };

  const getQualityProfileBackupUrl = ({ language, name: qualityProfile }: Profile) => {
    const queryParams = Object.entries({ language, qualityProfile })
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `/api/qualityprofiles/backup?${queryParams}`;
  };

  const { actions = {} } = profile;

  const activateMoreUrl = getRulesUrl({
    qprofile: profile.key,
    activation: 'false',
  });

  const hasNoActiveRules = profile.activeRuleCount === 0;
  const hasAnyAction = some([...Object.values(actions), !profile.isBuiltIn, isComparable]);

  if (!hasAnyAction) {
    return null;
  }

  return (
    <DropdownMenu
      className="it__quality-profiles__actions-dropdown"
      id={`quality-profile-actions-${profile.key}`}
      items={
        <>
          {actions.edit && (
            <DropdownMenu.ItemLink
              className="it__quality-profiles__activate-more-rules"
              to={activateMoreUrl}
            >
              <FormattedMessage id="quality_profiles.activate_more_rules" />
            </DropdownMenu.ItemLink>
          )}

          {!profile.isBuiltIn && (
            <DropdownMenu.ItemLinkDownload
              className="it__quality-profiles__backup"
              download={`${profile.key}.xml`}
              to={getQualityProfileBackupUrl(profile)}
            >
              <FormattedMessage id="backup_verb" />
            </DropdownMenu.ItemLinkDownload>
          )}

          {isComparable && (
            <DropdownMenu.ItemLink
              className="it__quality-profiles__compare"
              to={getProfileComparePath(profile.name, profile.language)}
            >
              <FormattedMessage id="compare" />
            </DropdownMenu.ItemLink>
          )}

          {actions.copy && (
            <>
              <ProfileModalForm
                action={ProfileActionModals.Extend}
                loading={loading}
                onSubmit={handleProfileExtend}
                profile={profile}
              >
                <DropdownMenu.ItemButton className="it__quality-profiles__extend">
                  <FormattedMessage id="extend" />
                </DropdownMenu.ItemButton>
              </ProfileModalForm>

              <ProfileModalForm
                action={ProfileActionModals.Copy}
                loading={loading}
                onSubmit={handleProfileCopy}
                profile={profile}
              >
                <DropdownMenu.ItemButton className="it__quality-profiles__copy">
                  <FormattedMessage id="copy" />
                </DropdownMenu.ItemButton>
              </ProfileModalForm>
            </>
          )}

          {actions.edit && (
            <ProfileModalForm
              action={ProfileActionModals.Rename}
              loading={loading}
              onSubmit={handleProfileRename}
              profile={profile}
            >
              <DropdownMenu.ItemButton className="it__quality-profiles__rename">
                <FormattedMessage id="rename" />
              </DropdownMenu.ItemButton>
            </ProfileModalForm>
          )}

          {actions.setAsDefault &&
            (hasNoActiveRules ? (
              <Tooltip
                content={translate('quality_profiles.cannot_set_default_no_rules')}
                side={TooltipSide.Left}
              >
                <DropdownMenu.ItemButton
                  className="it__quality-profiles__set-as-default"
                  isDisabled
                  onClick={handleSetDefaultClick}
                >
                  <FormattedMessage id="set_as_default" />
                </DropdownMenu.ItemButton>
              </Tooltip>
            ) : (
              <DropdownMenu.ItemButton
                className="it__quality-profiles__set-as-default"
                onClick={handleSetDefaultClick}
              >
                <FormattedMessage id="set_as_default" />
              </DropdownMenu.ItemButton>
            ))}

          {actions.delete && (
            <>
              <DropdownMenu.Separator />
              <DeleteProfileForm loading={loading} onDelete={handleProfileDelete} profile={profile}>
                <DropdownMenu.ItemButtonDestructive className="it__quality-profiles__delete">
                  <FormattedMessage id="delete" />
                </DropdownMenu.ItemButtonDestructive>
              </DeleteProfileForm>
            </>
          )}
        </>
      }
    >
      <ButtonIcon
        Icon={IconMoreVertical}
        ariaLabel={translateWithParameters(
          'quality_profiles.actions',
          profile.name,
          profile.languageName,
        )}
        className="it__quality-profiles__actions-dropdown-toggle"
      />
    </DropdownMenu>
  );
}

export default ProfileActions;
