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

import { Button, ButtonVariety, Heading } from '@sonarsource/echoes-react';
import { useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import type { RemediationBreakdown } from '../api/cost-savings-api';
import { formatCurrency } from '../utils/format';

interface Props {
  issueCount?: number;
  onClose: () => void;
  remediationBreakdown?: RemediationBreakdown;
}

function MethodologyDrawer({ onClose, remediationBreakdown, issueCount }: Props) {
  const { formatMessage } = useIntl();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management — focus the drawer on mount
  useEffect(() => {
    drawerRef.current?.focus();
  }, []);

  return (
    <div className="sw-fixed sw-inset-0 sw-z-50 sw-flex sw-justify-end" role="dialog">
      <div className="sw-absolute sw-inset-0 sw-bg-black sw-bg-opacity-30" onClick={onClose} />

      <div
        className="sw-relative sw-w-[560px] sw-bg-white sw-shadow-lg sw-overflow-y-auto sw-p-6"
        ref={drawerRef}
        tabIndex={-1}
      >
        <div className="sw-flex sw-items-center sw-justify-between sw-mb-6">
          <Heading as="h2" className="sw-typo-semibold">
            {formatMessage({ id: 'cost_savings.methodology.title' })}
          </Heading>
          <Button onClick={onClose} variety={ButtonVariety.DefaultGhost}>
            {formatMessage({ id: 'close' })}
          </Button>
        </div>

        {/* Tier A */}
        <section className="sw-mb-6">
          <Heading as="h3" className="sw-typo-semibold sw-mb-2">
            {formatMessage({ id: 'cost_savings.methodology.tier_a.title' })}
          </Heading>
          <p className="sw-text-sm sw-mb-2">
            {formatMessage({
              id: 'cost_savings.methodology.tier_a.description',
            })}
          </p>
          <div className="sw-rounded sw-bg-gray-50 sw-p-3 sw-text-sm sw-font-mono sw-mb-2">
            savings = (remediation_minutes / 60) × hourly_rate × phase_multiplier
          </div>
          <table className="sw-w-full sw-text-sm">
            <thead>
              <tr className="sw-text-left sw-font-medium">
                <th className="sw-pb-1">
                  {formatMessage({
                    id: 'cost_savings.methodology.issue_type',
                  })}
                </th>
                <th className="sw-pb-1">
                  {formatMessage({
                    id: 'cost_savings.methodology.multiplier',
                  })}
                </th>
                <th className="sw-pb-1">
                  {formatMessage({ id: 'cost_savings.methodology.source' })}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="sw-border-t">
                <td className="sw-py-1">
                  {formatMessage({
                    id: 'cost_savings.methodology.bugs_smells',
                  })}
                </td>
                <td className="sw-py-1">5x</td>
                <td className="sw-py-1">Boehm & Basili (2001)</td>
              </tr>
              <tr className="sw-border-t">
                <td className="sw-py-1">
                  {formatMessage({
                    id: 'cost_savings.methodology.vulnerabilities',
                  })}
                </td>
                <td className="sw-py-1">30x</td>
                <td className="sw-py-1">HackerOne (empirical)</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Tier B */}
        <section className="sw-mb-6">
          <Heading as="h3" className="sw-typo-semibold sw-mb-2">
            {formatMessage({ id: 'cost_savings.methodology.tier_b.title' })}
          </Heading>
          <p className="sw-text-sm sw-mb-2">
            {formatMessage({
              id: 'cost_savings.methodology.tier_b.description',
            })}
          </p>
        </section>

        {/* AI-Assisted Remediation Context */}
        {remediationBreakdown && (
          <section className="sw-mb-6">
            <Heading as="h3" className="sw-typo-semibold sw-mb-2">
              {formatMessage({ id: 'cost_savings.methodology.ai_remediation.title' })}
            </Heading>
            <div className="sw-rounded sw-bg-gray-50 sw-p-3 sw-text-sm sw-mb-2">
              <p className="sw-mb-2">
                {formatMessage(
                  { id: 'cost_savings.methodology.ai_remediation.description' },
                  {
                    issueCount: issueCount?.toLocaleString() ?? '0',
                    tokens: remediationBreakdown.estimatedTokens.toLocaleString(),
                    tokenCost: `$${remediationBreakdown.estimatedTokenCost.toFixed(2)}`,
                    hours: remediationBreakdown.humanHours.toFixed(1),
                    humanCost: formatCurrency(remediationBreakdown.humanCost),
                    totalCost: formatCurrency(remediationBreakdown.totalCost),
                  },
                )}
              </p>
            </div>
            <table className="sw-w-full sw-text-sm">
              <tbody>
                <tr className="sw-border-t">
                  <td className="sw-py-1">
                    {formatMessage({
                      id: 'cost_savings.methodology.ai_remediation.token_consumption',
                    })}
                  </td>
                  <td className="sw-py-1 sw-text-right">
                    {remediationBreakdown.estimatedTokens.toLocaleString()} tokens ($
                    {remediationBreakdown.estimatedTokenCost.toFixed(2)})
                  </td>
                </tr>
                <tr className="sw-border-t">
                  <td className="sw-py-1">
                    {formatMessage({
                      id: 'cost_savings.methodology.ai_remediation.human_review',
                    })}
                  </td>
                  <td className="sw-py-1 sw-text-right">
                    {remediationBreakdown.humanHours.toFixed(1)} hours (
                    {formatCurrency(remediationBreakdown.humanCost)})
                  </td>
                </tr>
                <tr className="sw-border-t sw-font-semibold">
                  <td className="sw-py-1">
                    {formatMessage({
                      id: 'cost_savings.methodology.ai_remediation.total',
                    })}
                  </td>
                  <td className="sw-py-1 sw-text-right">
                    {formatCurrency(remediationBreakdown.totalCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Limitations */}
        <section className="sw-mb-6">
          <Heading as="h3" className="sw-typo-semibold sw-mb-2">
            {formatMessage({ id: 'cost_savings.methodology.limitations' })}
          </Heading>
          <ul className="sw-list-disc sw-pl-5 sw-text-sm sw-flex sw-flex-col sw-gap-1">
            <li>
              {formatMessage({
                id: 'cost_savings.methodology.limitation_1',
              })}
            </li>
            <li>
              {formatMessage({
                id: 'cost_savings.methodology.limitation_2',
              })}
            </li>
            <li>
              {formatMessage({
                id: 'cost_savings.methodology.limitation_3',
              })}
            </li>
            <li>
              {formatMessage({
                id: 'cost_savings.methodology.limitation_4',
              })}
            </li>
            <li>
              {formatMessage({
                id: 'cost_savings.methodology.limitation_5',
              })}
            </li>
            <li>
              {formatMessage({
                id: 'cost_savings.methodology.limitation_single_scan',
              })}
            </li>
          </ul>
        </section>

        {/* References */}
        <section>
          <Heading as="h3" className="sw-typo-semibold sw-mb-2">
            {formatMessage({ id: 'cost_savings.methodology.references' })}
          </Heading>
          <ul className="sw-text-sm sw-flex sw-flex-col sw-gap-1">
            <li>IBM/Ponemon Cost of a Data Breach 2025</li>
            <li>Verizon Data Breach Investigations Report 2025</li>
            <li>HackerOne Cost Savings Report</li>
            <li>Boehm & Basili, IEEE Computer 2001</li>
            <li>FBI IC3 Annual Report 2024</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export { MethodologyDrawer };
