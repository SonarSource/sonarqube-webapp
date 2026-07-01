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

import { IconCheckCircle, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingChecklistItem } from '~shared/types/onboarding';
import { NO_DATA } from '../dashboardConstants';
import { clampPercent, getSeverityColorForPercent } from '../dashboardSeverity';
import { ChecklistProgressBar } from './ChecklistProgressBar';

/** Frontend copy for the item ids the backend currently emits. */
const KNOWN_ITEMS: Record<string, { descriptionKey: string; titleKey: string }> = {
  discover: {
    titleKey: 'onboarding_dashboard.checklist.item.discover.title',
    descriptionKey: 'onboarding_dashboard.checklist.item.discover.description',
  },
  onboard: {
    titleKey: 'onboarding_dashboard.checklist.item.onboard.title',
    descriptionKey: 'onboarding_dashboard.checklist.item.onboard.description',
  },
  failing: {
    titleKey: 'onboarding_dashboard.checklist.item.failing.title',
    descriptionKey: 'onboarding_dashboard.checklist.item.failing.description',
  },
  'full-ci': {
    titleKey: 'onboarding_dashboard.checklist.item.full-ci.title',
    descriptionKey: 'onboarding_dashboard.checklist.item.full-ci.description',
  },
  'pr-deco': {
    titleKey: 'onboarding_dashboard.checklist.item.pr-deco.title',
    descriptionKey: 'onboarding_dashboard.checklist.item.pr-deco.description',
  },
};

function StatusIcon({ completionPct }: Readonly<{ completionPct: number }>) {
  if (completionPct >= 100) {
    return <IconCheckCircle color="echoes-color-icon-success" />;
  }
  // Color the status dot by the same severity cohort as the progress bar.
  return (
    <span
      className="sw-inline-block sw-rounded-1"
      style={{
        backgroundColor: getSeverityColorForPercent(completionPct),
        height: '0.625rem',
        width: '0.625rem',
      }}
    />
  );
}

interface Props {
  item: OnboardingChecklistItem;
}

export function ChecklistItem({ item }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const configId = Object.keys(KNOWN_ITEMS).find((config) => config === item.id);
  const config = configId ? KNOWN_ITEMS[configId] : undefined;
  const title = config ? formatMessage({ id: config.titleKey }) : item.id;
  const completed = item.completed ?? 0;
  const completionPct = item.completionPct ?? 0;
  const description = config
    ? formatMessage(
        { id: config.descriptionKey },
        {
          completed,
          total: item.total ?? 0,
          remaining: Math.max((item.total ?? 0) - completed, 0),
        },
      )
    : undefined;

  return (
    <div className="sw-flex sw-flex-col sw-gap-2 sw-py-3">
      <div className="sw-flex sw-items-start sw-gap-3">
        <div className="sw-pt-1">
          <StatusIcon completionPct={completionPct} />
        </div>

        <div className="sw-flex sw-min-w-0 sw-grow sw-flex-col">
          <Text isHighlighted>{title}</Text>
          {description !== undefined && (
            <Text isSubtle size={TextSize.Small}>
              {description}
            </Text>
          )}
        </div>

        <Text isHighlighted>
          {item.completionPct === null
            ? NO_DATA
            : formatMessage(
                { id: 'onboarding_dashboard.checklist.percent' },
                { percent: Math.round(clampPercent(item.completionPct)) },
              )}
        </Text>
      </div>

      <ChecklistProgressBar ariaLabel={title} value={completionPct} />
    </div>
  );
}
