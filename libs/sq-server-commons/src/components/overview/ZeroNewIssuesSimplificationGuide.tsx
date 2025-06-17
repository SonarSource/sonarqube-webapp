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

import { Link, Spotlight, SpotlightModalPlacement, SpotlightStep } from '@sonarsource/echoes-react';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { dismissNotice } from '../../api/users';
import { CurrentUserContext } from '../../context/current-user/CurrentUserContext';
import { QualityGate } from '../../types/types';
import { NoticeType } from '../../types/users';

interface Props {
  qualityGate: QualityGate;
}

export default function ZeroNewIssuesSimplificationGuide({ qualityGate }: Readonly<Props>) {
  const { currentUser, updateDismissedNotices } = React.useContext(CurrentUserContext);

  const intl = useIntl();

  const shouldRun =
    Boolean(qualityGate.isBuiltIn) &&
    currentUser.isLoggedIn &&
    !currentUser.dismissedNotices[NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION];

  const steps: SpotlightStep[] = [
    {
      bodyText: (
        <div className="sw-mb-4 sw-flex sw-flex-col sw-gap-2">
          <FormattedMessage
            id="overview.quality_gates.conditions.condition_simplification_tour.content"
            values={{
              p: (text) => <p>{text}</p>,
              link: (text) => <Link to={`/quality_gates/show/${qualityGate.name}`}>{text}</Link>,
              qualityGateName: qualityGate.name,
            }}
          />
        </div>
      ),
      headerText: (
        <FormattedMessage id="overview.quality_gates.conditions.condition_simplification_tour.title" />
      ),
      placement: SpotlightModalPlacement.Right,
      target: `[data-guiding-id="overviewZeroNewIssuesSimplification"]`,
    },
  ];

  const onCallback = async (props: { action: string; type: string }) => {
    if (props.action === 'close' && props.type === 'tour:end' && shouldRun) {
      await dismissNotice(NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION);

      updateDismissedNotices(NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION, true);
    }
  };

  return (
    <Spotlight
      callback={(args) => {
        void onCallback(args);
      }}
      closeLabel={intl.formatMessage({ id: 'dismiss' })}
      isRunning={shouldRun}
      steps={steps}
    />
  );
}
