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

import { ReactNode } from 'react';
import { IntlShape } from 'react-intl';
import {
  BaseSettingsValueResponse,
  ExtendedSettingDefinition,
  SettingDefinition,
  SettingType,
  SettingValue,
} from '~shared/types/settings';

export const enum SettingsKey {
  AuditHouseKeeping = 'sonar.dbcleaner.auditHousekeeping',
  DaysBeforeDeletingInactiveBranchesAndPRs = 'sonar.dbcleaner.daysBeforeDeletingInactiveBranchesAndPRs',
  DefaultProjectVisibility = 'projects.default.visibility',
  ServerBaseUrl = 'sonar.core.serverBaseURL',
  PluginRiskConsent = 'sonar.plugins.risk.consent',
  LicenceRemainingLocNotificationThreshold = 'sonar.license.notifications.remainingLocThreshold',
  TokenMaxAllowedLifetime = 'sonar.auth.token.max.allowed.lifetime',
  QPAdminCanDisableInheritedRules = 'sonar.qualityProfiles.allowDisableInheritedRules',
  MQRMode = 'sonar.multi-quality-mode.enabled',
  CodeSuggestion = 'sonar.ai.suggestions.enabled',
  AutodetectAICode = 'sonar.autodetect.ai.code',
  DesignAndArchitecture = 'sonar.architecture.visualization.enabled',
}

export enum GlobalSettingKeys {
  LogoUrl = 'sonar.lf.logoUrl',
  LogoWidth = 'sonar.lf.logoWidthPx',
  EnableGravatar = 'sonar.lf.enableGravatar',
  GravatarServerUrl = 'sonar.lf.gravatarServerUrl',
  RatingGrid = 'sonar.technicalDebt.ratingGrid',
  DeveloperAggregatedInfoDisabled = 'sonar.developerAggregatedInfo.disabled',
  UpdatecenterActivated = 'sonar.updatecenter.activate',
  DisplayAnnouncementMessage = 'sonar.announcement.displayMessage',
  AnnouncementMessage = 'sonar.announcement.message',
  AnnouncementHTMLMessage = 'sonar.announcement.htmlMessage',
  MainBranchName = 'sonar.projectCreation.mainBranchName',
}

export type SettingDefinitionAndValue = {
  definition: ExtendedSettingDefinition;
  getConfirmationMessage?: (
    value: string | string[] | boolean | undefined,
    intl: IntlShape,
  ) => ReactNode | ReactNode[];
  settingValue?: SettingValue;
};

export type Setting = SettingValue & {
  definition: SettingDefinition;
  hasValue: boolean;
};
export type SettingWithCategory = Setting & {
  definition: ExtendedSettingDefinition;
};

export interface DefinitionV2 {
  description?: string;
  key: string;
  multiValues?: boolean;
  name: string;
  secured: boolean;
  type?: SettingType;
}

export interface SettingValueResponse extends BaseSettingsValueResponse {
  setSecuredSettings: string[];
  settings: SettingValue[];
}
