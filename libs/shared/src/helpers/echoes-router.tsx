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

import type { EchoesRouter, EchoesRouterLinkProps } from '@sonarsource/echoes-react';
import { Link, useLocation } from 'react-router';

function EchoesLink(props: Readonly<EchoesRouterLinkProps>) {
  // React Router 7 renders `data-discover="true"` on router links by default. Keep
  // Echoes-rendered links at the pre-upgrade DOM shape until we intentionally adopt that attribute.
  return <Link discover="none" {...props} />;
}

function usePathname() {
  return useLocation().pathname;
}

export const echoesRouter: EchoesRouter = {
  Link: EchoesLink,
  usePathname,
};
