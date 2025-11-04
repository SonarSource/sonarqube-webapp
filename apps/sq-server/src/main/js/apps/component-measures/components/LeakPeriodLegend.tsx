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
import { differenceInDays } from 'date-fns';
import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { themeBorder, themeColor } from '~design-system';
import DateFormatter, { longFormatterOption } from '~shared/components/intl/DateFormatter';
import DateFromNow from '~shared/components/intl/DateFromNow';
import DateTimeFormatter, {
  defaultFormatterOptions,
} from '~shared/components/intl/DateTimeFormatter';
import { ComponentQualifier } from '~shared/types/component';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  getNewCodePeriodDate,
  getNewCodePeriodLabel,
} from '~sq-server-commons/helpers/new-code-period';
import { NewCodeDefinitionType } from '~sq-server-commons/types/new-code-definition';
import { ComponentMeasure, Period } from '~sq-server-commons/types/types';

export interface LeakPeriodLegendProps {
  component: ComponentMeasure;
  period: Period;
}

class LeakPeriodLegend extends React.PureComponent<LeakPeriodLegendProps & WrappedComponentProps> {
  formatDate = (date: string) => {
    return this.props.intl.formatDate(date, longFormatterOption);
  };

  formatDateTime = (date: string) => {
    return this.props.intl.formatTime(date, defaultFormatterOptions);
  };

  render() {
    const { component, period } = this.props;

    if (component.qualifier === ComponentQualifier.Application) {
      return (
        <LeakPeriodLabel className="sw-px-2 sw-py-1 sw-rounded-1">
          {translate('issues.new_code_period')}
        </LeakPeriodLabel>
      );
    }

    const leakPeriodLabel = getNewCodePeriodLabel(
      period,
      period.mode === 'manual_baseline' ? this.formatDateTime : this.formatDate,
    );

    const label = (
      <LeakPeriodLabel className="sw-px-2 sw-py-1 sw-rounded-1" isSubtle>
        <Text isHighlighted isSubtle>
          {translate('component_measures.leak_legend.new_code')}
        </Text>{' '}
        {leakPeriodLabel}
      </LeakPeriodLabel>
    );

    if (period.mode === 'days' || period.mode === NewCodeDefinitionType.NumberOfDays) {
      return label;
    }

    const date = getNewCodePeriodDate(period);
    const tooltip = date && (
      <div>
        <DateFromNow date={date} />
        {', '}
        {differenceInDays(new Date(), date) < 1 ? (
          <DateTimeFormatter date={date} />
        ) : (
          <DateFormatter date={date} long />
        )}
      </div>
    );

    return <Tooltip content={tooltip}>{label}</Tooltip>;
  }
}

export default injectIntl(LeakPeriodLegend);

const LeakPeriodLabel = styled(Text)`
  background-color: ${themeColor('newCodeLegend')};
  border: ${themeBorder('default', 'newCodeLegendBorder')};
`;
