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
import { SubnavigationGroup, SubnavigationItem } from '~design-system';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getGlobalSettingsUrl, getProjectSettingsUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { ADVANCED_SECURITY_CATEGORY, AI_CODE_FIX_CATEGORY, CATEGORY_OVERRIDES } from '../constants';
import { getCategoryName, usePurchasableFeature } from '../utils';
import { ADDITIONAL_CATEGORIES } from './AdditionalCategories';

export interface CategoriesListProps extends WithAvailableFeaturesProps {
  categories: string[];
  component?: Component;
  defaultCategory: string;
  selectedCategory: string;
}

function AllCategoriesList(props: Readonly<CategoriesListProps>) {
  const { categories, component, defaultCategory, selectedCategory } = props;

  const navigate = useNavigate();
  const scaFeature = usePurchasableFeature(Feature.Sca);

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
    .filter(
      (key) =>
        (key.toLowerCase() === ADVANCED_SECURITY_CATEGORY && scaFeature?.isAvailable) ||
        key.toLowerCase() !== ADVANCED_SECURITY_CATEGORY,
    )
    .map((key) => ({
      key,
      name: getCategoryName(key),
    }))
    .concat(
      ADDITIONAL_CATEGORIES.filter((c) => {
        const availableForCurrentMenu = component
          ? // Project settings
            c.availableForProject
          : // Global settings
            c.availableGlobally;

        return (
          c.displayTab &&
          availableForCurrentMenu &&
          (props.hasFeature(Feature.BranchSupport) || !c.requiresBranchSupport) &&
          (props.hasFeature(Feature.FixSuggestions) ||
            props.hasFeature(Feature.FixSuggestionsMarketing) ||
            c.key !== AI_CODE_FIX_CATEGORY)
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

export default withAvailableFeatures(AllCategoriesList);
