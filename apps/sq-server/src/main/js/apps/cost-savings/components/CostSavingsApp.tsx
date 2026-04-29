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

import { Heading, Layout, Spinner } from '@sonarsource/echoes-react';
import { type ReactNode, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { EditionKey } from '~sq-server-commons/types/editions';
import type { Period } from '../api/cost-savings-api';
import { useCostSummaryQuery, useProjectListQuery } from '../hooks/useCostSavings';
import { formatCurrency } from '../utils/format';
import { AICodeSection } from './AICodeSection';
import { ConfigurationPanel } from './ConfigurationPanel';
import { EmptyState } from './EmptyState';
import { ExecutiveSummary } from './ExecutiveSummary';
import { MethodologyDrawer } from './MethodologyDrawer';
import { ProjectScopeSelector } from './ProjectScopeSelector';
import { ROISection } from './ROISection';
import { SecurityRiskSection } from './SecurityRiskSection';
import { TimeSavedSection } from './TimeSavedSection';

/**
 * Edition gating stub. Currently always returns true.
 */
function useIsEnterpriseOrAbove(): boolean {
  const appState = useAppState();
  const _edition = appState.edition;
  void EditionKey;
  return true;
}

const SECTION_ICONS: Record<string, ReactNode> = {
  time: (
    <svg
      fill="none"
      height="20"
      stroke="#126ED3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  security: (
    <svg
      fill="none"
      height="20"
      stroke="#126ED3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  roi: (
    <svg
      fill="none"
      height="20"
      stroke="#126ED3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  ai: (
    <svg
      fill="none"
      height="20"
      stroke="#126ED3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
      <path d="M16 15a4 4 0 0 1 4 4v2H4v-2a4 4 0 0 1 4-4h8z" />
    </svg>
  ),
};

function CostSavingsApp() {
  const { formatMessage } = useIntl();
  const _isEnterprise = useIsEnterpriseOrAbove();
  const [searchParams, setSearchParams] = useSearchParams();
  const [period, setPeriod] = useState<Period>('year');
  const [showConfig, setShowConfig] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const selectedProjects = useMemo(() => {
    const projectsParam = searchParams.get('projects');
    if (projectsParam) {
      return projectsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, [searchParams]);

  function handleProjectsChange(projects: string[] | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (projects && projects.length > 0) {
        next.set('projects', projects.join(','));
      } else {
        next.delete('projects');
      }
      return next;
    });
  }

  const {
    data: summary,
    isLoading,
    isError: isSummaryError,
  } = useCostSummaryQuery(period, selectedProjects);
  const { data: projectListData } = useProjectListQuery();

  const title = formatMessage({ id: 'cost_savings.page' });

  if (!isLoading && isSummaryError) {
    return (
      <Layout.ContentGrid>
        <Helmet defer={false} title={title} />
        <Layout.PageGrid width="fluid">
          <Layout.PageContent>
            <div className="sw-flex sw-flex-col sw-items-center sw-py-16 sw-px-8">
              <Heading as="h1" className="sw-typo-lg-semibold sw-mb-4">
                {formatMessage({ id: 'cost_savings.error.title' })}
              </Heading>
              <p className="sw-text-center sw-max-w-lg" style={{ color: '#69809B' }}>
                {formatMessage({ id: 'cost_savings.error.description' })}
              </p>
            </div>
          </Layout.PageContent>
          <GlobalFooter />
        </Layout.PageGrid>
      </Layout.ContentGrid>
    );
  }

  if (
    !isLoading &&
    summary &&
    summary.resolvedIssueCount === 0 &&
    summary.openVulnerabilityCount === 0 &&
    summary.timeSavings.total.dollars === 0
  ) {
    return (
      <Layout.ContentGrid>
        <Helmet defer={false} title={title} />
        <Layout.PageGrid width="fluid">
          <Layout.PageContent>
            <EmptyState variant="no-data" />
          </Layout.PageContent>
          <GlobalFooter />
        </Layout.PageGrid>
      </Layout.ContentGrid>
    );
  }

  return (
    <Layout.ContentGrid>
      <Helmet defer={false} title={title} />

      <Layout.PageGrid width="fluid">
        <Layout.PageContent>
          {isLoading ? (
            <div className="sw-flex sw-flex-col sw-items-center sw-py-16 sw-gap-4">
              <Spinner isLoading />
              <p className="sw-text-sm" style={{ color: '#69809B' }}>
                {formatMessage(
                  { id: 'cost_savings.loading' },
                  { count: projectListData?.projects.length ?? '...' },
                )}
              </p>
            </div>
          ) : (
            summary && (
              <div
                className="sw-flex sw-flex-col sw-gap-6"
                style={{ maxWidth: 1120, margin: '0 auto' }}
              >
                {/* Hero: donut chart + cost comparison + key stats + narrative */}
                <ExecutiveSummary
                  onOpenConfig={() => setShowConfig(true)}
                  onOpenMethodology={() => setShowMethodology(true)}
                  onPeriodChange={setPeriod}
                  period={period}
                  projectKeys={selectedProjects}
                  projectScopeSelector={
                    <ProjectScopeSelector
                      onProjectsChange={handleProjectsChange}
                      selectedProjects={selectedProjects}
                    />
                  }
                  summary={summary}
                />

                {/* Collapsible detail sections */}
                <CollapsibleDetail
                  icon={SECTION_ICONS.time}
                  preview={formatCurrency(Math.abs(summary.timeSavings.total.dollars))}
                  title={formatMessage({ id: 'cost_savings.time_saved.title' })}
                >
                  <TimeSavedSection
                    period={period}
                    projectKeys={selectedProjects}
                    summary={summary}
                  />
                </CollapsibleDetail>

                <CollapsibleDetail
                  icon={SECTION_ICONS.security}
                  preview={formatMessage(
                    { id: 'cost_savings.detail_preview.security' },
                    { count: summary.vulnerabilityCategoryCount },
                  )}
                  title={formatMessage({ id: 'cost_savings.security_risk.title' })}
                >
                  <SecurityRiskSection projectKeys={selectedProjects} />
                </CollapsibleDetail>

                {summary.roi && (
                  <CollapsibleDetail
                    icon={SECTION_ICONS.roi}
                    preview={formatMessage(
                      { id: 'cost_savings.detail_preview.roi' },
                      { ratio: summary.roi.ratio.toFixed(1) },
                    )}
                    title={formatMessage({ id: 'cost_savings.roi.title' })}
                  >
                    <ROISection onOpenConfig={() => setShowConfig(true)} roi={summary.roi} />
                  </CollapsibleDetail>
                )}

                {summary.aiCodeMetrics && (
                  <CollapsibleDetail
                    icon={SECTION_ICONS.ai}
                    preview={
                      summary.aiCodeMetrics.enabled
                        ? `${summary.aiCodeMetrics.aiPassRate}% pass rate`
                        : ''
                    }
                    title={formatMessage({ id: 'cost_savings.ai_code.title' })}
                  >
                    <AICodeSection
                      aiCodeMetrics={summary.aiCodeMetrics}
                      projectKeys={selectedProjects}
                    />
                  </CollapsibleDetail>
                )}
              </div>
            )
          )}
        </Layout.PageContent>

        <GlobalFooter />
      </Layout.PageGrid>

      {showConfig && <ConfigurationPanel onClose={() => setShowConfig(false)} />}

      {showMethodology && (
        <MethodologyDrawer
          issueCount={
            summary ? summary.resolvedIssueCount + summary.openVulnerabilityCount : undefined
          }
          onClose={() => setShowMethodology(false)}
          remediationBreakdown={summary?.remediationBreakdown}
        />
      )}
    </Layout.ContentGrid>
  );
}

interface CollapsibleDetailProps {
  children: ReactNode;
  icon?: ReactNode;
  preview: string;
  title: string;
}

function CollapsibleDetail({ title, preview, children, icon }: CollapsibleDetailProps) {
  return (
    <details
      className="sw-overflow-hidden sw-list-none"
      style={{
        borderRadius: 12,
        border: '2px solid rgba(183, 211, 242, 0.6)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <summary
        className="sw-p-5 sw-cursor-pointer sw-flex sw-items-center sw-justify-between sw-select-none sw-list-none [&::-webkit-details-marker]:sw-hidden"
        style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F9FC 100%)' }}
      >
        <div className="sw-flex sw-items-center sw-gap-3">
          {icon && (
            <div
              className="sw-flex sw-items-center sw-justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#EEF4FC',
              }}
            >
              {icon}
            </div>
          )}
          <span className="sw-font-semibold" style={{ color: '#290042', fontSize: 16 }}>
            {title}
          </span>
        </div>
        {preview && (
          <span
            className="sw-text-sm sw-font-semibold"
            style={{
              background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {preview}
          </span>
        )}
      </summary>
      <div style={{ borderTop: '1px solid rgba(183, 211, 242, 0.4)' }}>{children}</div>
    </details>
  );
}

export default CostSavingsApp;
