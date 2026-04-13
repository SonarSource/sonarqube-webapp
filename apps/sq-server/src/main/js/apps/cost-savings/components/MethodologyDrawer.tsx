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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
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
    <div className="sw-fixed sw-inset-0 sw-z-modal-overlay sw-flex sw-justify-end" role="dialog">
      <div
        className="sw-absolute sw-inset-0"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(41, 0, 66, 0.3)' }}
      />

      <div
        className="sw-relative sw-overflow-y-auto"
        ref={drawerRef}
        style={{
          width: 560,
          backgroundColor: 'white',
          boxShadow: '-8px 0 40px rgba(41, 0, 66, 0.1)',
          padding: 32,
        }}
        tabIndex={-1}
      >
        <div className="sw-flex sw-items-center sw-justify-between sw-mb-8">
          <h2 className="sw-font-bold" style={{ fontSize: 22, color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.methodology.title' })}
          </h2>
          <Button onClick={onClose} variety={ButtonVariety.DefaultGhost}>
            {formatMessage({ id: 'close' })}
          </Button>
        </div>

        {/* Tier A */}
        <section className="sw-mb-8">
          <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 16, color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.methodology.tier_a.title' })}
          </h3>
          <p className="sw-text-sm sw-mb-3" style={{ color: '#69809B', lineHeight: 1.6 }}>
            {formatMessage({
              id: 'cost_savings.methodology.tier_a.description',
            })}
          </p>
          <div
            className="sw-text-sm sw-font-mono sw-mb-3"
            style={{
              borderRadius: 8,
              backgroundColor: '#F7F9FC',
              border: '1px solid rgba(183, 211, 242, 0.4)',
              padding: '12px 16px',
              color: '#126ED3',
            }}
          >
            savings = (remediation_minutes / 60) × hourly_rate × phase_multiplier
          </div>
          <div
            style={{
              borderRadius: 10,
              border: '1px solid rgba(183, 211, 242, 0.4)',
              overflow: 'hidden',
            }}
          >
            <table className="sw-w-full sw-text-sm">
              <thead>
                <tr
                  className="sw-text-left sw-font-semibold"
                  style={{ backgroundColor: '#F7F9FC' }}
                >
                  <th className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                    {formatMessage({
                      id: 'cost_savings.methodology.issue_type',
                    })}
                  </th>
                  <th className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                    {formatMessage({
                      id: 'cost_savings.methodology.multiplier',
                    })}
                  </th>
                  <th className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                    {formatMessage({ id: 'cost_savings.methodology.source' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid rgba(183, 211, 242, 0.3)' }}>
                  <td className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                    {formatMessage({
                      id: 'cost_savings.methodology.bugs_smells',
                    })}
                  </td>
                  <td className="sw-py-2.5 sw-px-4">
                    <span
                      className="sw-inline-flex sw-items-center sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-semibold"
                      style={{ backgroundColor: '#EEF4FC', color: '#126ED3' }}
                    >
                      5x
                    </span>
                  </td>
                  <td className="sw-py-2.5 sw-px-4" style={{ color: '#69809B' }}>
                    Boehm & Basili (2001)
                  </td>
                </tr>
                <tr style={{ borderTop: '1px solid rgba(183, 211, 242, 0.3)' }}>
                  <td className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                    {formatMessage({
                      id: 'cost_savings.methodology.vulnerabilities',
                    })}
                  </td>
                  <td className="sw-py-2.5 sw-px-4">
                    <span
                      className="sw-inline-flex sw-items-center sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-semibold"
                      style={{ backgroundColor: '#EEF4FC', color: '#126ED3' }}
                    >
                      30x
                    </span>
                  </td>
                  <td className="sw-py-2.5 sw-px-4" style={{ color: '#69809B' }}>
                    HackerOne (empirical)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tier B */}
        <section className="sw-mb-8">
          <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 16, color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.methodology.tier_b.title' })}
          </h3>
          <p className="sw-text-sm" style={{ color: '#69809B', lineHeight: 1.6 }}>
            {formatMessage({
              id: 'cost_savings.methodology.tier_b.description',
            })}
          </p>
        </section>

        {/* AI-Assisted Remediation Context */}
        {remediationBreakdown && (
          <section className="sw-mb-8">
            <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 16, color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.methodology.ai_remediation.title' })}
            </h3>
            <div
              className="sw-text-sm sw-mb-3"
              style={{
                borderRadius: 8,
                backgroundColor: '#F7F9FC',
                border: '1px solid rgba(183, 211, 242, 0.4)',
                padding: '12px 16px',
                color: '#69809B',
                lineHeight: 1.6,
              }}
            >
              <p>
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
            <div
              style={{
                borderRadius: 10,
                border: '1px solid rgba(183, 211, 242, 0.4)',
                overflow: 'hidden',
              }}
            >
              <table className="sw-w-full sw-text-sm">
                <tbody>
                  <tr style={{ borderTop: '1px solid rgba(183, 211, 242, 0.3)' }}>
                    <td className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                      {formatMessage({
                        id: 'cost_savings.methodology.ai_remediation.token_consumption',
                      })}
                    </td>
                    <td className="sw-py-2.5 sw-px-4 sw-text-right" style={{ color: '#126ED3' }}>
                      {remediationBreakdown.estimatedTokens.toLocaleString()} tokens ($
                      {remediationBreakdown.estimatedTokenCost.toFixed(2)})
                    </td>
                  </tr>
                  <tr style={{ borderTop: '1px solid rgba(183, 211, 242, 0.3)' }}>
                    <td className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                      {formatMessage({
                        id: 'cost_savings.methodology.ai_remediation.human_review',
                      })}
                    </td>
                    <td className="sw-py-2.5 sw-px-4 sw-text-right" style={{ color: '#126ED3' }}>
                      {remediationBreakdown.humanHours.toFixed(1)} hours (
                      {formatCurrency(remediationBreakdown.humanCost)})
                    </td>
                  </tr>
                  <tr
                    className="sw-font-semibold"
                    style={{
                      borderTop: '1px solid rgba(183, 211, 242, 0.3)',
                      backgroundColor: '#F7F9FC',
                    }}
                  >
                    <td className="sw-py-2.5 sw-px-4" style={{ color: '#290042' }}>
                      {formatMessage({
                        id: 'cost_savings.methodology.ai_remediation.total',
                      })}
                    </td>
                    <td
                      className="sw-py-2.5 sw-px-4 sw-text-right"
                      style={{
                        background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {formatCurrency(remediationBreakdown.totalCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Limitations */}
        <section className="sw-mb-8">
          <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 16, color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.methodology.limitations' })}
          </h3>
          <ul
            className="sw-list-disc sw-pl-5 sw-text-sm sw-flex sw-flex-col sw-gap-2"
            style={{ color: '#69809B', lineHeight: 1.6 }}
          >
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
          <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 16, color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.methodology.references' })}
          </h3>
          <ul className="sw-text-sm sw-flex sw-flex-col sw-gap-2" style={{ color: '#69809B' }}>
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
