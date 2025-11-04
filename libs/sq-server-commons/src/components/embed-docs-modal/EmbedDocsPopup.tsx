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

import { DropdownMenu, IconSlideshow } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useCurrentUser } from '../../context/current-user/CurrentUserContext';
import { HighlightRing } from '../../design-system';
import { CustomEvents } from '../../helpers/constants';
import { DocLink } from '../../helpers/doc-links';
import { Permissions } from '../../types/permissions';
import { SuggestionLink } from '../../types/types';
import { DocItemLink } from './DocItemLink';
import { SuggestionsContext } from './SuggestionsContext';

function Suggestions({ suggestions }: Readonly<{ suggestions: SuggestionLink[] }>) {
  return (
    <>
      <DropdownMenu.GroupLabel>
        <FormattedMessage id="docs.suggestion" />
      </DropdownMenu.GroupLabel>

      {suggestions.map((suggestion) => (
        <DocItemLink key={suggestion.link} to={suggestion.link}>
          {suggestion.text}
        </DocItemLink>
      ))}

      <DropdownMenu.Separator />
    </>
  );
}

export function EmbedDocsPopup() {
  const firstItemRef = React.useRef<HTMLAnchorElement>(null);
  const { currentUser } = useCurrentUser();
  const { suggestions } = React.useContext(SuggestionsContext);

  React.useEffect(() => {
    firstItemRef.current?.focus();
  }, []);

  const runModeTour = () => {
    document.dispatchEvent(new CustomEvent(CustomEvents.RunTourMode));
  };

  const isAdminOrQGAdmin =
    currentUser.permissions?.global.includes(Permissions.Admin) ||
    currentUser.permissions?.global.includes(Permissions.QualityGateAdmin);

  return (
    <>
      {suggestions.length !== 0 && <Suggestions suggestions={suggestions} />}

      <DocItemLink to={DocLink.Root}>
        <FormattedMessage id="docs.documentation" />
      </DocItemLink>

      <DropdownMenu.ItemLink to="/web_api">
        <FormattedMessage id="api_documentation.page" />
      </DropdownMenu.ItemLink>

      <DropdownMenu.ItemLink to="/web_api_v2">
        <FormattedMessage id="api_documentation.page.v2" />
      </DropdownMenu.ItemLink>

      <DropdownMenu.Separator />

      <DropdownMenu.ItemLink to="https://community.sonarsource.com/">
        <FormattedMessage id="docs.get_help" />
      </DropdownMenu.ItemLink>

      <DropdownMenu.Separator />

      <DropdownMenu.GroupLabel asChild>
        <h2>
          <FormattedMessage id="docs.stay_connected" />
        </h2>
      </DropdownMenu.GroupLabel>

      <DropdownMenu.ItemLink to="https://www.sonarsource.com/products/sonarqube/whats-new/?referrer=sonarqube">
        <FormattedMessage id="docs.news" />
      </DropdownMenu.ItemLink>

      <DropdownMenu.ItemLink to="https://www.sonarsource.com/products/sonarqube/roadmap/?referrer=sonarqube">
        <FormattedMessage id="docs.roadmap" />
      </DropdownMenu.ItemLink>

      <DropdownMenu.ItemLink to="https://twitter.com/SonarQube">X @SonarQube</DropdownMenu.ItemLink>

      {isAdminOrQGAdmin && (
        <>
          <DropdownMenu.Separator />

          <DropdownMenu.GroupLabel>
            <FormattedMessage id="tours" />
          </DropdownMenu.GroupLabel>

          <HighlightRing data-guiding-id="mode-tour-2">
            <DropdownMenu.ItemButton onClick={runModeTour} prefix={<IconSlideshow />}>
              <FormattedMessage id="mode_tour.name" />
            </DropdownMenu.ItemButton>
          </HighlightRing>
        </>
      )}
    </>
  );
}
