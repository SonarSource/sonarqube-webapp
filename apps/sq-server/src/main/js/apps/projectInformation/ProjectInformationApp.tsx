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

import { Heading } from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, LargeCenteredLayout, PageContentFontWrapper } from '~design-system';
import { getMeasures } from '~sq-server-shared/api/measures';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-shared/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-shared/context/componentContext/withComponentContext';
import withCurrentUserContext from '~sq-server-shared/context/current-user/withCurrentUserContext';
import withMetricsContext from '~sq-server-shared/context/metrics/withMetricsContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import { isApplication, isProject } from '~sq-server-shared/types/component';
import { Feature } from '~sq-server-shared/types/features';
import { Component, Dict, Measure, Metric } from '~sq-server-shared/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-shared/types/users';
import AboutProject from './about/AboutProject';
import ProjectBadges from './badges/ProjectBadges';
import ProjectNotifications from './notifications/ProjectNotifications';
import RegulatoryReport from './projectRegulatoryReport/RegulatoryReport';

interface Props extends WithAvailableFeaturesProps {
  branchLike?: BranchLike;
  component: Component;
  currentUser: CurrentUser;
  metrics: Dict<Metric>;
  onComponentChange: (changes: {}) => void;
}

function ProjectInformationApp(props: Props) {
  const [measures, setMeasures] = useState<Measure[] | undefined>(undefined);

  const { branchLike, component, currentUser, metrics } = props;

  useEffect(() => {
    const { key } = component;

    getMeasures({
      component: key,
      metricKeys: [MetricKey.ncloc, MetricKey.projects].join(),
    })
      .then((measures) => {
        setMeasures(measures);
      })
      .catch(() => {});
  }, [component]);

  const canConfigureNotifications = isLoggedIn(currentUser) && isProject(component.qualifier);
  const canUseBadges =
    metrics !== undefined && (isApplication(component.qualifier) || isProject(component.qualifier));
  const regulatoryReportFeatureEnabled = props.hasFeature(Feature.RegulatoryReport);
  const isApp = isApplication(component.qualifier);

  const title = translate(isApp ? 'application' : 'project', 'info.title');

  return (
    <main>
      <Helmet defer={false} title={title} />
      <LargeCenteredLayout>
        <PageContentFontWrapper>
          <div className="overview sw-my-6 sw-typo-default">
            <Heading as="h1" className="sw-mb-12">
              {title}
            </Heading>
            <div className="sw-grid sw-grid-cols-[488px_minmax(0,_2fr)] sw-gap-x-12 sw-gap-y-3 sw-auto-rows-min">
              <div className="sw-row-span-3">
                <Card>
                  <AboutProject
                    component={component}
                    measures={measures}
                    onComponentChange={props.onComponentChange}
                  />
                </Card>
              </div>

              {canConfigureNotifications && (
                <Card>
                  <ProjectNotifications component={component} />
                </Card>
              )}
              {canUseBadges && (
                <Card>
                  <ProjectBadges branchLike={branchLike} component={component} />
                </Card>
              )}
              {isProject(component.qualifier) && regulatoryReportFeatureEnabled && (
                <Card>
                  <RegulatoryReport branchLike={branchLike} component={component} />
                </Card>
              )}
            </div>
          </div>
        </PageContentFontWrapper>
      </LargeCenteredLayout>
    </main>
  );
}

export default withComponentContext(
  withCurrentUserContext(withMetricsContext(withAvailableFeatures(ProjectInformationApp))),
);
