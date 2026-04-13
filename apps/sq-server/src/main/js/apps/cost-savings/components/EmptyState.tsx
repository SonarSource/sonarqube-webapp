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

import { Heading } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';

interface Props {
  variant: 'no-data' | 'no-security-issues';
}

/**
 * Empty states as defined in the plan:
 *
 * State 2 (no-data): Zero issues / no scans
 *   - Value proposition page, no fake data
 *   - CTA: "Run your first analysis to start tracking savings"
 *
 * State 3 (no-security-issues): Scans exist but zero security issues
 *   - Positive framing: this is a good outcome, not a missing feature
 *   - Lists categories being scanned
 */
function EmptyState({ variant }: Props) {
  const { formatMessage } = useIntl();

  if (variant === 'no-data') {
    return (
      <div className="sw-flex sw-flex-col sw-items-center sw-py-16 sw-px-8">
        <Heading as="h1" className="sw-typo-lg-semibold sw-mb-4">
          {formatMessage({ id: 'cost_savings.empty.no_data.title' })}
        </Heading>
        <p className="sw-text-center sw-max-w-lg sw-mb-6">
          {formatMessage({ id: 'cost_savings.empty.no_data.description' })}
        </p>
        <p className="sw-text-sm sw-text-center sw-max-w-md">
          {formatMessage({ id: 'cost_savings.empty.no_data.cta' })}
        </p>
      </div>
    );
  }

  // no-security-issues: positive framing
  return (
    <div className="sw-rounded-lg sw-p-4 sw-bg-green-50">
      <p className="sw-text-sm">
        {formatMessage({ id: 'cost_savings.empty.no_security.message' })}
      </p>
    </div>
  );
}

export { EmptyState };
