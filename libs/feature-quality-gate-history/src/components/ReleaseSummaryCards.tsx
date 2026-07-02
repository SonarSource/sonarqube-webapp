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

import { Card, Heading, IconDot, LinkStandalone, Text, ToggleTip } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { ReleaseStats } from '../types';

interface Props {
  stats: ReleaseStats;
}

export function ReleaseSummaryCards(props: Readonly<Props>) {
  const { stats } = props;
  const { formatMessage } = useIntl();
  const docUrl = useSharedDocUrl(SharedDocLink.FailedPipelineGate);

  return (
    <div className="sw-grid sw-grid-cols-2 sw-gap-4">
      <SummaryCard
        count={stats.safeCount}
        dotColor="echoes-color-icon-success"
        labelId="quality_gate_history.safe_releases"
        percent={stats.safePercent}
        total={stats.total}
      />

      <SummaryCard
        count={stats.riskyCount}
        dotColor="echoes-color-icon-danger"
        labelId="quality_gate_history.risky_releases"
        percent={stats.riskyPercent}
        toggleTip={
          <ToggleTip
            description={formatMessage({ id: 'quality_gate_history.risky_releases.help' })}
            footer={
              <LinkStandalone enableOpenInNewTab to={docUrl}>
                {formatMessage({ id: 'quality_gate_history.risky_releases.link' })}
              </LinkStandalone>
            }
            title={formatMessage({ id: 'quality_gate_history.risky_releases' })}
          />
        }
        total={stats.total}
      />
    </div>
  );
}

interface SummaryCardProps {
  count: number;
  dotColor: 'echoes-color-icon-success' | 'echoes-color-icon-danger';
  labelId: string;
  percent: number;
  toggleTip?: ReactNode;
  total: number;
}

function SummaryCard(props: Readonly<SummaryCardProps>) {
  const { count, dotColor, labelId, percent, toggleTip, total } = props;
  const { formatMessage } = useIntl();

  return (
    <Card className="sw-gap-2 sw-p-4">
      <div className="sw-flex sw-items-center sw-gap-1">
        <IconDot color={dotColor} isFilled />

        <Text isSubtle size="small">
          <FormattedMessage id={labelId} />
        </Text>
      </div>

      <div className="sw-flex sw-items-center sw-gap-1">
        <Heading as="h3" size="large">
          {formatMessage({ id: 'quality_gate_history.percent' }, { value: percent })}
        </Heading>
        {toggleTip}
      </div>

      <Text isSubtle size="small">
        <FormattedMessage id="quality_gate_history.releases_count" values={{ count, total }} />
      </Text>
    </Card>
  );
}
