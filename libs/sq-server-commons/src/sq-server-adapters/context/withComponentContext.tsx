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

import { useContext } from 'react';
import { LightComponent } from '~shared/types/component';
import { ComponentContext } from '../../context/componentContext/ComponentContext';

// This HOC injects the LightComponent shape into the wrapped component's props
// Both products ContextProviders extend the shared LightComponent, so in shared feature code
// It's safe only to access the LightComponent shape
export function withComponentContext<P extends { component: LightComponent }>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function ComponentContextWrapper(props: Omit<P, 'component'>) {
    const context = useContext(ComponentContext);
    // Only pass the LightComponent shape
    const { key, name, qualifier, configuration } = context.component ?? {};

    return (
      <WrappedComponent {...(props as P)} component={{ key, name, qualifier, configuration }} />
    );
  };
}
