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

import { Text, ToggleTip } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { StaleTime } from '~shared/queries/common';
import { ComponentContext } from '../../context/componentContext/ComponentContext';
import { translate } from '../../helpers/l10n';
import { AnalysisEvent, ProjectAnalysisEventCategory } from '../../types/project-activity';
import { DefinitionChangeEventInner, isDefinitionChangeEvent } from './DefinitionChangeEventInner';
import { RichQualityGateEventInner, isRichQualityGateEvent } from './RichQualityGateEventInner';
import {
  RichQualityProfileEventInner,
  isRichQualityProfileEvent,
} from './RichQualityProfileEventInner';
import { SqUpgradeActivityEventMessage } from './SqUpgradeActivityEventMessage';

export interface EventInnerProps {
  event: AnalysisEvent;
  readonly?: boolean;
}

export default function EventInner({ event, readonly }: EventInnerProps) {
  const { component } = React.useContext(ComponentContext);
  const { data: branchLike } = useCurrentBranchQuery(component, StaleTime.LONG);
  if (isRichQualityGateEvent(event)) {
    return <RichQualityGateEventInner event={event} readonly={readonly} />;
  } else if (isDefinitionChangeEvent(event)) {
    return <DefinitionChangeEventInner branchLike={branchLike} event={event} readonly={readonly} />;
  } else if (isRichQualityProfileEvent(event)) {
    return (
      <div>
        <Text className="sw-mr-1" isHighlighted isSubtle>
          {translate('event.category', event.category)}
        </Text>
        <Text isSubtle>
          <RichQualityProfileEventInner event={event} />
        </Text>
      </div>
    );
  } else if (event.category === ProjectAnalysisEventCategory.SqUpgrade) {
    return <SqUpgradeActivityEventMessage event={event} />;
  }

  const toggleTipContent =
    event.category && event.category === 'QUALITY_GATE' && event.description
      ? `${translate('event.failed_conditions')} ${event.description}`
      : event.description;

  return (
    <div className="sw-min-w-0 sw-flex-1 sw-py-1/2">
      <div className="sw-flex sw-items-start">
        <span className="sw-inline-flex sw-items-center sw-gap-1">
          <Text isSubtle>
            <strong>
              {translate('event.category', event.category)}
              {event.category === 'VERSION' && ':'}
            </strong>{' '}
            {event.name}
          </Text>
          {toggleTipContent && <ToggleTip description={toggleTipContent} />}
        </span>
      </div>
    </div>
  );
}
