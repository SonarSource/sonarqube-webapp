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
import * as React from 'react';
import { withRouter } from '~shared/components/hoc/withRouter';
import { Router } from '~shared/types/router';
import {
  changeProfileParent,
  copyProfile,
  createQualityProfile,
  deleteProfile,
  renameProfile,
  setDefaultProfile,
} from '~sq-server-commons/api/quality-profiles';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { getProfilePath, getRulesUrl } from '~sq-server-commons/helpers/urls';
import { Profile, ProfileActionModals } from '~sq-server-commons/types/quality-profiles';
import { getProfileComparePath } from '~sq-server-commons/utils/quality-profiles-utils';
import DeleteProfileForm from './DeleteProfileForm';
import ProfileModalForm from './ProfileModalForm';

interface Props {
  isComparable: boolean;
  profile: Profile;
  router: Router;
  updateProfiles: () => Promise<void>;
}

interface State {
  loading: boolean;
}

class ProfileActions extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = {
    loading: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleProfileCopy = async (name: string) => {
    this.setState({ loading: true });

    try {
      await copyProfile(this.props.profile.key, name);
      this.profileActionPerformed(name);
    } catch {
      this.profileActionError();
    }
  };

  handleProfileExtend = async (name: string) => {
    const { profile: parentProfile } = this.props;

    const data = {
      language: parentProfile.language,
      name,
    };

    this.setState({ loading: true });

    try {
      const { profile: newProfile } = await createQualityProfile(data);
      await changeProfileParent(newProfile, parentProfile);
      this.profileActionPerformed(name);
    } catch {
      this.profileActionError();
    }
  };

  handleProfileRename = async (name: string) => {
    this.setState({ loading: true });

    try {
      await renameProfile(this.props.profile.key, name);
      this.profileActionPerformed(name);
    } catch {
      this.profileActionError();
    }
  };

  handleProfileDelete = async () => {
    this.setState({ loading: true });

    try {
      await deleteProfile(this.props.profile);

      if (this.mounted) {
        this.setState({ loading: false });
        this.props.router.replace(PROFILE_PATH);
        this.props.updateProfiles();
      }
    } catch {
      this.profileActionError();
    }
  };

  handleSetDefaultClick = () => {
    const { profile } = this.props;
    if (profile.activeRuleCount > 0) {
      setDefaultProfile(profile).then(this.props.updateProfiles, () => {
        /* noop */
      });
    }
  };

  profileActionPerformed = (name: string) => {
    const { profile, router } = this.props;
    if (this.mounted) {
      this.setState({ loading: false });
      this.props.updateProfiles().then(
        () => {
          router.push(getProfilePath(name, profile.language));
        },
        () => {
          /* noop */
        },
      );
    }
  };

  profileActionError = () => {
    if (this.mounted) {
      this.setState({ loading: false });
    }
  };

  getQualityProfileBackupUrl = ({ language, name: qualityProfile }: Profile) => {
    const queryParams = Object.entries({ language, qualityProfile })
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `/api/qualityprofiles/backup?${queryParams}`;
  };

  render() {
    const { profile, isComparable } = this.props;
    const { loading } = this.state;
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
                {translate('quality_profiles.activate_more_rules')}
              </DropdownMenu.ItemLink>
            )}

            {!profile.isBuiltIn && (
              <DropdownMenu.ItemLinkDownload
                className="it__quality-profiles__backup"
                download={`${profile.key}.xml`}
                to={this.getQualityProfileBackupUrl(profile)}
              >
                {translate('backup_verb')}
              </DropdownMenu.ItemLinkDownload>
            )}

            {isComparable && (
              <DropdownMenu.ItemLink
                className="it__quality-profiles__compare"
                to={getProfileComparePath(profile.name, profile.language)}
              >
                {translate('compare')}
              </DropdownMenu.ItemLink>
            )}

            {actions.copy && (
              <>
                <ProfileModalForm
                  action={ProfileActionModals.Extend}
                  loading={loading}
                  onSubmit={this.handleProfileExtend}
                  profile={profile}
                >
                  <DropdownMenu.ItemButton className="it__quality-profiles__extend">
                    {translate('extend')}
                  </DropdownMenu.ItemButton>
                </ProfileModalForm>

                <ProfileModalForm
                  action={ProfileActionModals.Copy}
                  loading={loading}
                  onSubmit={this.handleProfileCopy}
                  profile={profile}
                >
                  <DropdownMenu.ItemButton className="it__quality-profiles__copy">
                    {translate('copy')}
                  </DropdownMenu.ItemButton>
                </ProfileModalForm>
              </>
            )}

            {actions.edit && (
              <ProfileModalForm
                action={ProfileActionModals.Rename}
                loading={loading}
                onSubmit={this.handleProfileRename}
                profile={profile}
              >
                <DropdownMenu.ItemButton className="it__quality-profiles__rename">
                  {translate('rename')}
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
                    onClick={this.handleSetDefaultClick}
                  >
                    {translate('set_as_default')}
                  </DropdownMenu.ItemButton>
                </Tooltip>
              ) : (
                <DropdownMenu.ItemButton
                  className="it__quality-profiles__set-as-default"
                  onClick={this.handleSetDefaultClick}
                >
                  {translate('set_as_default')}
                </DropdownMenu.ItemButton>
              ))}

            {actions.delete && (
              <>
                <DropdownMenu.Separator />
                <DeleteProfileForm
                  loading={loading}
                  onDelete={this.handleProfileDelete}
                  profile={profile}
                >
                  <DropdownMenu.ItemButtonDestructive className="it__quality-profiles__delete">
                    {translate('delete')}
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
}

export default withRouter(ProfileActions);
