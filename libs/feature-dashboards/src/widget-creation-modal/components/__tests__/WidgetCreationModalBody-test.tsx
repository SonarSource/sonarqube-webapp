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

import { screen } from '@testing-library/react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { WidgetBodyMap, WidgetHeaderMap } from '../../../dashboard-layout/logic/types';
import type { ProjectDashboardWidgetPropMap } from '../../../types/dashboard-widget';
import { WidgetCreationModalBody } from '../WidgetCreationModalBody';

describe('WidgetCreationModalBody', () => {
  const noopHeader = () => null;
  const noopBody = () => null;

  const headerMap = {
    count: noopHeader,
    donutChart: noopHeader,
    lineChart: noopHeader,
    pieChart: noopHeader,
    ratingBadge: noopHeader,
  } as unknown as WidgetHeaderMap<ProjectDashboardWidgetPropMap>;

  const bodyMap = {
    count: noopBody,
    donutChart: noopBody,
    lineChart: noopBody,
    pieChart: noopBody,
    ratingBadge: noopBody,
  } as unknown as WidgetBodyMap<ProjectDashboardWidgetPropMap>;

  it('renders preview column and options slot', () => {
    renderWithRouter(
      <WidgetCreationModalBody
        bodyMap={bodyMap}
        extractCompleteConfig={() => null}
        headerMap={headerMap}
        options={<div data-testid="options-column">options</div>}
        state={{}}
      />,
    );

    expect(screen.getByTestId('widget-preview-pane')).toBeInTheDocument();
    expect(screen.getByTestId('options-column')).toBeInTheDocument();
  });
});
