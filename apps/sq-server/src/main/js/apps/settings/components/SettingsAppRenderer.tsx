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

import styled from '@emotion/styled';
import { BreadcrumbsItems, BreadcrumbsProps, cssVar, Layout } from '@sonarsource/echoes-react';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useLocation } from '~shared/components/hoc/withRouter';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isDefined } from '~shared/helpers/types';
import { ExtendedSettingDefinition } from '~shared/types/settings';
import ModeBanner from '~sq-server-commons/components/common/ModeBanner';
import { BitbucketCloudAppDeprecationMessage } from '~sq-server-commons/components/devops-platform/BitbucketCloudAppDeprecationMessage';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { getGlobalSettingsUrl, getProjectSettingsUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { CATEGORY_OVERRIDES } from '../constants';
import {
  DEFAULT_CATEGORY,
  getCategoryName,
  getDefaultCategory,
  usePurchasableFeature,
} from '../utils';
import { ADDITIONAL_CATEGORIES } from './AdditionalCategories';
import AllCategoriesList from './AllCategoriesList';
import CategoryDefinitionsList from './CategoryDefinitionsList';
import PageHeader from './PageHeader';
import SettingsSearch from './SettingsSearch';
import { useSettingsAppHeader } from './useSettingsAppHeader';

export interface SettingsAppRendererProps {
  component?: Component;
  definitions: ExtendedSettingDefinition[];
}

function SettingsAppRenderer(props: Readonly<SettingsAppRendererProps>) {
  const { definitions, component } = props;

  const location = useLocation();
  const scaFeature = usePurchasableFeature(Feature.Sca);
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  const categories = React.useMemo(() => {
    return uniqBy(
      definitions.map((definition) => definition.category),
      (category) => category.toLowerCase(),
    );
  }, [definitions]);

  const { query } = location;
  const defaultCategory = getDefaultCategory(categories);
  const originalCategory = (query.category as string) || defaultCategory;
  const overriddenCategory = CATEGORY_OVERRIDES[originalCategory.toLowerCase()];
  const selectedCategory = overriddenCategory || originalCategory;
  const foundAdditionalCategory = ADDITIONAL_CATEGORIES.find((c) => c.key === selectedCategory);
  const isProjectSettings = isDefined(component);
  const shouldRenderAdditionalCategory =
    foundAdditionalCategory &&
    ((isProjectSettings && foundAdditionalCategory.availableForProject) ||
      (!isProjectSettings && foundAdditionalCategory.availableGlobally));

  const breadcrumbs = React.useMemo<BreadcrumbsItems>(
    () =>
      selectedCategory === DEFAULT_CATEGORY
        ? []
        : [
            {
              linkElement: foundAdditionalCategory
                ? foundAdditionalCategory.name
                : getCategoryName(
                    categories.find((c) => c.toLowerCase() === selectedCategory.toLowerCase()) ??
                      selectedCategory.toLowerCase(),
                  ),
            },
          ],
    [categories, selectedCategory, foundAdditionalCategory],
  );

  return (
    <Wrapper
      asideLeft={
        <div className="sw-flex sw-flex-col sw-gap-4">
          <SettingsSearch
            component={component}
            definitions={definitions}
            showAdvancedSecurity={scaFeature?.isAvailable ?? false}
          />
          <AllCategoriesList
            categories={categories}
            component={component}
            defaultCategory={defaultCategory}
            selectedCategory={selectedCategory}
          />
        </div>
      }
      breadcrumbs={breadcrumbs}
      component={component}
    >
      {!isProjectSettings && <BitbucketCloudAppDeprecationMessage className="sw-mt-8" />}

      <ModeBanner as="wideBanner" />

      <div>
        {isProjectSettings && !frontEndEngineeringEnableSidebarNavigation && (
          <PageHeader component={component} />
        )}

        {/* Adding a key to force re-rendering of the category content, so that it resets the scroll position */}
        <StyledBox className="it__settings_list sw-flex-1 sw-p-6 sw-min-w-0" key={selectedCategory}>
          {shouldRenderAdditionalCategory ? (
            foundAdditionalCategory.renderComponent({
              categories,
              component,
              definitions,
              selectedCategory: originalCategory,
            })
          ) : (
            <CategoryDefinitionsList
              category={selectedCategory}
              component={component}
              definitions={definitions}
            />
          )}
        </StyledBox>
      </div>
    </Wrapper>
  );
}

function Wrapper({
  asideLeft,
  breadcrumbs,
  children,
  component,
}: React.PropsWithChildren<{
  asideLeft: React.ReactNode;
  breadcrumbs: BreadcrumbsProps['items'];
  component?: Component;
}>) {
  const { pageTitle, pageDescription } = useSettingsAppHeader(component);

  if (isDefined(component)) {
    return (
      <ProjectPageTemplate
        asideLeft={<Layout.AsideLeft>{asideLeft}</Layout.AsideLeft>}
        breadcrumbs={[
          { linkElement: pageTitle, to: getProjectSettingsUrl(component.key) },
          ...breadcrumbs,
        ]}
        description={pageDescription}
        disableBranchSelector
        title={pageTitle}
      >
        <div id="settings-page">{children}</div>
      </ProjectPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      asideLeft={<Layout.AsideLeft>{asideLeft}</Layout.AsideLeft>}
      breadcrumbs={[{ linkElement: pageTitle, to: getGlobalSettingsUrl() }, ...breadcrumbs]}
      description={pageDescription}
      hasDivider
      scrollBehavior="sticky"
      title={pageTitle}
    >
      {children}
    </AdminPageTemplate>
  );
}

export default SettingsAppRenderer;

const StyledBox = styled.div`
  background-color: ${cssVar('color-surface-default')};
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  margin-left: -1px;
`;
