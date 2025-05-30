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

import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconDelete,
  IconEdit,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import EventInner from '~sq-server-commons/components/activity-graph/EventInner';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  AnalysisEvent,
  ProjectAnalysisEventCategory,
} from '~sq-server-commons/types/project-activity';
import ChangeEventForm from './forms/ChangeEventForm';
import RemoveEventForm from './forms/RemoveEventForm';

export interface EventProps {
  analysisKey: string;
  canAdmin?: boolean;
  event: AnalysisEvent;
  isFirst?: boolean;
}

function Event(props: Readonly<EventProps>) {
  const { analysisKey, event, canAdmin, isFirst } = props;
  const intl = useIntl();

  const [changing, setChanging] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const isOther = event.category === ProjectAnalysisEventCategory.Other;
  const isVersion = event.category === ProjectAnalysisEventCategory.Version;
  const canChange = isOther || isVersion;
  const canDelete = isOther || (isVersion && !isFirst);
  const showActions = canAdmin && (canChange || canDelete);

  const editEventLabel = intl.formatMessage(
    { id: 'project_activity.events.tooltip.edit' },
    { event: `${event.category} ${event.name}` },
  );
  const deleteEventLabel = intl.formatMessage(
    { id: 'project_activity.events.tooltip.delete' },
    { event: `${event.category} ${event.name}` },
  );

  return (
    <div className="it__project-activity-event sw-flex sw-justify-between">
      <EventInner event={event} />

      {showActions && (
        <div className="sw-grow-0 sw-shrink-0 sw-ml-2">
          {canChange && (
            <ButtonIcon
              Icon={IconEdit}
              ariaLabel={editEventLabel}
              className="-sw-mt-1"
              data-test="project-activity__edit-event"
              onClick={() => {
                setChanging(true);
              }}
              size={ButtonSize.Medium}
              tooltipContent={editEventLabel}
              variety={ButtonVariety.PrimaryGhost}
            />
          )}
          {canDelete && (
            <ButtonIcon
              Icon={IconDelete}
              ariaLabel={deleteEventLabel}
              className="-sw-mt-1"
              data-test="project-activity__delete-event"
              onClick={() => {
                setDeleting(true);
              }}
              size={ButtonSize.Medium}
              tooltipContent={deleteEventLabel}
              variety={ButtonVariety.DangerGhost}
            />
          )}
        </div>
      )}

      {changing && (
        <ChangeEventForm
          event={event}
          header={
            isVersion
              ? translate('project_activity.change_version')
              : translate('project_activity.change_custom_event')
          }
          onClose={() => {
            setChanging(false);
          }}
        />
      )}

      {deleting && (
        <RemoveEventForm
          analysisKey={analysisKey}
          event={event}
          header={
            isVersion
              ? translate('project_activity.remove_version')
              : translate('project_activity.remove_custom_event')
          }
          onClose={() => {
            setDeleting(false);
          }}
          removeEventQuestion={translate(
            `project_activity.${isVersion ? 'remove_version' : 'remove_custom_event'}.question`,
          )}
        />
      )}
    </div>
  );
}

export default React.memo(Event);
