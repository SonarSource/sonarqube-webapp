/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import * as React from 'react';
import { useState } from 'react';
import { addons } from '~addons/index';
import { CardSeparator, CenteredLayout, PageContentFontWrapper } from '~design-system';
import { AnalysisStatus } from '~sq-server-shared/components/overview/AnalysisStatus';
import LastAnalysisLabel from '~sq-server-shared/components/overview/LastAnalysisLabel';
import QGStatus from '~sq-server-shared/components/overview/QualityGateStatus';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { CurrentUserContext } from '~sq-server-shared/context/current-user/CurrentUserContext';
import { parseDate } from '~sq-server-shared/helpers/dates';
import { translate } from '~sq-server-shared/helpers/l10n';
import { isDiffMetric } from '~sq-server-shared/helpers/measures';
import { CodeScope } from '~sq-server-shared/helpers/urls';
import { useGetValueQuery } from '~sq-server-shared/queries/settings';
import { useDismissNoticeMutation } from '~sq-server-shared/queries/users';
import A11ySkipTarget from '~sq-server-shared/sonar-aligned/components/a11y/A11ySkipTarget';
import { useLocation, useRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { ApplicationPeriod } from '~sq-server-shared/types/application';
import { Branch } from '~sq-server-shared/types/branch-like';
import { Feature } from '~sq-server-shared/types/features';
import { Analysis, GraphType, MeasureHistory } from '~sq-server-shared/types/project-activity';
import { QualityGateStatus } from '~sq-server-shared/types/quality-gates';
import { SettingsKey } from '~sq-server-shared/types/settings';
import {
  Component,
  MeasureEnhanced,
  Metric,
  Period,
  QualityGate,
} from '~sq-server-shared/types/types';
import { NoticeType } from '~sq-server-shared/types/users';
import { Status } from '~sq-server-shared/utils/overview-utils';
import ActivityPanel from './ActivityPanel';
import AICodeStatus from './AICodeStatus';
import BranchMetaTopBar from './BranchMetaTopBar';
import CaycPromotionGuide from './CaycPromotionGuide';
import DismissablePromotedSection from './DismissablePromotedSection';
import FirstAnalysisNextStepsNotif from './FirstAnalysisNextStepsNotif';
import MeasuresPanelNoNewCode from './MeasuresPanelNoNewCode';
import NewCodeMeasuresPanel from './NewCodeMeasuresPanel';
import NoCodeWarning from './NoCodeWarning';
import OverallCodeMeasuresPanel from './OverallCodeMeasuresPanel';
import ReplayTourGuide from './ReplayTour';
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

  const { query } = useLocation();
  const router = useRouter();

  const { currentUser } = React.useContext(CurrentUserContext);
  const { hasFeature } = useAvailableFeatures();
  const { mutateAsync: dismissNotice } = useDismissNoticeMutation();
  const { data: architectureEnabled } = useGetValueQuery({
    key: SettingsKey.DesignAndArchitecture,
  });

  const [startTour, setStartTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [dismissedTour, setDismissedTour] = useState(
    currentUser.isLoggedIn &&
      !!currentUser.dismissedNotices[NoticeType.ONBOARDING_CAYC_BRANCH_SUMMARY_GUIDE],
  );

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

  const dismissPromotedSection = () => {
    dismissNotice(NoticeType.ONBOARDING_CAYC_BRANCH_SUMMARY_GUIDE);

    setDismissedTour(true);
    setShowReplay(true);
  };

  const closeTour = (action: string) => {
    setStartTour(false);
    if (action === 'skip' && !dismissedTour) {
      dismissPromotedSection();
    }

    if (action === 'close' && !dismissedTour) {
      dismissPromotedSection();
      setTourCompleted(true);
    }
  };

  const startTourGuide = () => {
    if (!isNewCodeTab) {
      selectTab(CodeScope.New);
    }
    setShowReplay(false);
    setStartTour(true);
  };

  const qgStatus = qgStatuses?.map((s) => s.status).includes('ERROR') ? Status.ERROR : Status.OK;

  return (
    <>
      <FirstAnalysisNextStepsNotif
        component={component}
        detectedCIOnLastAnalysis={detectedCIOnLastAnalysis}
      />

      {architectureEnabled?.value === 'true' &&
        hasFeature(Feature.Architecture) &&
        addons.architecture?.ArchitectureUserBanner({ projectKey: component.key })}

      <CenteredLayout>
        <PageContentFontWrapper>
          <CaycPromotionGuide closeTour={closeTour} run={startTour} />
          {showReplay && (
            <ReplayTourGuide
              closeTour={() => setShowReplay(false)}
              run={showReplay}
              tourCompleted={tourCompleted}
            />
          )}
          <div className="overview sw-my-6 sw-typo-default">
            <A11ySkipTarget anchor="overview_main" />

            {projectIsEmpty ? (
              <NoCodeWarning branchLike={branch} component={component} measures={measures} />
            ) : (
              <div>
                {branch && (
                  <>
                    <BranchMetaTopBar
                      branch={branch}
                      component={component}
                      measures={measures}
                      showTakeTheTourButton={
                        dismissedTour && currentUser.isLoggedIn && hasNewCodeMeasures
                      }
                      startTour={startTourGuide}
                    />

                    <CardSeparator />

                    {currentUser.isLoggedIn && hasNewCodeMeasures && (
                      <DismissablePromotedSection
                        content={translate('overview.promoted_section.content')}
                        dismissed={dismissedTour ?? false}
                        onDismiss={dismissPromotedSection}
                        onPrimaryButtonClick={startTourGuide}
                        primaryButtonLabel={translate('overview.promoted_section.button_primary')}
                        secondaryButtonLabel={translate(
                          'overview.promoted_section.button_secondary',
                        )}
                        title={translate('overview.promoted_section.title')}
                      />
                    )}
                  </>
                )}
                <div
                  className="sw-flex sw-justify-between sw-items-start sw-my-6"
                  data-testid="overview__quality-gate-panel"
                >
                  <div className="sw-flex sw-items-center">
                    <QGStatus status={qgStatus} />
                    <AICodeStatus branch={branch} component={component} />
                  </div>
                  <LastAnalysisLabel analysisDate={branch?.analysisDate} />
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
                          <MeasuresPanelNoNewCode
                            branch={branch}
                            component={component}
                            period={period}
                          />
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
          </div>
        </PageContentFontWrapper>
      </CenteredLayout>
    </>
  );
}
