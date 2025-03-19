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

import * as React from 'react';
import { NEW_CODE_PERIOD_CATEGORY } from '~sq-server-shared/constants/settings';
import { translate } from '~sq-server-shared/helpers/l10n';
import { ExtendedSettingDefinition } from '~sq-server-shared/types/settings';
import { Component } from '~sq-server-shared/types/types';
import {
  AI_CODE_FIX_CATEGORY,
  ALM_INTEGRATION_CATEGORY,
  ANALYSIS_SCOPE_CATEGORY,
  AUTHENTICATION_CATEGORY,
  EARLY_ACCESS_FEATURES_CATEGORY,
  EMAIL_NOTIFICATION_CATEGORY,
  LANGUAGES_CATEGORY,
  MODE_CATEGORY,
  PULL_REQUEST_DECORATION_BINDING_CATEGORY,
  SCA_CATEGORY,
} from '../constants';
import AiCodeFixAdmin from './ai-codefix/AiCodeFixAdminCategory';
import AlmIntegration from './almIntegration/AlmIntegration';
import { AnalysisScope } from './AnalysisScope';
import Authentication from './authentication/Authentication';
import { EarlyAccessFeatures } from './earlyAccessFeatures/EarlyAccessFeatures';
import EmailNotification from './email-notification/EmailNotification';
import Languages from './Languages';
import { Mode } from './Mode';
import NewCodeDefinition from './NewCodeDefinition';
import PullRequestDecorationBinding from './pullRequestDecorationBinding/PRDecorationBinding';
import Sca from './sca/Sca';

export interface AdditionalCategoryComponentProps {
  categories: string[];
  component: Component | undefined;
  definitions: ExtendedSettingDefinition[];
  selectedCategory: string;
}

export interface AdditionalCategory {
  availableForProject: boolean;
  availableGlobally: boolean;
  displayTab: boolean;
  key: string;
  name: string;
  renderComponent: (props: AdditionalCategoryComponentProps) => React.ReactNode;
  requiresBranchSupport?: boolean;
}

export const ADDITIONAL_CATEGORIES: AdditionalCategory[] = [
  {
    key: LANGUAGES_CATEGORY,
    name: translate('property.category.languages'),
    renderComponent: getLanguagesComponent,
    availableGlobally: true,
    availableForProject: true,
    displayTab: true,
  },
  {
    key: NEW_CODE_PERIOD_CATEGORY,
    name: translate('settings.new_code_period.category'),
    renderComponent: getNewCodePeriodComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: ANALYSIS_SCOPE_CATEGORY,
    name: translate('property.category.exclusions'),
    renderComponent: getAnalysisScopeComponent,
    availableGlobally: true,
    availableForProject: true,
    displayTab: false,
  },
  {
    key: ALM_INTEGRATION_CATEGORY,
    name: translate('property.category.almintegration'),
    renderComponent: getAlmIntegrationComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: AI_CODE_FIX_CATEGORY,
    name: translate('property.category.aicodefix'),
    renderComponent: getAiCodeFixComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: PULL_REQUEST_DECORATION_BINDING_CATEGORY,
    name: translate('settings.pr_decoration.binding.category'),
    renderComponent: getPullRequestDecorationBindingComponent,
    availableGlobally: false,
    availableForProject: true,
    displayTab: true,
    requiresBranchSupport: true,
  },
  {
    key: AUTHENTICATION_CATEGORY,
    name: translate('property.category.authentication'),
    renderComponent: getAuthenticationComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: false,
  },
  {
    key: EMAIL_NOTIFICATION_CATEGORY,
    name: translate('email_notification.category'),
    renderComponent: getEmailNotificationComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: MODE_CATEGORY,
    name: translate('settings.mode.title'),
    renderComponent: getModeComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: SCA_CATEGORY,
    name: translate('settings.sca.title'),
    renderComponent: getScaComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: EARLY_ACCESS_FEATURES_CATEGORY,
    name: translate('settings.early_access.title'),
    renderComponent: getEarlyAccessFeaturesComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
];

function getLanguagesComponent(props: AdditionalCategoryComponentProps) {
  return <Languages {...props} />;
}

function getNewCodePeriodComponent() {
  return <NewCodeDefinition />;
}

function getAnalysisScopeComponent(props: AdditionalCategoryComponentProps) {
  return <AnalysisScope {...props} />;
}

function getAlmIntegrationComponent(props: AdditionalCategoryComponentProps) {
  return <AlmIntegration {...props} />;
}

function getAiCodeFixComponent(props: AdditionalCategoryComponentProps) {
  return <AiCodeFixAdmin {...props} headingTag="h2" />;
}

function getAuthenticationComponent(props: AdditionalCategoryComponentProps) {
  return <Authentication {...props} />;
}

function getPullRequestDecorationBindingComponent(props: AdditionalCategoryComponentProps) {
  return props.component && <PullRequestDecorationBinding component={props.component} />;
}

function getEmailNotificationComponent() {
  return <EmailNotification />;
}

function getModeComponent() {
  return <Mode />;
}

function getScaComponent() {
  return <Sca />;
}

function getEarlyAccessFeaturesComponent() {
  return <EarlyAccessFeatures />;
}
