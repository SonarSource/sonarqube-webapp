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

import { Card, IconActivity, Text, ToggleButtonGroup } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { QualityGateIndicator } from '~adapters/components/ui/QualityGateIndicator';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { Release, ReleasePeriod } from '../types';
import { computeStats, filterReleasesByPeriod, getLastRelease } from '../utils';
import { QualityGateHistoryEmptyState } from './QualityGateHistoryEmptyState';
import { ReleaseSummaryCards } from './ReleaseSummaryCards';
import { ReleaseTimeline } from './ReleaseTimeline';

interface Props {
  releases: Release[];
}

export function QualityGateHistoryCard(props: Readonly<Props>) {
  const { releases } = props;
  const { formatDate, formatMessage } = useIntl();

  const [period, setPeriod] = useLocalStorage<ReleasePeriod>(
    'qualityGateHistoryPeriod',
    ReleasePeriod.AllTime,
  );

  // The reference "now" is stable for the lifetime of the card so period filtering is consistent.
  const now = useMemo(() => new Date(), []);
  const filteredReleases = useMemo(
    () => filterReleasesByPeriod(releases, period, now),
    [releases, period, now],
  );
  const stats = useMemo(() => computeStats(filteredReleases), [filteredReleases]);
  const lastRelease = useMemo(() => getLastRelease(releases), [releases]);

  const periodOptions = useMemo(
    () => [
      {
        label: formatMessage({ id: 'quality_gate_history.period.all' }),
        value: ReleasePeriod.AllTime,
      },
      {
        label: formatMessage({ id: 'quality_gate_history.period.30d' }),
        value: ReleasePeriod.Last30Days,
      },
      {
        label: formatMessage({ id: 'quality_gate_history.period.6m' }),
        value: ReleasePeriod.Last6Months,
      },
      {
        label: formatMessage({ id: 'quality_gate_history.period.1y' }),
        value: ReleasePeriod.LastYear,
      },
    ],
    [formatMessage],
  );

  return (
    <Card>
      <Card.Body>
        <div className="sw-flex sw-flex-wrap sw-items-center sw-justify-between sw-gap-4">
          <ToggleButtonGroup
            onChange={(value) => {
              setPeriod(value as ReleasePeriod);
            }}
            options={periodOptions}
            selected={period}
          />

          {lastRelease !== undefined && (
            <Text isSubtle size="small">
              <FormattedMessage
                id="quality_gate_history.last_released"
                values={{
                  date: formatDate(lastRelease.date, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }),
                  version: <Text isHighlighted>{lastRelease.version}</Text>,
                }}
              />
            </Text>
          )}
        </div>

        {filteredReleases.length === 0 ? (
          <QualityGateHistoryEmptyState
            className="sw-mt-6"
            description={
              <FormattedMessage id="quality_gate_history.empty.no_releases_in_period.description" />
            }
            icon={<IconActivity color="echoes-color-icon-subtle" />}
            title={
              <FormattedMessage
                id="quality_gate_history.empty.no_releases_in_period.title"
                values={{
                  period: formatMessage({ id: `quality_gate_history.timeframe.${period}` }),
                }}
              />
            }
          />
        ) : (
          <div className="sw-mt-6 sw-flex sw-flex-col sw-gap-6">
            <ReleaseSummaryCards stats={stats} />

            <ReleaseTimeline releases={filteredReleases} />

            <div className="sw-flex sw-w-auto sw-justify-center sw-gap-6">
              {(['OK', 'ERROR'] as const).map((status) => (
                <span className="sw-flex sw-items-center sw-gap-1" key={status}>
                  <QualityGateIndicator size="sm" status={status} />
                  <Text isSubtle size="small">
                    <FormattedMessage id={`quality_gate_history.legend.${status}`} />
                  </Text>
                </span>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
