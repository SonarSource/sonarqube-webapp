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

import { Spinner } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import type { SecurityCategory } from '../api/cost-savings-api';
import { useSecurityDetailQuery } from '../hooks/useCostSavings';
import { extractFrameworkName } from './ComplianceBadge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { EmptyState } from './EmptyState';
import { NarrativeCard } from './NarrativeCard';

interface Props {
  projectKeys?: string[];
}

function getComplianceSummary(categories: SecurityCategory[]) {
  const allControls = categories.flatMap((cat) => cat.complianceFrameworks ?? []);
  const uniqueControls = [...new Set(allControls)];
  const frameworkNames = [...new Set(allControls.map(extractFrameworkName))].sort();
  return { controlCount: uniqueControls.length, frameworkNames };
}

function SecurityRiskSection({ projectKeys }: Props) {
  const { formatMessage } = useIntl();
  const { data: detail, isLoading } = useSecurityDetailQuery(projectKeys);

  const compliance = useMemo(
    () =>
      detail ? getComplianceSummary(detail.categories) : { controlCount: 0, frameworkNames: [] },
    [detail],
  );

  return (
    <div className="sw-p-8">
      <div className="sw-flex sw-items-center sw-gap-3 sw-mb-3">
        <h2 className="sw-font-bold" style={{ fontSize: 20, color: '#290042' }}>
          {formatMessage({ id: 'cost_savings.security_risk.title' })}
        </h2>
        <ConfidenceBadge level="contextual" />
      </div>

      <p className="sw-text-sm sw-mb-6" style={{ color: '#69809B', lineHeight: 1.6 }}>
        {formatMessage({ id: 'cost_savings.security_risk.description' })}
      </p>

      <Spinner isLoading={isLoading}>
        {detail && (
          <>
            {/* State 3: No security vulnerabilities — positive framing */}
            {detail.categories.length === 0 ? (
              <EmptyState variant="no-security-issues" />
            ) : (
              <div className="sw-flex sw-flex-col sw-gap-4">
                {/* Compliance summary */}
                {compliance.controlCount > 0 && (
                  <p
                    className="sw-text-sm sw-font-medium sw-p-3"
                    style={{
                      borderRadius: 8,
                      backgroundColor: '#EEF4FC',
                      color: '#126ED3',
                      border: '1px solid #B7D3F2',
                    }}
                  >
                    {formatMessage(
                      { id: 'cost_savings.compliance.summary' },
                      {
                        count: compliance.controlCount,
                        frameworks: compliance.frameworkNames.join(', '),
                      },
                    )}
                  </p>
                )}

                {/* Narrative cards for each vulnerability category */}
                {detail.categories.map((cat) => (
                  <NarrativeCard category={cat} key={cat.category} projectKeys={projectKeys} />
                ))}

                {/* SCA dependency risks */}
                {detail.scaDependencyRisks.count > 0 && (
                  <div
                    className="sw-p-5"
                    style={{
                      borderRadius: 12,
                      border: '2px solid rgba(183, 211, 242, 0.5)',
                    }}
                  >
                    <span className="sw-font-semibold" style={{ color: '#290042' }}>
                      {formatMessage({
                        id: 'cost_savings.sca.title',
                      })}
                    </span>
                    <p className="sw-text-sm sw-mt-2" style={{ color: '#69809B', lineHeight: 1.6 }}>
                      {detail.scaDependencyRisks.narrative}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Revenue context — only when configured */}
            {detail.revenueContext && (
              <div
                className="sw-mt-5 sw-p-5"
                style={{
                  borderRadius: 12,
                  backgroundColor: 'rgb(255, 251, 235)',
                  border: '1px solid rgb(253, 230, 138)',
                }}
              >
                <span className="sw-font-semibold sw-text-sm" style={{ color: '#290042' }}>
                  {formatMessage({ id: 'cost_savings.revenue_context.title' })}
                </span>
                <p className="sw-text-sm sw-mt-2" style={{ color: '#69809B', lineHeight: 1.6 }}>
                  {detail.revenueContext.narrative}
                </p>
              </div>
            )}
          </>
        )}
      </Spinner>
    </div>
  );
}

export { SecurityRiskSection };
