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

import { Card } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import type { CountWidgetProps } from '../../types/dashboard-widget';
import { PortfolioCountWidgetWrapper } from '../../widget-wrappers/count/PortfolioCountWidgetWrapper';

interface Props {
  title: string;
  widget: CountWidgetProps;
}

export function PortfolioCountDrilldownPreview(props: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Card>
      <Card.Header
        description={
          <WidgetFilterLine
            segments={[formatMessage({ id: `dashboard_widget.codescope.${props.widget.scope}` })]}
          />
        }
        title={props.title}
      />
      <Card.Body className="sw-pb-16">
        <PortfolioCountWidgetWrapper
          metric={props.widget.metric}
          scope={props.widget.scope}
          showTrendIndicator={props.widget.showTrendIndicator}
          suppressPortfolioDrilldownLink
        />
      </Card.Body>
    </Card>
  );
}
