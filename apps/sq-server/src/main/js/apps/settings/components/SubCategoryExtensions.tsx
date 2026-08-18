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

import { FunctionComponent } from 'react';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { DASHBOARD_HISTORY_RETENTION_KEY } from '../constants';
import { DEFAULT_CATEGORY } from '../utils';
import { DashboardRetentionSection } from './dashboardRetention/DashboardRetentionSection';

export interface SubCategoryAppendedSectionComponentProps {
  component?: Component;
}

interface SubCategoryComponentBase {
  SubCategoryComponent: FunctionComponent<SubCategoryAppendedSectionComponentProps>;
  availableForProject: boolean;
  availableGlobally: boolean;
  categoryKey: string;
  'data-scroll-key'?: string;
  subCategoryKey: string;
}

export interface SubCategoryAppendedSection extends SubCategoryComponentBase {
  key: string;
}

export interface CustomSubCategorySection extends SubCategoryComponentBase {
  suppressedDefinitionKey: string;
}

/*
 * Components in this list are appended inside an existing subcategory's section,
 * after its standard definitions. The component renders within the subcategory's <li>,
 * not as a separate peer section.
 */
export const SUBCATEGORY_APPENDED_SECTIONS: SubCategoryAppendedSection[] = [
  {
    subCategoryKey: 'issues',
    key: 'sandbox-issues',
    categoryKey: DEFAULT_CATEGORY,
    SubCategoryComponent: SandboxIssues,
    availableGlobally: true,
    availableForProject: true,
    'data-scroll-key': 'sonar.issues.sandbox.enabled',
  },
];

/*
 * Use this registry to replace a backend-defined subcategory with a custom component.
 * Each entry suppresses the standard definitions UI for the listed keys and renders
 * the custom component as a peer section in its place.
 */
export const CUSTOM_SUB_CATEGORY_SECTIONS: CustomSubCategorySection[] = [
  {
    categoryKey: 'housekeeping',
    subCategoryKey: 'dashboards',
    suppressedDefinitionKey: DASHBOARD_HISTORY_RETENTION_KEY,
    SubCategoryComponent: DashboardRetentionSection,
    availableGlobally: true,
    availableForProject: false,
    'data-scroll-key': DASHBOARD_HISTORY_RETENTION_KEY,
  },
];

function SandboxIssues(props: Readonly<SubCategoryAppendedSectionComponentProps>) {
  const { hasFeature } = useAvailableFeatures();

  if (hasFeature(Feature.FromSonarQubeUpdate) && addons.issueSandbox) {
    return <addons.issueSandbox.SandboxSettingContainer {...props} />;
  }
  return null;
}
