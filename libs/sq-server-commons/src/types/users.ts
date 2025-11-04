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
  isLoggedIn as isLoggedInShared,
  isUserActive as isUserActiveShared,
} from '~shared/helpers/users';
import {
  CurrentUser,
  LoggedInUserShared,
  UserActiveShared,
  UserBaseShared,
} from '~shared/types/users';

export type { CurrentUser } from '~shared/types/users';

export interface Notice {
  key: NoticeType;
  value: boolean;
}

export enum NoticeType {
  EDUCATION_PRINCIPLES = 'educationPrinciples',
  SONARLINT_AD = 'sonarlintAd',
  ISSUE_GUIDE = 'issueCleanCodeGuide',
  ISSUE_NEW_STATUS_AND_TRANSITION_GUIDE = 'issueNewIssueStatusAndTransitionGuide',
  OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION = 'overviewZeroNewIssuesSimplification',
  MQR_MODE_ADVERTISEMENT_BANNER = 'showNewModesBanner',
  MODE_TOUR = 'showNewModesTour',
  DESIGN_AND_ARCHITECTURE_OPT_IN_BANNER = 'showDesignAndArchitectureOptInBanner',
  DESIGN_AND_ARCHITECTURE_BANNER = 'showDesignAndArchitectureBanner',
  DESIGN_AND_ARCHITECTURE_TOUR = 'showDesignAndArchitectureTour',
}

type LoggedInUserBase = CurrentUser & UserActive & LoggedInUserShared;

export interface LoggedInUser extends LoggedInUserBase {
  homepage?: HomePage;
  local?: boolean;
  scmAccounts: string[];
  settings?: CurrentUserSetting[];
  sonarLintAdSeen?: boolean;
  usingSonarLintConnectedMode?: boolean;
}

export type HomePage =
  | { branch: string | undefined; component: string; type: 'APPLICATION' }
  | { type: 'ISSUES' }
  | { type: 'MY_ISSUES' }
  | { type: 'MY_PROJECTS' }
  | { component: string; type: 'PORTFOLIO' }
  | { type: 'PORTFOLIOS' }
  | { branch: string | undefined; component: string; type: 'PROJECT' }
  | { type: 'PROJECTS' };

export interface CurrentUserSetting {
  key: CurrentUserSettingNames;
  value: string;
}

export type CurrentUserSettingNames =
  | 'notifications.optOut'
  | 'notifications.readDate'
  | 'tutorials.jenkins.skipBitbucketPreReqs';

export type UserActive = UserBase & UserActiveShared;

export interface User extends UserBase {
  externalIdentity?: string;
  externalProvider?: string;
  groups?: string[];
  lastConnectionDate?: string;
  local: boolean;
  managed: boolean;
  scmAccounts?: string[];
  sonarLintLastConnectionDate?: string;
  tokensCount?: number;
}

export interface UserBase extends UserBaseShared {}

export interface RestUserBase {
  id: string;
  login: string;
  name: string;
}

export interface RestUser extends RestUserBase {
  active: boolean;
  avatar: string;
  email: string | null;
  externalProvider: string;
  local: boolean;
}

export interface RestUserDetailed extends RestUser {
  externalLogin: string;
  managed: boolean;
  scmAccounts: string[];
  sonarLintLastConnectionDate: string | null;
  sonarQubeLastConnectionDate: string | null;
}

export const enum ChangePasswordResults {
  OldPasswordIncorrect = 'old_password_incorrect',
  NewPasswordSameAsOld = 'new_password_same_as_old',
}

export function isUserActive(user: UserBase) {
  return isUserActiveShared<UserBase, UserActive>(user);
}

export function isLoggedIn(user: CurrentUser) {
  return isLoggedInShared<LoggedInUser>(user);
}
