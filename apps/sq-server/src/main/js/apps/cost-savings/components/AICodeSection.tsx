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

import { Link } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import type { AICodeMetrics } from '../api/cost-savings-api';
import { ConfidenceBadge } from './ConfidenceBadge';

interface Props {
  aiCodeMetrics?: AICodeMetrics;
  projectKeys?: string[];
}

function buildAiIssuesUrl(projectKeys?: string[]): string {
  const params = new URLSearchParams({
    resolved: 'false',
  });
  if (projectKeys && projectKeys.length > 0) {
    params.set('projects', projectKeys.join(','));
  }
  return `/issues?${params.toString()}`;
}

function AICodeSection({ aiCodeMetrics, projectKeys }: Props) {
  const { formatMessage } = useIntl();

  if (!aiCodeMetrics || !aiCodeMetrics.enabled) {
    return (
      <div className="sw-p-8" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="sw-flex sw-items-start sw-gap-4">
          <div>
            <h3 className="sw-font-bold sw-mb-2" style={{ fontSize: 18, color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.ai_code.promo_title' })}
            </h3>
            <p className="sw-text-sm" style={{ color: '#69809B', lineHeight: 1.6 }}>
              {formatMessage({ id: 'cost_savings.ai_code.promo_description' })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-p-8">
      <div className="sw-flex sw-items-center sw-gap-3 sw-mb-5">
        <h2 className="sw-font-bold" style={{ fontSize: 20, color: '#290042' }}>
          {formatMessage({ id: 'cost_savings.ai_code.title' })}
        </h2>
        <ConfidenceBadge level="contextual" />
      </div>

      <div className="sw-grid sw-grid-cols-3 sw-gap-5">
        <div
          className="sw-p-5 sw-text-center"
          style={{
            borderRadius: 12,
            border: '2px solid rgba(183, 211, 242, 0.5)',
            backgroundColor: 'white',
          }}
        >
          <div
            className="sw-font-bold sw-mb-1"
            style={{
              fontSize: 28,
              background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {aiCodeMetrics.aiPassRate}%
          </div>
          <div className="sw-text-sm sw-font-medium" style={{ color: '#69809B' }}>
            {formatMessage({ id: 'cost_savings.ai_code.pass_rate' })}
          </div>
        </div>

        <div
          className="sw-p-5 sw-text-center"
          style={{
            borderRadius: 12,
            border: '2px solid rgba(183, 211, 242, 0.5)',
            backgroundColor: 'white',
          }}
        >
          <div
            className="sw-font-bold sw-mb-1"
            style={{
              fontSize: 28,
              background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {aiCodeMetrics.aiGeneratedIssueCount.toLocaleString()}
          </div>
          <div className="sw-text-sm sw-font-medium" style={{ color: '#69809B' }}>
            <Link to={buildAiIssuesUrl(projectKeys)}>
              {formatMessage({ id: 'cost_savings.ai_code.issues_found' })}
            </Link>
          </div>
        </div>

        {aiCodeMetrics.humanVsAiIssueRate && (
          <div
            className="sw-p-5"
            style={{
              borderRadius: 12,
              border: '2px solid rgba(183, 211, 242, 0.5)',
              backgroundColor: 'white',
            }}
          >
            <div className="sw-text-sm sw-font-semibold sw-mb-2" style={{ color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.ai_code.density_comparison' })}
            </div>
            <div className="sw-text-sm" style={{ color: '#69809B' }}>
              {aiCodeMetrics.humanVsAiIssueRate}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { AICodeSection };
