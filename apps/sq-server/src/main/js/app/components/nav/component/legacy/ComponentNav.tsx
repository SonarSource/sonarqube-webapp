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

import styled from '@emotion/styled';
import * as React from 'react';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { TopBar } from '~design-system';
import { RecentHistory } from '~shared/helpers/recent-history';
import { isDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import ComponentNavProjectBindingErrorNotif from '~sq-server-commons/components/nav/ComponentNavProjectBindingErrorNotif';
import NCDAutoUpdateMessage from '~sq-server-commons/components/new-code-definition/NCDAutoUpdateMessage';
import { ComponentMissingMqrMetricsMessage } from '~sq-server-commons/components/shared/ComponentMissingMqrMetricsMessage';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { TopBarNewLayoutCompatible } from '~sq-server-commons/design-system/components/TopBar';
import { getBranchLikeDisplayName } from '~sq-server-commons/helpers/branch-like';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import Header from './Header';
import Menu from './Menu';

export interface ComponentNavProps {
  component: Component;
  isInProgress?: boolean;
  isPending?: boolean;
}

// TODO drop this once project scope migration is done
export function LegacyComponentNav(props: Readonly<ComponentNavProps>) {
  const { hasFeature } = useAvailableFeatures();
  const { component, isInProgress, isPending } = props;

  const { data: branchLike } = useCurrentBranchQuery(component);

  React.useEffect(() => {
    const { breadcrumbs, key, name } = component;
    const { qualifier } = breadcrumbs[breadcrumbs.length - 1];
    if (
      [
        ComponentQualifier.Project,
        ComponentQualifier.Portfolio,
        ComponentQualifier.Application,
      ].includes(qualifier)
    ) {
      RecentHistory.add({ key, name, qualifier });
    }
  }, [component, component.key]);

  const branchName =
    hasFeature(Feature.BranchSupport) || !isDefined(branchLike)
      ? undefined
      : getBranchLikeDisplayName(branchLike);

  return (
    <>
      <TopBar aria-label={translate('qualifier', component.qualifier)} id="context-navigation">
        <div className="sw-min-h-1000 sw-flex sw-justify-between">
          <Header component={component} />
        </div>
        <Menu component={component} isInProgress={isInProgress} isPending={isPending} />
      </TopBar>

      <NCDAutoUpdateMessage branchName={branchName} component={component} />
      <ComponentMissingMqrMetricsMessage component={component} />
      <ComponentNavProjectBindingErrorNotif component={component} />
    </>
  );
}

export function LegacyComponentNavCompatibleWithNewLayout(props: Readonly<ComponentNavProps>) {
  const { hasFeature } = useAvailableFeatures();
  const { component, isInProgress, isPending } = props;

  const { data: branchLike } = useCurrentBranchQuery(component);

  React.useEffect(() => {
    const { breadcrumbs, key, name } = component;
    const { qualifier } = breadcrumbs[breadcrumbs.length - 1];
    if (
      [
        ComponentQualifier.Project,
        ComponentQualifier.Portfolio,
        ComponentQualifier.Application,
      ].includes(qualifier)
    ) {
      RecentHistory.add({ key, name, qualifier });
    }
  }, [component, component.key]);

  const branchName =
    hasFeature(Feature.BranchSupport) || !isDefined(branchLike)
      ? undefined
      : getBranchLikeDisplayName(branchLike);

  return (
    <ContentHeader>
      <TopBarNewLayoutCompatible
        aria-label={translate('qualifier', component.qualifier)}
        id="context-navigation"
      >
        <div className="sw-min-h-1000 sw-flex sw-justify-between">
          <Header component={component} />
        </div>
        <Menu component={component} isInProgress={isInProgress} isPending={isPending} />
      </TopBarNewLayoutCompatible>

      <NCDAutoUpdateMessage branchName={branchName} component={component} />

      <ComponentMissingMqrMetricsMessage component={component} />
      <ComponentNavProjectBindingErrorNotif component={component} />
    </ContentHeader>
  );
}

const ContentHeader = styled.div`
  grid-area: content-header;
  position: relative;
`;
