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

import { ButtonSize, ButtonVariety, Layout, TooltipSide } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useCurrentUser } from '~adapters/helpers/users';
import { CardSeparator } from '~design-system';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import { MeasureEnhanced, Metric } from '~shared/types/measures';
import { addons } from '~sq-server-addons/index';
import Favorite from '~sq-server-commons/components/controls/Favorite';
import HomePageSelect from '~sq-server-commons/components/controls/HomePageSelect';
import { ComponentNavBindingStatus } from '~sq-server-commons/components/nav/ComponentNavBindingStatus';
import { AnalysisStatus } from '~sq-server-commons/components/overview/AnalysisStatus';
import LastAnalysisLabel from '~sq-server-commons/components/overview/LastAnalysisLabel';
import QGStatusComponent from '~sq-server-commons/components/overview/QualityGateStatus';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { parseDate } from '~sq-server-commons/helpers/dates';
import { getComponentAsHomepage } from '~sq-server-commons/helpers/homepage';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import { CodeScope } from '~sq-server-commons/helpers/urls';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { ApplicationPeriod } from '~sq-server-commons/types/application';
import { Branch } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Analysis, GraphType, MeasureHistory } from '~sq-server-commons/types/project-activity';
import { QualityGateStatus } from '~sq-server-commons/types/quality-gates';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { Component, Period, QualityGate } from '~sq-server-commons/types/types';
import { QGStatusEnum } from '~sq-server-commons/utils/overview-utils';
import ActivityPanel from './ActivityPanel';
import AICodeStatus from './AICodeStatus';
import BranchMetaTopBarLegacy from './BranchMetaTopBarLegacy';
import ComponentReportActions from './ComponentReportActions';
import FirstAnalysisNextStepsNotif from './FirstAnalysisNextStepsNotif';
import MeasuresPanelNoNewCode from './MeasuresPanelNoNewCode';
import MetaContentHeader from './MetaContentHeader';
import NewCodeMeasuresPanel from './NewCodeMeasuresPanel';
import NoCodeWarning from './NoCodeWarning';
import OverallCodeMeasuresPanel from './OverallCodeMeasuresPanel';
import TabsPanel from './TabsPanel';

export interface BranchOverviewRendererProps {
  analyses?: Analysis[];
  appLeak?: ApplicationPeriod;
  branch?: Branch;
  component: Component;
  detectedCIOnLastAnalysis?: boolean;
  graph?: GraphType;
  loadingHistory?: boolean;
  loadingStatus?: boolean;
  measures?: MeasureEnhanced[];
  measuresHistory?: MeasureHistory[];
  metrics?: Metric[];
  onGraphChange: (graph: GraphType) => void;
  period?: Period;
  projectIsEmpty?: boolean;
  qgStatuses?: QualityGateStatus[];
  qualityGate?: QualityGate;
}

export default function BranchOverviewRenderer(props: Readonly<BranchOverviewRendererProps>) {
  const {
    analyses,
    appLeak,
    branch,
    component,
    detectedCIOnLastAnalysis,
    graph,
    loadingHistory,
    loadingStatus,
    measures = [],
    measuresHistory = [],
    metrics = [],
    onGraphChange,
    period,
    projectIsEmpty,
    qgStatuses,
    qualityGate,
  } = props;

  const { ArchitectureUserBanner } = addons.architecture ?? {};
  const { isLoggedIn } = useCurrentUser();
  const { query } = useLocation();
  const router = useRouter();
  const intl = useIntl();
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  const { hasFeature } = useAvailableFeatures();
  const { data: architectureEnabled } = useGetValueQuery({
    key: SettingsKey.DesignAndArchitecture,
  });
  const currentPage = getComponentAsHomepage(component, branch);

  const tab = query.codeScope === CodeScope.Overall ? CodeScope.Overall : CodeScope.New;
  const leakPeriod = component.qualifier === ComponentQualifier.Application ? appLeak : period;
  const isNewCodeTab = tab === CodeScope.New;
  const hasNewCodeMeasures = measures.some((m) => isDiffMetric(m.metric.key));

  const selectTab = (tab: CodeScope) => {
    router.replace({ query: { ...query, codeScope: tab } });
  };

  React.useEffect(() => {
    // Open Overall tab by default if there are no new measures.
    if (loadingStatus === false && !hasNewCodeMeasures && isNewCodeTab) {
      selectTab(CodeScope.Overall);
    }
    // In this case, we explicitly do NOT want to mark tab as a dependency, as
    // it would prevent the user from selecting it, even if it's empty.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [loadingStatus, hasNewCodeMeasures]);

  const qgStatus = qgStatuses?.map((s) => s.status).includes('ERROR')
    ? QGStatusEnum.ERROR
    : QGStatusEnum.OK;

  return (
    <ProjectPageTemplate
      actions={
        <Layout.ContentHeader.Actions>
          <ComponentReportActions branch={branch} component={component} />
          {currentPage && <HomePageSelect currentPage={currentPage} type="button" />}
          <ComponentNavBindingStatus component={component} />
          {isLoggedIn && (
            <Favorite
              component={component.key}
              componentName={component.name}
              favorite={Boolean(component.isFavorite)}
              qualifier={component.qualifier}
              side={TooltipSide.Top}
              size={ButtonSize.Large}
              variety={ButtonVariety.Default}
            />
          )}
        </Layout.ContentHeader.Actions>
      }
      callout={
        <>
          <FirstAnalysisNextStepsNotif
            component={component}
            detectedCIOnLastAnalysis={detectedCIOnLastAnalysis}
          />
          {architectureEnabled?.value === 'true' &&
            hasFeature(Feature.Architecture) &&
            isDefined(ArchitectureUserBanner) && (
              <ArchitectureUserBanner projectKey={component.key} />
            )}
        </>
      }
      disableQualityGateStatus
      metadata={<MetaContentHeader branch={branch} component={component} measures={measures} />}
      pageClassName="it__overview"
      title={intl.formatMessage({ id: 'overview.page' })}
    >
      {!frontEndEngineeringEnableSidebarNavigation && (
        <>
          <FirstAnalysisNextStepsNotif
            className="sw-mb-6"
            component={component}
            detectedCIOnLastAnalysis={detectedCIOnLastAnalysis}
          />
          {architectureEnabled?.value === 'true' &&
            hasFeature(Feature.Architecture) &&
            isDefined(ArchitectureUserBanner) && (
              <ArchitectureUserBanner className="sw-mb-6" projectKey={component.key} />
            )}
        </>
      )}
      <A11ySkipTarget anchor="overview_main" />

      {projectIsEmpty ? (
        <NoCodeWarning branchLike={branch} component={component} measures={measures} />
      ) : (
        <div>
          {!frontEndEngineeringEnableSidebarNavigation && branch && (
            <>
              <BranchMetaTopBarLegacy branch={branch} component={component} measures={measures} />

              <CardSeparator className="sw-mb-6" />
            </>
          )}
          <div
            className="sw-flex sw-justify-between sw-items-start sw-mb-6"
            data-testid="overview__quality-gate-panel"
          >
            <div className="sw-flex sw-items-center">
              <QGStatusComponent status={qgStatus} />
              <AICodeStatus branch={branch} component={component} />
            </div>
            {!frontEndEngineeringEnableSidebarNavigation && (
              <LastAnalysisLabel analysisDate={branch?.analysisDate} />
            )}
          </div>
          <AnalysisStatus component={component} />
          <div className="sw-flex sw-flex-col sw-mt-6">
            <TabsPanel
              analyses={analyses}
              component={component}
              isNewCode={isNewCodeTab}
              loading={loadingStatus}
              onTabSelect={selectTab}
              qgStatuses={qgStatuses}
            >
              {isNewCodeTab && (
                <>
                  {hasNewCodeMeasures ? (
                    <NewCodeMeasuresPanel
                      appLeak={appLeak}
                      branch={branch}
                      component={component}
                      loading={loadingStatus}
                      measures={measures}
                      period={period}
                      qgStatuses={qgStatuses}
                      qualityGate={qualityGate}
                    />
                  ) : (
                    <MeasuresPanelNoNewCode branch={branch} component={component} period={period} />
                  )}
                </>
              )}

              {!isNewCodeTab && (
                <OverallCodeMeasuresPanel
                  branch={branch}
                  component={component}
                  loading={loadingStatus}
                  measures={measures}
                  qgStatuses={qgStatuses}
                  qualityGate={qualityGate}
                />
              )}
            </TabsPanel>

            <ActivityPanel
              analyses={analyses}
              branchLike={branch}
              component={component}
              graph={graph}
              leakPeriodDate={leakPeriod && parseDate(leakPeriod.date)}
              loading={loadingHistory}
              measuresHistory={measuresHistory}
              metrics={metrics}
              onGraphChange={onGraphChange}
            />
          </div>
        </div>
      )}
    </ProjectPageTemplate>
  );
}
