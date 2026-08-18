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

import { Button, ButtonVariety, Modal, ModalSize } from '@sonarsource/echoes-react';
import { Dispatch, ReactNode, useEffect, useReducer } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { WidgetBodyMap, WidgetHeaderMap } from '../../dashboard-layout/logic/types';
import type {
  CompleteWidgetConfig,
  ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import type { WidgetMetricPickerOptions } from '../../types/widget-common';
import { widgetConfigReducer } from '../state/reducers/widgetConfigReducer';
import {
  extractCompleteConfig,
  initializeFromConfig,
  isConfigComplete,
} from '../state/selectors/widgetConfigSelectors';
import type {
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../state/widgetConfigTypes';
import { WidgetCreationModalBody } from './WidgetCreationModalBody';

export enum DashboardAddWidgetModalMode {
  Add = 'add',
  Edit = 'edit',
}

export interface DashboardAddWidgetModalRenderOptionsContext {
  dispatch: Dispatch<WidgetConfigAction>;
  isEditMode: boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
  state: WidgetConfigState;
}

export interface DashboardAddWidgetModalProps {
  initialWidget?: CompleteWidgetConfig;
  isOpen: boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
  mode: DashboardAddWidgetModalMode;
  onOpenChange: (open: boolean) => void;
  onSaveWidget: (props: CompleteWidgetConfig) => void;
  reducerOptions: WidgetConfigReducerOptions;
  renderOptions: (ctx: DashboardAddWidgetModalRenderOptionsContext) => ReactNode;
  widgetBodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap>;
  widgetHeaderMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap>;
}

export function DashboardAddWidgetModal({
  initialWidget,
  isOpen,
  metricPickerOptions,
  mode,
  onOpenChange,
  onSaveWidget,
  reducerOptions,
  renderOptions,
  widgetBodyMap,
  widgetHeaderMap,
}: Readonly<DashboardAddWidgetModalProps>) {
  const intl = useIntl();
  const [state, dispatch] = useReducer(
    (s: WidgetConfigState, a: WidgetConfigAction) => widgetConfigReducer(s, a, reducerOptions),
    { selectedType: null, configs: {} },
  );

  useEffect(() => {
    if (isOpen && mode === DashboardAddWidgetModalMode.Edit && initialWidget) {
      dispatch({ type: 'INITIALIZE', payload: initializeFromConfig(initialWidget) });
    } else if (isOpen && mode === DashboardAddWidgetModalMode.Add) {
      dispatch({ type: 'RESET' });
    }
  }, [isOpen, mode, initialWidget]);

  const handleSaveWidget = () => {
    const completeConfig = extractCompleteConfig(state);
    if (completeConfig) {
      onSaveWidget(completeConfig);
      onOpenChange(false);
      dispatch({ type: 'RESET' });
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      dispatch({ type: 'RESET' });
    }
  };

  const canSave = isConfigComplete(state);
  const isEditMode = mode === DashboardAddWidgetModalMode.Edit;

  return (
    <Modal
      content={
        <WidgetCreationModalBody
          bodyMap={widgetBodyMap}
          extractCompleteConfig={extractCompleteConfig}
          headerMap={widgetHeaderMap}
          options={renderOptions({
            dispatch,
            isEditMode,
            metricPickerOptions,
            state,
          })}
          state={state}
        />
      }
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      primaryButton={
        <Button isDisabled={!canSave} onClick={handleSaveWidget} variety={ButtonVariety.Primary}>
          {isEditMode ? (
            intl.formatMessage({ id: 'dashboard.edit_widget_modal.save' })
          ) : (
            <FormattedMessage id="dashboard.add_widget_modal.add_to_dashboard" />
          )}
        </Button>
      }
      secondaryButton={
        <Button
          onClick={() => {
            handleOpenChange(false);
          }}
          variety={ButtonVariety.Default}
        >
          <FormattedMessage id="cancel" />
        </Button>
      }
      size={ModalSize.Wide}
      title={
        isEditMode ? (
          intl.formatMessage({ id: 'dashboard.edit_widget_modal.title' })
        ) : (
          <FormattedMessage id="dashboard.add_widget_modal.title" />
        )
      }
    />
  );
}
