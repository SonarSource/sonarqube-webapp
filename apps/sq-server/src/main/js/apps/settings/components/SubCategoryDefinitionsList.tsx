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
import { cssVar, Divider, Heading, Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { debounce, groupBy, sortBy } from 'lodash';
import * as React from 'react';
import { withRouter } from '~shared/components/hoc/withRouter';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { Location } from '~shared/types/router';
import { SettingDefinitionAndValue } from '~sq-server-commons/types/settings';
import { Component } from '~sq-server-commons/types/types';
import { SUB_CATEGORY_EXCLUSIONS } from '../constants';
import { getSubCategoryDescription, getSubCategoryName } from '../utils';
import DefinitionsList from './DefinitionsList';
import {
  CUSTOM_SUB_CATEGORY_SECTIONS,
  SUBCATEGORY_APPENDED_SECTIONS,
} from './SubCategoryExtensions';

export interface SubCategoryDefinitionsListProps {
  category: string;
  component?: Component;
  displaySubCategoryTitle?: boolean;
  location: Location;
  noPadding?: boolean;
  settings: Array<SettingDefinitionAndValue>;
  subCategory?: string;
}

const DEBOUNCE_TIME_TO_SCROLL = 300;

class SubCategoryDefinitionsList extends React.PureComponent<SubCategoryDefinitionsListProps> {
  debouncedDetectElementToScroll: (key: string) => void;

  constructor(props: Readonly<SubCategoryDefinitionsListProps>) {
    super(props);
    this.debouncedDetectElementToScroll = debounce(
      this.detectElementToScroll,
      DEBOUNCE_TIME_TO_SCROLL,
    );
  }

  componentDidMount(): void {
    const { hash } = this.props.location;
    if (hash.length > 0) {
      this.debouncedDetectElementToScroll(hash);
    }
  }

  componentDidUpdate(prevProps: SubCategoryDefinitionsListProps) {
    const { hash } = this.props.location;
    if (hash.length > 0 && prevProps.location.hash !== hash) {
      this.debouncedDetectElementToScroll(hash);
    }
  }

  detectElementToScroll = (hash: string) => {
    const query = `[data-scroll-key=${hash.substring(1).replace(/[.#/]/g, '\\$&')}]`;
    const element = document.querySelector<HTMLHeadingElement | HTMLLIElement>(query);
    this.scrollToSubCategoryOrDefinition(element);
  };

  scrollToSubCategoryOrDefinition = (element: HTMLHeadingElement | HTMLLIElement | null) => {
    if (element) {
      const { hash } = this.props.location;
      if (
        hash.length > 0 &&
        hash.substring(1).toLocaleLowerCase() ===
          element.getAttribute('data-scroll-key')?.toLocaleLowerCase()
      ) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  };

  renderExtraSubCategorySettings(subCategory: string | undefined) {
    const { category, component } = this.props;
    const filteredExtraSubCategories = SUBCATEGORY_APPENDED_SECTIONS.filter(
      ({ subCategoryKey, categoryKey }) => {
        return subCategory === subCategoryKey && category === categoryKey;
      },
    ).filter(
      ({ availableForProject, availableGlobally }) =>
        (availableGlobally && !component) || (availableForProject && !!component),
    );

    if (filteredExtraSubCategories.length > 0) {
      return (
        <ul>
          {filteredExtraSubCategories.map(
            ({ key, SubCategoryComponent, 'data-scroll-key': dataScrollKey }) => (
              <StyledListItem data-scroll-key={dataScrollKey} key={key}>
                {SubCategoryComponent && <SubCategoryComponent component={component} />}
              </StyledListItem>
            ),
          )}
        </ul>
      );
    }

    return null;
  }

  render() {
    const {
      category,
      displaySubCategoryTitle = true,
      settings,
      subCategory,
      component,
      noPadding,
    } = this.props;
    // 1. Custom subcategory setup
    const eligibleCustomSubCategorySections = CUSTOM_SUB_CATEGORY_SECTIONS.filter(
      ({ categoryKey, availableForProject, availableGlobally }) =>
        categoryKey === category &&
        ((availableGlobally && !component) || (availableForProject && Boolean(component))),
    );
    const definitionKeysToSuppress = new Set(
      eligibleCustomSubCategorySections.map((section) => section.suppressedDefinitionKey),
    );
    const frontendDefinedSubCategoryKeys = new Set(
      eligibleCustomSubCategorySections.map((section) => section.subCategoryKey),
    );

    // 2. Backend settings — filtered and grouped
    const visibleSettings = settings.filter(
      (setting) => !definitionKeysToSuppress.has(setting.definition.key),
    );
    const settingsBySubCategory = groupBy(
      visibleSettings,
      (setting) => setting.definition.subCategory,
    );
    const backendSubCategories = Object.keys(settingsBySubCategory).map((key) => ({
      key,
      name: getSubCategoryName(settingsBySubCategory[key][0].definition.category, key),
      description: getSubCategoryDescription(
        settingsBySubCategory[key][0].definition.category,
        key,
      ),
    }));
    const sortedBackendSubCategories = sortBy(backendSubCategories, (subCategory) =>
      subCategory.name.toLowerCase(),
    );

    // 3. Build backend-defined and frontend-defined subcategories
    const isRenderedAsBackend = (c: { key: string }) =>
      !SUB_CATEGORY_EXCLUSIONS[category]?.includes(c.key) &&
      !frontendDefinedSubCategoryKeys.has(c.key);

    const backendDefinedSubCategories = subCategory
      ? sortedBackendSubCategories.filter((c) => c.key === subCategory)
      : sortedBackendSubCategories.filter(isRenderedAsBackend);

    // Frontend-defined replacements for backend subcategories, used when a setting requires richer UI than the auto-generated generic inputs — e.g. radio buttons or a destructive-action modal.
    const frontendDefinedSubCategories = subCategory
      ? []
      : eligibleCustomSubCategorySections.map((setting) => ({
          key: setting.subCategoryKey,
          name: getSubCategoryName(category, setting.subCategoryKey),
          description: getSubCategoryDescription(category, setting.subCategoryKey) ?? undefined,
          customSubCategorySection: setting,
          isFrontendDefined: true as const,
        }));

    // 4. Merge into alphabetically sorted list
    const allSubCategories = sortBy(
      [
        ...backendDefinedSubCategories.map((subCategory) => ({
          ...subCategory,
          isFrontendDefined: false as const,
        })),
        ...frontendDefinedSubCategories,
      ],
      (subCategory) => subCategory.name.toLowerCase(),
    );

    return (
      <ul className={classNames({ 'sw-mx-6': !noPadding })}>
        {allSubCategories.map((subCategory, index) => {
          const isLast = index === allSubCategories.length - 1;
          const SubCategoryComponent = subCategory.isFrontendDefined
            ? subCategory.customSubCategorySection.SubCategoryComponent
            : null;

          return (
            <li
              className={classNames({ 'sw-py-6': !noPadding })}
              data-scroll-key={
                subCategory.isFrontendDefined
                  ? subCategory.customSubCategorySection['data-scroll-key']?.toLowerCase()
                  : undefined
              }
              key={subCategory.key}
            >
              {displaySubCategoryTitle && (
                <Heading
                  as="h3"
                  data-key={subCategory.key}
                  ref={this.scrollToSubCategoryOrDefinition}
                >
                  {subCategory.name}
                </Heading>
              )}
              {subCategory.description != null && (
                <SafeHTMLInjection
                  htmlAsString={subCategory.description}
                  sanitizeLevel={SanitizeLevel.RESTRICTED}
                >
                  <Text className="markdown" isSubtle />
                </SafeHTMLInjection>
              )}
              <Divider className="sw-mt-6" />
              {SubCategoryComponent ? (
                <SubCategoryComponent component={component} />
              ) : (
                <>
                  <DefinitionsList
                    component={component}
                    scrollToDefinition={this.scrollToSubCategoryOrDefinition}
                    settings={settingsBySubCategory[subCategory.key]}
                  />
                  {this.renderExtraSubCategorySettings(subCategory.key)}
                </>
              )}
              {!isLast && <Divider />}
            </li>
          );
        })}
      </ul>
    );
  }
}

const StyledListItem = styled.li`
  & + & {
    border-top: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  }
`;

export default withRouter(SubCategoryDefinitionsList);
