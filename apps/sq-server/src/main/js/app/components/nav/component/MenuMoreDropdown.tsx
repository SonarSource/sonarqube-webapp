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

import { DropdownMenu } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { NavBarTabLink } from '~sq-server-commons/design-system';

interface Props {
  activityLinkData: DropdownMenuLinkArgs;
  componentMeasuresLinkData: DropdownMenuLinkArgs;
  extensions: DropdownMenuLinkArgs[] | null;
  hasMoreLinksThanAllowed: boolean;
  isApplicationChildInaccessble: boolean;
  renderDropdownMenuLink: (args: DropdownMenuLinkArgs) => JSX.Element;
  renderLinkWhenInaccessibleChild: (label: string) => JSX.Element;
  shouldRenderActivityLink: boolean;
}

export function MenuMoreDropdown(props: Readonly<Props>) {
  const {
    activityLinkData,
    componentMeasuresLinkData,
    extensions,
    hasMoreLinksThanAllowed,
    isApplicationChildInaccessble,
    shouldRenderActivityLink,
    renderDropdownMenuLink,
    renderLinkWhenInaccessibleChild,
  } = props;

  const intl = useIntl();
  const location = useLocation();

  let moreLinks: Array<DropdownMenuLinkArgs> = [];

  // If we have too many links, collapse the additional links into this dropdown
  // Otherwise. these links are rendered directly by the Menu component
  if (hasMoreLinksThanAllowed) {
    moreLinks.push(componentMeasuresLinkData);

    if (shouldRenderActivityLink) {
      moreLinks.push(activityLinkData);
    }
  }

  // If we have extensions, add them to the 'more' dropdown
  if (extensions != null) {
    moreLinks = [...moreLinks, ...extensions];
  }

  const moreLabel = intl.formatMessage({ id: 'more' });

  // Render the 'more' menu only if we have links inside
  if (moreLinks.length === 0) {
    return null;
  }

  if (isApplicationChildInaccessble) {
    return renderLinkWhenInaccessibleChild(moreLabel);
  }

  return (
    <DropdownMenu
      data-test="extensions"
      id="component-navigation-more"
      items={moreLinks.map((data) => renderDropdownMenuLink(data))}
    >
      <NavBarTabLink
        active={moreLinks.some(({ pathname }) => location.pathname.includes(pathname))}
        preventDefault
        text={moreLabel}
        to={{}}
        withChevron
      />
    </DropdownMenu>
  );
}
