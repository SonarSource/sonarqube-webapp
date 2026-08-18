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

import { WidgetBodyMap, WidgetHeaderMap } from '../../dashboard-layout/logic/types';
import type {
  CompleteWidgetConfig,
  ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { ConfigureWidgetPreview } from './ConfigureWidgetPreview';

interface WidgetModalPreviewFromStateProps<S> {
  bodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap>;
  extractCompleteConfig: (state: S) => CompleteWidgetConfig | null;
  headerMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap>;
  state: S;
}

/**
 * Preview pane that runs the app’s `extractCompleteConfig` on modal state and delegates to {@link ConfigureWidgetPreview}.
 */
export function WidgetModalPreviewFromState<S>({
  bodyMap,
  extractCompleteConfig,
  headerMap,
  state,
}: Readonly<WidgetModalPreviewFromStateProps<S>>) {
  return (
    <ConfigureWidgetPreview
      bodyMap={bodyMap}
      completeConfig={extractCompleteConfig(state)}
      headerMap={headerMap}
    />
  );
}
