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

import styled from '@emotion/styled';
import { Text } from '@sonarsource/echoes-react';
import { Component, ReactNode, useRef } from 'react';
import { useIntl } from 'react-intl';
import { reportError } from '~adapters/helpers/report-error';
import {
  getDashboardErrorReportingPayload,
  isTransientDashboardWidgetFetchError,
} from '~shared/helpers/dashboard-error-reporting';
import { isDefined } from '~shared/helpers/types';
import { useIntersectionObserver } from '~shared/hooks/useIntersectionObserver';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { WidgetMode } from '../../types/widget-common';
import { createWidgetElement, WidgetInstance } from '../logic/types';
import { WidgetInstanceProvider } from './WidgetInstanceContext';
import { useWidgetMaps } from './WidgetMapsContext';

function WidgetErrorDisplay() {
  const intl = useIntl();

  return (
    <div className="sw-flex sw-flex-col sw-align-center sw-items-center sw-my-12">
      <div>
        <Text colorOverride="echoes-color-text-danger" isHighlighted>
          {intl.formatMessage({ id: 'dashboard.widget.error' })}
        </Text>
      </div>
      <div>
        <Text>{intl.formatMessage({ id: 'dashboard.widget.error.description' })}</Text>
      </div>
    </div>
  );
}

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetKey: string;
  widgetType: string;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  isTransientFetchError: boolean;
}

class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  static getDerivedStateFromError(caught: unknown): WidgetErrorBoundaryState {
    return {
      hasError: true,
      isTransientFetchError: isTransientDashboardWidgetFetchError(caught),
    };
  }

  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isTransientFetchError: false };
  }

  componentDidUpdate(prevProps: WidgetErrorBoundaryProps) {
    if (
      this.state.hasError &&
      (prevProps.widgetKey !== this.props.widgetKey ||
        prevProps.widgetType !== this.props.widgetType)
    ) {
      this.setState({ hasError: false, isTransientFetchError: false });
    }
  }

  componentDidCatch(caught: unknown, errorInfo: React.ErrorInfo) {
    const { context, message, serialized } = getDashboardErrorReportingPayload(caught, errorInfo, {
      widgetKey: this.props.widgetKey,
      widgetType: this.props.widgetType,
    });

    // eslint-disable-next-line no-console
    console.error('Widget error:', serialized);

    if (isTransientDashboardWidgetFetchError(caught)) {
      return;
    }

    reportError(`Dashboard widget rendering error: ${message}`, context);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isTransientFetchError) {
        return <WidgetNoData />;
      }

      return <WidgetErrorDisplay />;
    }

    return this.props.children;
  }
}

interface WidgetContentProps<WidgetPropMap extends {}> {
  mode: WidgetMode;
  widget: WidgetInstance<WidgetPropMap>;
}

const WidgetContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  justify-content: center;
`;

export function WidgetContent<WidgetPropMap extends {}>({
  mode,
  widget,
}: Readonly<WidgetContentProps<WidgetPropMap>>) {
  const { bodyMap } = useWidgetMaps<WidgetPropMap>();
  const props = isDefined(mode) ? widget.props : { ...widget.props, mode };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const intersectionEntry = useIntersectionObserver(wrapperRef, {
    freezeOnceVisible: true,
    rootMargin: '200px 0px',
  });
  const isVisible = intersectionEntry?.isIntersecting ?? false;

  return (
    <WidgetContentWrapper data-testid="widget-content" ref={wrapperRef}>
      <WidgetErrorBoundary widgetKey={widget.key} widgetType={String(widget.type)}>
        <WidgetInstanceProvider dimensions={widget.dimensions} widgetKey={widget.key}>
          {isVisible ? createWidgetElement(bodyMap, widget.type, props) : <WidgetLoadingSpinner />}
        </WidgetInstanceProvider>
      </WidgetErrorBoundary>
    </WidgetContentWrapper>
  );
}
