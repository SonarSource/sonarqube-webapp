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
import { render } from '~shared/helpers/test-utils';
import { DashboardCustomDashboardWidgetModal } from '../DashboardCustomDashboardWidgetModal';

jest.mock('../DashboardAddWidgetModal', () => ({
  DashboardAddWidgetModal: (props: { isOpen: boolean; mode: string }) => (
    <div data-is-open={String(props.isOpen)} data-mode={props.mode} data-testid="widget-modal" />
  ),
  DashboardAddWidgetModalMode: { Add: 'add', Edit: 'edit' },
}));

describe('DashboardCustomDashboardWidgetModal', () => {
  it.each([
    [false, false, 'add', 'false'],
    [true, false, 'add', 'true'],
    [false, true, 'edit', 'true'],
    [true, true, 'edit', 'true'],
  ])('selects the modal mode from add/edit state', (isAddOpen, isEditOpen, mode, isOpen) => {
    render(
      <DashboardCustomDashboardWidgetModal
        isAddWidgetModalOpen={isAddOpen}
        isEditWidgetModalOpen={isEditOpen}
        metricPickerOptions={{ countMetrics: [], ratingBadgeMetrics: [] }}
        onOpenChange={jest.fn()}
        onSaveWidget={jest.fn()}
        reducerOptions={{
          isPortfolioWidgetConfigurator: false,
          supportsNewCodeScopeForMetric: () => true,
        }}
        renderOptions={() => null}
        widgetBodyMap={{} as never}
        widgetHeaderMap={{} as never}
      />,
    );

    expect(screen.getByTestId('widget-modal')).toHaveAttribute('data-mode', mode);
    expect(screen.getByTestId('widget-modal')).toHaveAttribute('data-is-open', isOpen);
  });
});
