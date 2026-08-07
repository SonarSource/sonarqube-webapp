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
      <div className="sw-flex sw-flex-col sw-items-center sw-py-20 sw-px-8">
        <div
          className="sw-flex sw-items-center sw-justify-center sw-mb-6"
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: '#EEF4FC',
          }}
        >
          <svg
            fill="none"
            height="32"
            stroke="#126ED3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="32"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <h1
          className="sw-font-bold sw-mb-3 sw-text-center"
          style={{ fontSize: 24, color: '#290042' }}
        >
          {formatMessage({ id: 'cost_savings.empty.no_data.title' })}
        </h1>
        <p
          className="sw-text-center sw-mb-6"
          style={{ maxWidth: 520, color: '#69809B', lineHeight: 1.6 }}
        >
          {formatMessage({ id: 'cost_savings.empty.no_data.description' })}
        </p>
        <p
          className="sw-text-sm sw-text-center sw-font-medium"
          style={{ maxWidth: 480, color: '#126ED3' }}
        >
          {formatMessage({ id: 'cost_savings.empty.no_data.cta' })}
        </p>
      </div>
    );
  }

  // no-security-issues: positive framing
  return (
    <div
      className="sw-p-5 sw-flex sw-items-center sw-gap-3"
      style={{
        borderRadius: 12,
        backgroundColor: 'rgba(22, 163, 74, 0.06)',
        border: '1px solid rgba(22, 163, 74, 0.2)',
      }}
    >
      <svg
        fill="none"
        height="20"
        stroke="#16a34a"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      <p className="sw-text-sm sw-font-medium" style={{ color: '#15803d' }}>
        {formatMessage({ id: 'cost_savings.empty.no_security.message' })}
      </p>
    </div>
  );
}

export { EmptyState };
