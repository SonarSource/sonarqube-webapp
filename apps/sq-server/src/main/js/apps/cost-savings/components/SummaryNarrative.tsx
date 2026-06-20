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

import { ButtonIcon, ButtonVariety, IconCopy, toast } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import type { CostSummary, Period } from '../api/cost-savings-api';
import { useSecurityDetailQuery } from '../hooks/useCostSavings';
import { formatBenchmark, formatCurrency, formatHours } from '../utils/format';

interface Props {
  period: Period;
  projectKeys?: string[];
  summary: CostSummary;
}

const PERIOD_LABELS: Record<Period, string> = {
  month: 'the last month',
  quarter: 'the last quarter',
  year: 'the last 12 months',
  all: 'all time',
};

function SummaryNarrative({ summary, period, projectKeys }: Props) {
  const { formatMessage } = useIntl();
  const { data: securityDetail } = useSecurityDetailQuery(projectKeys);

  const {
    openVulnerabilityCount,
    projectCount,
    timeSavings,
    companyProfile,
    industryBreachBenchmark,
  } = summary;

  const categoryNames =
    securityDetail?.categories
      .slice(0, 3)
      .map((c) => c.category)
      .join(', ') ?? '';

  const categoryCount = securityDetail?.categories.length ?? 0;

  const narrativeText = formatMessage(
    { id: 'cost_savings.narrative.text' },
    {
      benchmarkCost: formatBenchmark(industryBreachBenchmark),
      categoryCount,
      categoryNames,
      hours: formatHours(Math.abs(timeSavings.total.hours)),
      industry: companyProfile.industry,
      periodLabel: PERIOD_LABELS[period],
      projectCount,
      rate: `$${companyProfile.hourlyRate}`,
      timeSaved: formatCurrency(Math.abs(timeSavings.total.dollars)),
      vulnCount: openVulnerabilityCount,
    },
  );

  function handleCopy() {
    navigator.clipboard.writeText(narrativeText).then(() => {
      toast.success({
        description: formatMessage({ id: 'cost_savings.export.copied' }),
        duration: 'short',
      });
    });
  }

  return (
    <div
      className="sw-p-5 sw-flex sw-items-start sw-gap-3"
      style={{
        borderRadius: 12,
        backgroundColor: '#F7F9FC',
        border: '1px solid rgba(183, 211, 242, 0.4)',
      }}
    >
      <p className="sw-text-sm sw-flex-1" style={{ color: '#69809B', lineHeight: 1.7 }}>
        {narrativeText}
      </p>
      <ButtonIcon
        Icon={IconCopy}
        ariaLabel={formatMessage({ id: 'cost_savings.narrative.copy' })}
        onClick={handleCopy}
        variety={ButtonVariety.DefaultGhost}
      />
    </div>
  );
}

export { SummaryNarrative };
