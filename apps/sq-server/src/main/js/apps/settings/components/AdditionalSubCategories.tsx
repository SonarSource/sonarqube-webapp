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

import { FunctionComponent } from 'react';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { DEFAULT_CATEGORY } from '../utils';

export interface AdditionalSubCategorySettingComponentProps {
  component?: Component;
}

export interface AdditionalSubCategorySetting {
  SubCategoryComponent: FunctionComponent<AdditionalSubCategorySettingComponentProps>;
  availableForProject: boolean;
  availableGlobally: boolean;
  categoryKey: string;
  'data-scroll-key'?: string;
  key: string;
  subCategoryKey: string;
}

/*
 * If you want to insert custom component under subcategories in definitions list,
 * you can do it by adding it to the ADDITIONAL_SUB_CATEGORY_SETTINGS array below.
 */
export const ADDITIONAL_SUB_CATEGORY_SETTINGS: AdditionalSubCategorySetting[] = [
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

function SandboxIssues(props: Readonly<AdditionalSubCategorySettingComponentProps>) {
  const { hasFeature } = useAvailableFeatures();

  if (hasFeature(Feature.FromSonarQubeUpdate) && addons.issueSandbox) {
    return <addons.issueSandbox.SandboxSettingContainer {...props} />;
  }
  return null;
}
