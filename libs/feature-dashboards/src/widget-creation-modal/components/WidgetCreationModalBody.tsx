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

import { cssVar } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { WidgetBodyMap, WidgetHeaderMap } from '../../dashboard-layout/logic/types';
import type {
  CompleteWidgetConfig,
  ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { WidgetModalPreviewFromState } from './WidgetModalPreviewFromState';

export interface WidgetCreationModalBodyProps<S> {
  bodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap>;
  extractCompleteConfig: (state: S) => CompleteWidgetConfig | null;
  headerMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap>;
  /** Right column (accordions); product supplies {@link WidgetOptions} or portfolio equivalent. */
  options: ReactNode;
  state: S;
}

/**
 * Two-column body for add/edit widget modals: shared preview + product-specific options column.
 */
export function WidgetCreationModalBody<S>({
  bodyMap,
  extractCompleteConfig,
  headerMap,
  options,
  state,
}: Readonly<WidgetCreationModalBodyProps<S>>) {
  return (
    <div
      className="sw-flex sw-min-h-0 sw-items-stretch sw-justify-between sw-gap-4"
      style={{
        maxHeight: `calc(${cssVar('sizes-overlays-max-height-default')} - 280px)`,
        minHeight: '400px',
      }}
    >
      <WidgetModalPreviewFromState
        bodyMap={bodyMap}
        extractCompleteConfig={extractCompleteConfig}
        headerMap={headerMap}
        state={state}
      />
      {options}
    </div>
  );
}
