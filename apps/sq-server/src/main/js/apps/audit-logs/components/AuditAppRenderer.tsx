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

import { Heading, Layout, Link, RadioButtonGroup } from '@sonarsource/echoes-react';
import { subDays } from 'date-fns';
import { FormattedMessage, useIntl } from 'react-intl';
import { DateRangePicker } from '~design-system';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { now } from '~sq-server-commons/helpers/dates';
import { translate } from '~sq-server-commons/helpers/l10n';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { HousekeepingPolicy, RangeOption } from '~sq-server-commons/types/audit-logs';
import '../style.css';
import DownloadButton from './DownloadButton';

export interface AuditAppRendererProps {
  dateRange?: { from?: Date; to?: Date };
  downloadStarted: boolean;
  handleDateSelection: (dateRange: { from?: Date; to?: Date }) => void;
  handleOptionSelection: (option: RangeOption) => void;
  handleStartDownload: () => void;
  housekeepingPolicy: HousekeepingPolicy;
  selection: RangeOption;
}

const HOUSEKEEPING_MONTH_THRESHOLD = 30;
const HOUSEKEEPING_TRIMESTER_THRESHOLD = 90;

const HOUSEKEEPING_POLICY_VALUES = {
  [HousekeepingPolicy.Weekly]: 7,
  [HousekeepingPolicy.Monthly]: 30,
  [HousekeepingPolicy.Trimestrial]: 90,
  [HousekeepingPolicy.Yearly]: 365,
};

const getRangeOptions = (housekeepingPolicy: HousekeepingPolicy) => {
  const rangeOptions = [RangeOption.Today, RangeOption.Week];

  if (HOUSEKEEPING_POLICY_VALUES[housekeepingPolicy] >= HOUSEKEEPING_MONTH_THRESHOLD) {
    rangeOptions.push(RangeOption.Month);
  }

  if (HOUSEKEEPING_POLICY_VALUES[housekeepingPolicy] >= HOUSEKEEPING_TRIMESTER_THRESHOLD) {
    rangeOptions.push(RangeOption.Trimester);
  }

  rangeOptions.push(RangeOption.Custom);

  return rangeOptions;
};

export default function AuditAppRenderer(props: Readonly<AuditAppRendererProps>) {
  const { dateRange, downloadStarted, housekeepingPolicy, selection } = props;

  const { formatMessage } = useIntl();

  return (
    <AdminPageTemplate
      description={
        <Layout.PageHeader.Description>
          <p>
            <FormattedMessage id="audit_logs.page.description.1" />
            <br />
            <br />
            <FormattedMessage
              id="audit_logs.page.description.2"
              values={{
                housekeeping: translate('audit_logs.housekeeping_policy', housekeepingPolicy),
                link: (
                  <Link
                    to={{
                      pathname: '/admin/settings',
                      search: queryToSearchString({ category: 'housekeeping' }),
                      hash: '#auditLogs',
                    }}
                  >
                    {translate('audit_logs.page.description.link')}
                  </Link>
                ),
              }}
            />
          </p>
        </Layout.PageHeader.Description>
      }
      title={formatMessage({ id: 'audit_logs.page' })}
    >
      <div className="sw-mb-6">
        <Heading as="h2" hasMarginBottom id="audit-logs-housekeeping-radio-label" size="medium">
          <FormattedMessage id="audit_logs.download" />
        </Heading>

        <RadioButtonGroup
          ariaLabelledBy="audit-logs-housekeeping-radio-label"
          id="audit-logs-housekeeping-radio"
          onChange={props.handleOptionSelection}
          options={getRangeOptions(housekeepingPolicy).map((option) => ({
            label: formatMessage({ id: `audit_logs.range_option.${option}` }),
            value: option,
          }))}
          value={selection}
          width="small"
        />

        <DateRangePicker
          className="sw-w-abs-350 sw-mt-4"
          endClearButtonLabel={formatMessage({ id: 'clear.end' })}
          fromLabel={formatMessage({ id: 'start_date' })}
          maxDate={now()}
          minDate={subDays(now(), HOUSEKEEPING_POLICY_VALUES[housekeepingPolicy])}
          onChange={props.handleDateSelection}
          separatorText={formatMessage({ id: 'to_' })}
          startClearButtonLabel={formatMessage({ id: 'clear.start' })}
          toLabel={formatMessage({ id: 'end_date' })}
          value={dateRange}
        />
      </div>

      <DownloadButton
        dateRange={dateRange}
        downloadStarted={downloadStarted}
        onStartDownload={props.handleStartDownload}
        selection={selection}
      />
    </AdminPageTemplate>
  );
}
