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

import { Heading, Link } from '@sonarsource/echoes-react';
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
      <div className="sw-p-6 sw-bg-gray-50">
        <div className="sw-flex sw-items-start sw-gap-4">
          <div>
            <Heading as="h3" className="sw-typo-semibold sw-mb-2">
              {formatMessage({ id: 'cost_savings.ai_code.promo_title' })}
            </Heading>
            <p className="sw-text-sm">
              {formatMessage({ id: 'cost_savings.ai_code.promo_description' })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-p-6">
      <div className="sw-flex sw-items-center sw-gap-2 sw-mb-4">
        <Heading as="h2" className="sw-typo-semibold">
          {formatMessage({ id: 'cost_savings.ai_code.title' })}
        </Heading>
        <ConfidenceBadge level="contextual" />
      </div>

      <div className="sw-grid sw-grid-cols-3 sw-gap-4 sw-mb-4">
        <div className="sw-rounded sw-bg-gray-50 sw-p-4">
          <div className="sw-text-2xl sw-font-bold">{aiCodeMetrics.aiPassRate}%</div>
          <div className="sw-text-sm">
            {formatMessage({ id: 'cost_savings.ai_code.pass_rate' })}
          </div>
        </div>

        <div className="sw-rounded sw-bg-gray-50 sw-p-4">
          <div className="sw-text-2xl sw-font-bold">
            {aiCodeMetrics.aiGeneratedIssueCount.toLocaleString()}
          </div>
          <div className="sw-text-sm">
            <Link to={buildAiIssuesUrl(projectKeys)}>
              {formatMessage({ id: 'cost_savings.ai_code.issues_found' })}
            </Link>
          </div>
        </div>

        {aiCodeMetrics.humanVsAiIssueRate && (
          <div className="sw-rounded sw-bg-gray-50 sw-p-4">
            <div className="sw-text-sm sw-font-semibold">
              {formatMessage({ id: 'cost_savings.ai_code.density_comparison' })}
            </div>
            <div className="sw-text-sm sw-mt-1">{aiCodeMetrics.humanVsAiIssueRate}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export { AICodeSection };
