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

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { WidgetBodyMap, WidgetEditBehaviorMap, WidgetHeaderMap } from '../logic/types';

interface WidgetMapsContextValue<WidgetPropMap extends {}> {
  bodyMap: WidgetBodyMap<WidgetPropMap>;
  editBehaviorMap: WidgetEditBehaviorMap<WidgetPropMap>;
  headerMap: WidgetHeaderMap<WidgetPropMap>;
}

const WidgetMapsContext = createContext<WidgetMapsContextValue<Record<string, never>> | null>(null);

interface WidgetMapsProviderProps<WidgetPropMap extends {}> {
  bodyMap: WidgetBodyMap<WidgetPropMap>;
  children: ReactNode;
  editBehaviorMap: WidgetEditBehaviorMap<WidgetPropMap>;
  headerMap: WidgetHeaderMap<WidgetPropMap>;
}

export function WidgetMapsProvider<WidgetPropMap extends {}>({
  bodyMap,
  editBehaviorMap,
  headerMap,
  children,
}: Readonly<WidgetMapsProviderProps<WidgetPropMap>>) {
  const value = useMemo(
    () => ({ bodyMap, editBehaviorMap, headerMap }),
    [bodyMap, editBehaviorMap, headerMap],
  );
  return (
    <WidgetMapsContext.Provider value={value as WidgetMapsContextValue<Record<string, never>>}>
      {children}
    </WidgetMapsContext.Provider>
  );
}

export function useWidgetMaps<WidgetPropMap extends {}>(): WidgetMapsContextValue<WidgetPropMap> {
  const context = useContext(WidgetMapsContext);
  if (!context) {
    throw new Error('useWidgetMaps must be used within a WidgetMapsProvider');
  }
  // The context is typed as Record<string, never> because it's a generic context.
  // At runtime, the actual type is determined by the WidgetMapsProvider wrapping this component.
  return context as WidgetMapsContextValue<WidgetPropMap>;
}
