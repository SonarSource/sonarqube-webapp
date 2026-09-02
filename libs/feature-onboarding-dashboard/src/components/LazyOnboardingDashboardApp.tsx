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

import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';

/**
 * The dashboard body, code-split out of the product bundles.
 *
 * The dynamic import lives here rather than in each product's page so that it stays relative to
 * this library: SonarQube Cloud also imports this library statically (the `ImportRepositoriesCta`
 * adapter), and `@nx/enforce-module-boundaries` forbids a project from importing the same library
 * both ways. Keeping the split inside the library gives both products the same chunk boundary
 * without that conflict.
 */
export const LazyOnboardingDashboardApp = lazyLoadComponent(
  () => import('./OnboardingDashboardApp'),
);
