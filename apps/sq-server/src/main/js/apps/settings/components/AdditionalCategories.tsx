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

import * as React from 'react';
import { ExtendedSettingDefinition } from '~shared/types/settings';
import { addons } from '~sq-server-addons/index';
import { NEW_CODE_PERIOD_CATEGORY } from '~sq-server-commons/constants/settings';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import {
  ADVANCED_SECURITY_CATEGORY,
  AI_CODE_FIX_CATEGORY,
  ALM_INTEGRATION_CATEGORY,
  ANALYSIS_SCOPE_CATEGORY,
  AUTHENTICATION_CATEGORY,
  EARLY_ACCESS_FEATURES_CATEGORY,
  EMAIL_NOTIFICATION_CATEGORY,
  INSTANCE_INTEGRATIONS_CATEGORY,
  JIRA_PROJECT_BINDING_CATEGORY,
  LANGUAGES_CATEGORY,
  MODE_CATEGORY,
  PULL_REQUEST_DECORATION_BINDING_CATEGORY,
} from '../constants';
import { AdvancedSecurity } from './advancedSecurity/AdvancedSecurity';
import { AiCodeFixAdminCategory } from './ai-codefix/AiCodeFixAdminCategory';
import AlmIntegration from './almIntegration/AlmIntegration';
import { AnalysisScope } from './AnalysisScope';
import Authentication from './authentication/Authentication';
import { EarlyAccessFeatures } from './earlyAccessFeatures/EarlyAccessFeatures';
import EmailNotification from './email-notification/EmailNotification';
import { InstanceIntegrationsApp } from './integrations/InstanceIntegrationsApp';
import Languages from './Languages';
import { Mode } from './Mode';
import NewCodeDefinition from './NewCodeDefinition';
import PullRequestDecorationBinding from './pullRequestDecorationBinding/PRDecorationBinding';

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
  requiredFeatures?: Feature[];
  requiresBranchSupport?: boolean;
}

/**
 * If your additional category also has associated `PropertyDefinition`s
 * from SQS, and you want to show both the custom UI and the standard
 * Definition component UI, when adding a new AdditionalCategory:
 *
 * * Set `displayTab` to false, otherwise you'll get two entries in the list.
 * * Ensure the `key` in the additional category definition matches the lower-cased
 *   `category` on the `PropertyDefinition`. This may mean that the key has
 *   a space in it.
 * * Ensure that `definitions` are passed into the referenced component in the
 *   `renderComponent` function. You can then filter those and use them directly
 *   within a `<Definition>` component.
 *
 * Doing all this will ensure that:
 *
 * * Searching for a property by name or key works
 * * You don't have to build additional backend code for handling the properties
 */
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
    key: ADVANCED_SECURITY_CATEGORY,
    name: translate('settings.advanced_security.title'),
    renderComponent: getAdvancedSecurityComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: false,
  },
  {
    key: EARLY_ACCESS_FEATURES_CATEGORY,
    name: translate('settings.early_access.title'),
    renderComponent: getEarlyAccessFeaturesComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: INSTANCE_INTEGRATIONS_CATEGORY,
    name: translate('settings.instance_integrations.title'),
    renderComponent: getInstanceIntegrationsComponent,
    availableGlobally: true,
    availableForProject: false,
    displayTab: true,
  },
  {
    key: JIRA_PROJECT_BINDING_CATEGORY,
    name: translate('project_settings.category.jira_binding'),
    renderComponent: getProjectJiraBindingComponent,
    availableGlobally: false,
    availableForProject: true,
    displayTab: true,
    requiredFeatures: [Feature.JiraIntegration],
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

function getAiCodeFixComponent() {
  return <AiCodeFixAdminCategory />;
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

function getAdvancedSecurityComponent(props: AdditionalCategoryComponentProps) {
  return <AdvancedSecurity definitions={props.definitions} />;
}

function getEarlyAccessFeaturesComponent() {
  return <EarlyAccessFeatures />;
}

function getInstanceIntegrationsComponent() {
  return <InstanceIntegrationsApp />;
}

function getProjectJiraBindingComponent({ component }: AdditionalCategoryComponentProps) {
  if (addons.jira === undefined || component === undefined) {
    return null;
  }

  return <addons.jira.JiraProjectBinding component={component} />;
}
