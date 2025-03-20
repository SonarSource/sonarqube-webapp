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
import { TopBar } from '~design-system';
import NCDAutoUpdateMessage from '~sq-server-shared/components/new-code-definition/NCDAutoUpdateMessage';
import { ComponentMissingMqrMetricsMessage } from '~sq-server-shared/components/shared/ComponentMissingMqrMetricsMessage';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { getBranchLikeDisplayName } from '~sq-server-shared/helpers/branch-like';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getPrimaryLanguage } from '~sq-server-shared/helpers/measures';
import { isDefined } from '~sq-server-shared/helpers/types';
import { useCurrentBranchQuery } from '~sq-server-shared/queries/branch';
import { useMeasuresComponentQuery } from '~sq-server-shared/queries/measures';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { ProjectAlmBindingConfigurationErrors } from '~sq-server-shared/types/alm-settings';
import { Feature } from '~sq-server-shared/types/features';
import { Component } from '~sq-server-shared/types/types';
import AutodetectAIBanner from '../../AutodetectAIBanner';
import RecentHistory from '../../RecentHistory';
import ComponentNavProjectBindingErrorNotif from './ComponentNavProjectBindingErrorNotif';
import Header from './Header';
import Menu from './Menu';

export interface ComponentNavProps extends WithAvailableFeaturesProps {
  component: Component;
  isGlobalAdmin?: boolean;
  isInProgress?: boolean;
  isPending?: boolean;
  projectBindingErrors?: ProjectAlmBindingConfigurationErrors;
}

function ComponentNav(props: Readonly<ComponentNavProps>) {
  const { isGlobalAdmin, component, hasFeature, isInProgress, isPending, projectBindingErrors } =
    props;
  const canAdminProject = component?.configuration?.showSettings;

  const { data: branchLike } = useCurrentBranchQuery(component);

  const { data: { component: componentWithMeasures } = {} } = useMeasuresComponentQuery({
    componentKey: component.key,
    metricKeys: [MetricKey.ncloc_language_distribution],
  });

  const primaryLanguage = getPrimaryLanguage(componentWithMeasures);

  const isLanguageSupportedByDesignAndArchitecture = isDefined(primaryLanguage);

  React.useEffect(() => {
    const { breadcrumbs, key, name } = component;
    const { qualifier } = breadcrumbs[breadcrumbs.length - 1];
    if (
      [
        ComponentQualifier.Project,
        ComponentQualifier.Portfolio,
        ComponentQualifier.Application,
      ].includes(qualifier as ComponentQualifier)
    ) {
      RecentHistory.add(key, name, qualifier.toLowerCase());
    }
  }, [component, component.key]);

  const branchName =
    hasFeature(Feature.BranchSupport) || !isDefined(branchLike)
      ? undefined
      : getBranchLikeDisplayName(branchLike);

  return (
    <>
      <TopBar aria-label={translate('qualifier', component.qualifier)} id="context-navigation">
        <div className="sw-min-h-10 sw-flex sw-justify-between">
          <Header component={component} />
        </div>
        <Menu
          component={component}
          isInProgress={isInProgress}
          isLanguageSupportedByDesignAndArchitecture={isLanguageSupportedByDesignAndArchitecture}
          isPending={isPending}
        />
      </TopBar>
      {hasFeature(Feature.AiCodeAssurance) && !isGlobalAdmin && canAdminProject && (
        <AutodetectAIBanner />
      )}
      <NCDAutoUpdateMessage branchName={branchName} component={component} />
      <ComponentMissingMqrMetricsMessage component={component} />
      {projectBindingErrors !== undefined && (
        <ComponentNavProjectBindingErrorNotif component={component} />
      )}
    </>
  );
}

export default withAvailableFeatures(ComponentNav);
