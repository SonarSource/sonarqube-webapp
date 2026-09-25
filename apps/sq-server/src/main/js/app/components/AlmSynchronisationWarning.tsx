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

import { IconCheck, IconWarning, Link, MessageCallout, Spinner } from '@sonarsource/echoes-react';
import { formatDistance } from 'date-fns';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentUser } from '~adapters/helpers/users';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { Permissions } from '~sq-server-commons/types/permissions';
import { AlmSyncStatus } from '~sq-server-commons/types/provisioning';
import { TaskStatuses } from '~sq-server-commons/types/tasks';
import { isLoggedIn } from '~sq-server-commons/types/users';

interface SynchronisationWarningProps {
  data: AlmSyncStatus;
  provisionedBy: AlmKeys.GitHub | AlmKeys.GitLab;
  short?: boolean;
}

type LastSync = NonNullable<AlmSyncStatus['lastSync']>;

interface LastSyncProps {
  info: AlmSyncStatus['lastSync'];
  provisionedBy: AlmKeys.GitHub | AlmKeys.GitLab;
  short?: boolean;
}

function LastSyncAlert({ info, provisionedBy, short }: Readonly<LastSyncProps>) {
  // GitLab's status endpoint (Jackson-serialized) sends explicit `null` for an absent
  // lastSync, unlike GitHub's Gson-based one, which omits the field (`undefined`).
  if (!info) {
    return null;
  }

  return short ? (
    <ShortLastSyncAlert info={info} provisionedBy={provisionedBy} />
  ) : (
    <FullLastSyncAlert info={info} />
  );
}

function ShortLastSyncAlert({
  info,
  provisionedBy,
}: Readonly<{ info: LastSync; provisionedBy: AlmKeys.GitHub | AlmKeys.GitLab }>) {
  const { currentUser } = useCurrentUser();
  // The details link goes to the global admin settings page, which only global admins
  // can reach - hide it for the project-admin-only audience that can see this in "short" mode.
  const isGlobalAdmin =
    isLoggedIn(currentUser) && hasGlobalPermission(currentUser, Permissions.Admin);

  const { finishedAt, status, warningMessage } = info;
  const formattedDate = finishedAt ? formatDistance(new Date(finishedAt), new Date()) : '';

  const detailsLink = isGlobalAdmin ? (
    <Link className="sw-ml-2" to={`/admin/settings?category=authentication&tab=${provisionedBy}`}>
      <FormattedMessage id="settings.authentication.synchronization_details_link" />
    </Link>
  ) : (
    ''
  );

  if (status !== TaskStatuses.Success) {
    return (
      <MessageCallout variety="danger">
        <FormattedMessage
          id="settings.authentication.synchronization_failed_short"
          values={{ details: detailsLink }}
        />
      </MessageCallout>
    );
  }

  return (
    <div className="sw-flex sw-items-center">
      {warningMessage ? (
        <IconWarning className="sw-mr-2" color="echoes-color-icon-warning" />
      ) : (
        <IconCheck className="sw-mr-2" color="echoes-color-icon-success" />
      )}

      <i>
        {warningMessage ? (
          <FormattedMessage
            id="settings.authentication.synchronization_successful.with_warning"
            values={{ date: formattedDate, details: detailsLink }}
          />
        ) : (
          <FormattedMessage
            id="settings.authentication.synchronization_successful"
            values={{ '0': formattedDate }}
          />
        )}
      </i>
    </div>
  );
}

function FullLastSyncAlert({ info }: Readonly<{ info: LastSync }>) {
  const { finishedAt, errorMessage, status, summary, warningMessage } = info;
  const formattedDate = finishedAt ? formatDistance(new Date(finishedAt), new Date()) : '';

  return (
    <>
      <MessageCallout variety={status === TaskStatuses.Success ? 'success' : 'danger'}>
        {status === TaskStatuses.Success ? (
          <>
            <FormattedMessage
              id="settings.authentication.synchronization_successful"
              values={{ '0': formattedDate }}
            />

            <br />

            {summary ?? ''}
          </>
        ) : (
          <React.Fragment key={`synch-alert-${finishedAt}`}>
            <div>
              <FormattedMessage
                id="settings.authentication.synchronization_failed"
                values={{ '0': formattedDate }}
              />
            </div>

            <br />

            {errorMessage ?? ''}
          </React.Fragment>
        )}
      </MessageCallout>

      {warningMessage && <MessageCallout variety="warning">{warningMessage}</MessageCallout>}
    </>
  );
}

export default function AlmSynchronisationWarning(props: Readonly<SynchronisationWarningProps>) {
  const { data, provisionedBy, short } = props;
  const { formatMessage } = useIntl();
  const loadingLabel =
    data.nextSync &&
    formatMessage({
      id:
        data.nextSync.status === TaskStatuses.Pending
          ? 'settings.authentication.synchronization_pending'
          : 'settings.authentication.synchronization_in_progress',
    });

  return (
    <>
      {!short && (
        <div className={data.nextSync ? 'sw-flex sw-gap-2 sw-mb-4' : ''}>
          <Spinner ariaLabel={loadingLabel} isLoading={!!data.nextSync} />

          <div>{data.nextSync && loadingLabel}</div>
        </div>
      )}

      <LastSyncAlert info={data.lastSync} provisionedBy={provisionedBy} short={short} />
    </>
  );
}
