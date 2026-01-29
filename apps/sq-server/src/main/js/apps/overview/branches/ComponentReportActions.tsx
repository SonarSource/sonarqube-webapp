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

import { DropdownMenu } from '@sonarsource/echoes-react';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import ComponentReportActionsRenderer from '~sq-server-commons/components/controls/ComponentReportActionsRenderer';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import {
  useGetReportStatusQuery,
  useSubscribeToEmailReportMutation,
  useUnsubscribeFromEmailReportMutation,
} from '~sq-server-commons/queries/subscriptions';
import { AppState } from '~sq-server-commons/types/appstate';
import { Branch } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';

interface Props {
  appState: AppState;
  branch?: Branch;
  component: Component;
  currentUser: CurrentUser;
}

export function ComponentReportActions(props: Readonly<Props>) {
  const { appState, branch, component, currentUser } = props;
  const scaEnabled = useAvailableFeatures().hasFeature(Feature.Sca);
  const { data: status, isLoading } = useGetReportStatusQuery(
    {
      componentKey: component.key,
      branchKey: branch?.name,
    },
    { enabled: appState.qualifiers.includes(ComponentQualifier.Portfolio) },
  );

  const { mutate: subscribe } = useSubscribeToEmailReportMutation();
  const { mutate: unsubscribe } = useUnsubscribeFromEmailReportMutation();

  const handleSubscribe = () => {
    subscribe({
      component,
      branchKey: branch?.name,
    });
  };

  const handleUnsubscribe = () => {
    unsubscribe({
      component,
      branchKey: branch?.name,
    });
  };

  if (isLoading || !status) {
    return null;
  }

  const currentUserHasEmail = isLoggedIn(currentUser) && !!currentUser.email;

  const extraActions =
    scaEnabled && addons.sca ? (
      <>
        <DropdownMenu.Separator />
        <addons.sca.ScaReportOverviewOptions
          branch={branch?.name}
          component={component.key}
          componentName={component.name}
        />
      </>
    ) : null;

  return (
    <ComponentReportActionsRenderer
      branch={branch}
      canSubscribe={status.canSubscribe}
      component={component}
      currentUserHasEmail={currentUserHasEmail}
      extraActions={extraActions}
      frequency={status.componentFrequency || status.globalFrequency}
      handleSubscription={handleSubscribe}
      handleUnsubscription={handleUnsubscribe}
      subscribed={status.subscribed}
    />
  );
}

export default withCurrentUserContext(withAppStateContext(ComponentReportActions));
