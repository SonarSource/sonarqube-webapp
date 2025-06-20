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

import { Tooltip } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { StaleTime } from '~shared/queries/common';
import { ComponentContext } from '../../context/componentContext/ComponentContext';
import { Note } from '../../design-system';
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
        <Note className="sw-mr-1 sw-typo-semibold">
          {translate('event.category', event.category)}
        </Note>
        <Note>
          <RichQualityProfileEventInner event={event} />
        </Note>
      </div>
    );
  } else if (event.category === ProjectAnalysisEventCategory.SqUpgrade) {
    return <SqUpgradeActivityEventMessage event={event} />;
  }

  const tooltipContent =
    event.category && event.category === 'QUALITY_GATE' && event.description
      ? `${translate('event.failed_conditions')} ${event.description}`
      : event.description;

  return (
    <Tooltip content={tooltipContent}>
      <div className="sw-min-w-0 sw-flex-1 sw-py-1/2">
        <div className="sw-flex sw-items-start">
          <span>
            <Note className="sw-mr-1 sw-typo-semibold">
              {translate('event.category', event.category)}
              {event.category === 'VERSION' && ':'}
            </Note>
            <Note className="sw-typo-default" title={event.description}>
              {event.name}
            </Note>
          </span>
        </div>
      </div>
    </Tooltip>
  );
}
