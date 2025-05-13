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

import { Badge } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { QualityGateIndicator } from '~design-system';
import { isDefinitionChangeEvent } from '~sq-server-commons/components/activity-graph/DefinitionChangeEventInner';
import { isRichQualityGateEvent } from '~sq-server-commons/components/activity-graph/RichQualityGateEventInner';
import {
  RichQualityProfileEventInner,
  isRichQualityProfileEvent,
} from '~sq-server-commons/components/activity-graph/RichQualityProfileEventInner';
import { SqUpgradeActivityEventMessage } from '~sq-server-commons/components/activity-graph/SqUpgradeActivityEventMessage';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  AnalysisEvent,
  ProjectAnalysisEventCategory,
} from '~sq-server-commons/types/project-activity';

interface Props {
  event: AnalysisEvent;
}

export function Event({ event }: Props) {
  if (event.category === ProjectAnalysisEventCategory.Version) {
    return (
      <div>
        <Badge className="sw-px-1 sw-mb-1 sw-inline-flex" variety="highlight">
          {event.name}
        </Badge>
      </div>
    );
  }

  if (event.category === ProjectAnalysisEventCategory.SqUpgrade) {
    return <SqUpgradeActivityEventMessage event={event} />;
  }

  const eventCategory = translate('event.category', event.category);

  if (isRichQualityProfileEvent(event)) {
    return (
      <div className="sw-mb-1">
        <span className="sw-mr-2">{eventCategory}:</span>
        <RichQualityProfileEventInner event={event} />
      </div>
    );
  }

  if (isDefinitionChangeEvent(event)) {
    return <div className="sw-mb-1">{eventCategory}</div>;
  }

  if (isRichQualityGateEvent(event)) {
    return (
      <div className="sw-flex sw-items-center sw-mb-1">
        <span>{eventCategory}:</span>
        <div className="sw-mx-2">
          {event.qualityGate.stillFailing ? (
            <FormattedMessage
              id="event.quality_gate.still_x"
              values={{
                status: <QualityGateIndicator size="sm" status={event.qualityGate.status} />,
              }}
            />
          ) : (
            <QualityGateIndicator size="sm" status={event.qualityGate.status} />
          )}
        </div>
        <span className="sw-typo-semibold">
          {translate(`event.quality_gate.${event.qualityGate.status}`)}
        </span>
      </div>
    );
  }

  return (
    <div className="sw-mb-1">
      <span className="sw-text-ellipsis sw-mr-2">{eventCategory}:</span>
      {event.description ? (
        <span title={event.description}>{event.name}</span>
      ) : (
        <span>{event.name}</span>
      )}
    </div>
  );
}

export default React.memo(Event);
