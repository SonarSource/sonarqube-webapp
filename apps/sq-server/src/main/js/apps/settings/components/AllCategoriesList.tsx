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

import { sortBy } from 'lodash';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { addons } from '~addons/index';
import { SubnavigationGroup, SubnavigationItem } from '~design-system';
import withAvailableFeatures, {
  useAvailableFeatures,
  WithAvailableFeaturesProps,
} from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getGlobalSettingsUrl, getProjectSettingsUrl } from '~sq-server-shared/helpers/urls';
import { useGetServiceInfoQuery } from '~sq-server-shared/queries/fix-suggestions';
import { Feature } from '~sq-server-shared/types/features';
import { Component } from '~sq-server-shared/types/types';
import { AI_CODE_FIX_CATEGORY, CATEGORY_OVERRIDES, SCA_CATEGORY } from '../constants';
import { getCategoryName } from '../utils';
import { ADDITIONAL_CATEGORIES, AdditionalCategory } from './AdditionalCategories';

export interface CategoriesListProps extends WithAvailableFeaturesProps {
  categories: string[];
  component?: Component;
  defaultCategory: string;
  selectedCategory: string;
}

function CategoriesList(props: Readonly<CategoriesListProps>) {
  const { categories, component, defaultCategory, selectedCategory } = props;

  const { data: aiCodeFixServiceInfoData } = useGetServiceInfoQuery({
    enabled: props.hasFeature(Feature.FixSuggestions),
  });

  const navigate = useNavigate();

  const { hasFeature } = useAvailableFeatures();
  const architectureCategories = hasFeature(Feature.Architecture)
    ? addons.architecture?.settings
    : [];

  const combinedAdditionalCategories = ADDITIONAL_CATEGORIES.concat(
    architectureCategories as AdditionalCategory[],
  );

  const openCategory = React.useCallback(
    (category: string | undefined) => {
      const url = component
        ? getProjectSettingsUrl(component.key, category)
        : getGlobalSettingsUrl(category);

      navigate(url);
    },
    [component, navigate],
  );

  const categoriesWithName = categories
    .filter((key) => CATEGORY_OVERRIDES[key.toLowerCase()] === undefined)
    .map((key) => ({
      key,
      name: getCategoryName(key),
    }))
    .concat(
      combinedAdditionalCategories.filter((c) => {
        const availableForCurrentMenu = component
          ? // Project settings
            c.availableForProject
          : // Global settings
            c.availableGlobally;

        return (
          c.displayTab &&
          availableForCurrentMenu &&
          (props.hasFeature(Feature.BranchSupport) || !c.requiresBranchSupport) &&
          ((props.hasFeature(Feature.FixSuggestions) &&
            aiCodeFixServiceInfoData &&
            aiCodeFixServiceInfoData.subscriptionType !== 'EARLY_ACCESS') ||
            c.key !== AI_CODE_FIX_CATEGORY) &&
          (props.hasFeature(Feature.ScaAvailable) || c.key !== SCA_CATEGORY)
        );
      }),
    );

  const sortedCategories = sortBy(categoriesWithName, (category) => category.name.toLowerCase());

  return (
    <SubnavigationGroup
      aria-label={translate('settings.page')}
      as="nav"
      className="sw-box-border it__subnavigation_menu"
    >
      {sortedCategories.map((c) => {
        const category = c.key !== defaultCategory ? c.key.toLowerCase() : undefined;
        const isActive = c.key.toLowerCase() === selectedCategory.toLowerCase();
        return (
          <SubnavigationItem
            active={isActive}
            ariaCurrent={isActive}
            key={c.key}
            onClick={() => {
              openCategory(category);
            }}
          >
            {c.name}
          </SubnavigationItem>
        );
      })}
    </SubnavigationGroup>
  );
}

export default withAvailableFeatures(CategoriesList);
