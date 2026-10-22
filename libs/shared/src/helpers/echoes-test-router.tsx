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

import { type EchoesRouter, type EchoesRouterLinkProps, toHref } from '@sonarsource/echoes-react';
import { Link, useInRouterContext, useLocation } from 'react-router';

// Test helpers mount the Echoes provider both with and without a test router, and some tests put
// the router inside the provider. This adapter uses react-router when a router is above the link,
// and falls back to plain anchors otherwise.

function EchoesTestLink(props: Readonly<EchoesRouterLinkProps>) {
  const isInRouter = useInRouterContext();

  if (isInRouter) {
    // Keep the rendered link markup stable in tests and avoid snapshot churn from React Router 7's
    // default `data-discover="true"` attribute.
    return <Link discover="none" {...props} />;
  }

  const { children, reloadDocument: _reloadDocument, state: _state, to, ...anchorProps } = props;

  return (
    <a href={toHref(to)} {...anchorProps}>
      {children}
    </a>
  );
}

export const echoesTestRouter: EchoesRouter = {
  Link: EchoesTestLink,
  usePathname: () => {
    // Whether a component is inside a router never changes while it is mounted, so the hook order
    // stays stable.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useInRouterContext() ? useLocation().pathname : '/';
  },
};
