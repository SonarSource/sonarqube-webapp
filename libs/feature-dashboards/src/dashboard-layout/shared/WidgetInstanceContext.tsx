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
import type { Dimensions } from '../logic/types';

interface WidgetInstanceContextValue {
  dimensions: Dimensions;
  widgetKey: string;
}

const WidgetInstanceContext = createContext<WidgetInstanceContextValue | null>(null);

export function getWidgetTitleId(widgetKey: string) {
  return `widget-title-${widgetKey}`;
}

interface Props {
  children: ReactNode;
  dimensions: Dimensions;
  widgetKey: string;
}

export function WidgetInstanceProvider({ children, dimensions, widgetKey }: Readonly<Props>) {
  const value = useMemo(() => ({ dimensions, widgetKey }), [dimensions, widgetKey]);

  return <WidgetInstanceContext.Provider value={value}>{children}</WidgetInstanceContext.Provider>;
}

export function useOptionalWidgetInstanceContext() {
  return useContext(WidgetInstanceContext);
}
