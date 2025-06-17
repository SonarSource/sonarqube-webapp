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

import { Spotlight, SpotlightModalPlacement, SpotlightStep } from '@sonarsource/echoes-react';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { dismissNotice } from '~sq-server-commons/api/users';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { CurrentUserContext } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { QualityGate } from '~sq-server-commons/types/types';
import { NoticeType } from '~sq-server-commons/types/users';

interface Props {
  readonly qualityGate: QualityGate;
}

export default function CaYCConditionsSimplificationGuide({ qualityGate }: Props) {
  const { currentUser, updateDismissedNotices } = React.useContext(CurrentUserContext);

  const intl = useIntl();

  const shouldRun =
    currentUser.isLoggedIn &&
    !currentUser.dismissedNotices[NoticeType.QG_CAYC_CONDITIONS_SIMPLIFICATION];

  const steps: SpotlightStep[] = [
    {
      bodyText: (
        <p>
          <FormattedMessage id="quality_gates.cayc.condition_simplification_tour.page_1.content1" />
        </p>
      ),
      headerText: (
        <FormattedMessage id="quality_gates.cayc.condition_simplification_tour.page_1.title" />
      ),
      placement: SpotlightModalPlacement.Top,
      target: '#cayc-highlight',
    },
    {
      bodyText: (
        <FormattedMessage
          id="quality_gates.cayc.condition_simplification_tour.page_2.content"
          values={{ p: (text) => <p>{text}</p> }}
        >
          {(text) => <div className="sw-gap-2 sw-flex sw-flex-col">{text}</div>}
        </FormattedMessage>
      ),
      headerText: (
        <FormattedMessage id="quality_gates.cayc.condition_simplification_tour.page_2.title" />
      ),
      placement: SpotlightModalPlacement.Right,
      target: '[data-guiding-id="caycConditionsSimplification"]',
    },
    {
      bodyText: (
        <>
          <p className="sw-mb-4">
            <FormattedMessage id="quality_gates.cayc.condition_simplification_tour.page_3.content1" />
          </p>

          <DocumentationLink to={DocLink.IssueStatuses}>
            <FormattedMessage id="quality_gates.cayc.condition_simplification_tour.page_3.content2" />
          </DocumentationLink>
        </>
      ),
      headerText: (
        <FormattedMessage id="quality_gates.cayc.condition_simplification_tour.page_3.title" />
      ),
      placement: SpotlightModalPlacement.Right,
      target: '[data-guiding-id="caycConditionsSimplification"]',
    },
  ];

  const onCallback = async (props: { action: string; type: string }) => {
    if (props.action === 'close' && props.type === 'tour:end' && shouldRun) {
      await dismissNotice(NoticeType.QG_CAYC_CONDITIONS_SIMPLIFICATION);

      updateDismissedNotices(NoticeType.QG_CAYC_CONDITIONS_SIMPLIFICATION, true);
    }
  };

  if (!qualityGate.isBuiltIn) {
    return null;
  }

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
