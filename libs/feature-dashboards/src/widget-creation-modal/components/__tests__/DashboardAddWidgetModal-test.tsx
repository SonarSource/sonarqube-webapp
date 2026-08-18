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

import { screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import type { WidgetBodyMap, WidgetHeaderMap } from '../../../dashboard-layout/logic/types';
import {
  DashboardMetricType,
  type CompleteWidgetConfig,
  type DashboardMetric,
  type ProjectDashboardWidgetPropMap,
} from '../../../types/dashboard-widget';
import {
  CodeScope,
  VisualizationType,
  type WidgetMetricPickerOptions,
} from '../../../types/widget-common';
import { DashboardAddWidgetModal, DashboardAddWidgetModalMode } from '../DashboardAddWidgetModal';

describe('DashboardAddWidgetModal', () => {
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

  const metricPickerOptions: WidgetMetricPickerOptions = {
    countMetrics: [{ group: 'g', items: [{ label: 'N', value: MetricKey.ncloc }] }],
    lineChartMetrics: [{ group: 'g', items: [{ label: 'L', value: MetricKey.violations }] }],
    ratingBadgeMetrics: [
      { group: 'g', items: [{ label: 'R', value: MetricKey.reliability_rating }] },
    ],
  };

  const countMetric: DashboardMetric = {
    type: DashboardMetricType.Raw,
    metricKey: MetricKey.ncloc,
  };

  const completeCountWidget: CompleteWidgetConfig = {
    widgetType: VisualizationType.Count,
    metric: countMetric,
    scope: CodeScope.Overall,
  };

  function renderModal(
    props: Partial<ComponentProps<typeof DashboardAddWidgetModal>> & {
      renderOptions?: ComponentProps<typeof DashboardAddWidgetModal>['renderOptions'];
    } = {},
  ) {
    const onOpenChange = jest.fn();
    const onSaveWidget = jest.fn();
    const renderOptions =
      props.renderOptions ??
      (({ isEditMode }: { isEditMode: boolean }) => (
        <div data-is-edit={String(isEditMode)} data-testid="options-slot">
          options
        </div>
      ));

    const result = renderWithRouter(
      <DashboardAddWidgetModal
        isOpen
        metricPickerOptions={metricPickerOptions}
        mode={DashboardAddWidgetModalMode.Add}
        onOpenChange={onOpenChange}
        onSaveWidget={onSaveWidget}
        reducerOptions={{
          isPortfolioWidgetConfigurator: false,
          supportsNewCodeScopeForMetric: () => true,
        }}
        renderOptions={renderOptions}
        widgetBodyMap={bodyMap}
        widgetHeaderMap={headerMap}
        {...props}
      />,
    );

    return { ...result, onOpenChange, onSaveWidget };
  }

  it('renders add mode title and disables save until configuration is complete', () => {
    renderModal();

    expect(screen.getByText('dashboard.add_widget_modal.title')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'dashboard.add_widget_modal.add_to_dashboard' }),
    ).toBeDisabled();
    expect(screen.getByTestId('options-slot')).toHaveAttribute('data-is-edit', 'false');
  });

  it('passes metric picker options and dispatch into renderOptions', () => {
    const renderOptions = jest.fn(({ isEditMode }) => (
      <div data-is-edit={String(isEditMode)} data-testid="options-slot">
        options
      </div>
    ));

    renderModal({ renderOptions });

    expect(renderOptions.mock.calls[0][0].metricPickerOptions).toBe(metricPickerOptions);
    expect(typeof renderOptions.mock.calls[0][0].dispatch).toBe('function');
  });

  it('initializes edit mode from initialWidget and enables save', async () => {
    const { user, onSaveWidget, onOpenChange } = renderModal({
      initialWidget: completeCountWidget,
      mode: DashboardAddWidgetModalMode.Edit,
    });

    await waitFor(() => {
      expect(screen.getByText('dashboard.edit_widget_modal.title')).toBeInTheDocument();
    });

    expect(screen.getByTestId('options-slot')).toHaveAttribute('data-is-edit', 'true');

    const saveButton = screen.getByRole('button', { name: 'dashboard.edit_widget_modal.save' });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);
    expect(onSaveWidget).toHaveBeenCalledTimes(1);
    const saved = onSaveWidget.mock.calls[0]?.[0] as CompleteWidgetConfig;
    expect(saved).toMatchObject({
      widgetType: VisualizationType.Count,
      scope: CodeScope.Overall,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes via secondary cancel and resets when modal requests close', async () => {
    const { user, onOpenChange } = renderModal();

    await user.click(screen.getByRole('button', { name: 'cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets add mode when opened after being closed', async () => {
    const onOpenChange = jest.fn();
    const onSaveWidget = jest.fn();
    const renderOptions = ({ isEditMode }: { isEditMode: boolean }) => (
      <div data-is-edit={String(isEditMode)} data-testid="options-slot">
        options
      </div>
    );

    const modal = (isOpen: boolean) => (
      <DashboardAddWidgetModal
        isOpen={isOpen}
        metricPickerOptions={metricPickerOptions}
        mode={DashboardAddWidgetModalMode.Add}
        onOpenChange={onOpenChange}
        onSaveWidget={onSaveWidget}
        reducerOptions={{
          isPortfolioWidgetConfigurator: false,
          supportsNewCodeScopeForMetric: () => true,
        }}
        renderOptions={renderOptions}
        widgetBodyMap={bodyMap}
        widgetHeaderMap={headerMap}
      />
    );

    const { rerender } = renderWithRouter(modal(true));

    await waitFor(() => {
      expect(screen.getByTestId('options-slot')).toBeInTheDocument();
    });

    rerender(modal(false));
    rerender(modal(true));

    await waitFor(() => {
      expect(screen.getByTestId('options-slot')).toHaveAttribute('data-is-edit', 'false');
    });
  });
});
