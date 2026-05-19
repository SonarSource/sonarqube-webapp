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

import {
  Button,
  ButtonVariety,
  DropdownMenu,
  IconCopy,
  IconDownload,
  toast,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import type { CostSummary, Period } from '../api/cost-savings-api';
import { formatCurrency, formatHours } from '../utils/format';

interface Props {
  period: Period;
  summary: CostSummary;
}

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Last Month',
  quarter: 'Last Quarter',
  year: 'Last 12 Months',
  all: 'All Time',
};

function buildClipboardText(summary: CostSummary, period: Period): string {
  const {
    timeSavings,
    resolvedIssueCount,
    vulnerabilityCategoryCount,
    projectCount,
    companyProfile,
  } = summary;

  const periodLabel = PERIOD_LABELS[period];
  const lines = [
    `SonarQube Cost Savings Report \u2014 ${periodLabel}`,
    '',
    `${formatCurrency(Math.abs(timeSavings.total.dollars))} estimated savings from early detection (${formatHours(Math.abs(timeSavings.total.hours))})`,
    `${resolvedIssueCount.toLocaleString()} issues resolved before production`,
    `${vulnerabilityCategoryCount} vulnerability categories monitored across ${projectCount} projects`,
    '',
    `Industry: ${companyProfile.industry} \u00B7 Rate: $${companyProfile.hourlyRate}/hr \u00B7 Region: ${companyProfile.region}`,
  ];

  return lines.join('\n');
}

function handleCopySummary(summary: CostSummary, period: Period, successMessage: string) {
  const text = buildClipboardText(summary, period);
  navigator.clipboard.writeText(text).then(() => {
    toast.success({ description: successMessage, duration: 'short' });
  });
}

function handlePrintExport() {
  window.print();
}

function ExportButton({ summary, period }: Props) {
  const { formatMessage } = useIntl();

  return (
    <DropdownMenu
      items={
        <>
          <DropdownMenu.ItemButton
            onClick={() =>
              handleCopySummary(
                summary,
                period,
                formatMessage({ id: 'cost_savings.export.copied' }),
              )
            }
            prefix={<IconCopy />}
          >
            {formatMessage({ id: 'cost_savings.export.copy_summary' })}
          </DropdownMenu.ItemButton>
          <DropdownMenu.ItemButton onClick={handlePrintExport} prefix={<IconDownload />}>
            {formatMessage({ id: 'cost_savings.export.print' })}
          </DropdownMenu.ItemButton>
        </>
      }
    >
      <Button variety={ButtonVariety.Default}>
        {formatMessage({ id: 'cost_savings.export.label' })}
      </Button>
    </DropdownMenu>
  );
}

export { ExportButton };
