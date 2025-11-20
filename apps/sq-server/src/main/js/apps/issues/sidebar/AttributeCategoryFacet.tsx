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

import { CodeAttributeCategory } from '~shared/types/clean-code-taxonomy';
import { FacetHelp } from '~sq-server-commons/components/facets/FacetHelp';
import {
  CommonProps,
  SimpleListStyleFacet,
} from '~sq-server-commons/components/facets/SimpleListStyleFacet';
import { CLEAN_CODE_CATEGORIES } from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';

interface Props extends CommonProps {
  categories: Array<CodeAttributeCategory>;
}

export function AttributeCategoryFacet(props: Props) {
  const { categories = [], ...rest } = props;

  return (
    <SimpleListStyleFacet
      help={
        <FacetHelp
          link={DocLink.CleanCodeDefinition}
          noDescription
          property="cleanCodeAttributeCategories"
        />
      }
      itemNamePrefix="issue.clean_code_attribute_category"
      listItems={CLEAN_CODE_CATEGORIES}
      property="cleanCodeAttributeCategories"
      selectedItems={categories}
      {...rest}
    />
  );
}
