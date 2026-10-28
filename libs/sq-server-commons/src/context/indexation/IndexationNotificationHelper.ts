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

import { get, remove, save } from '~shared/helpers/storage';
import { getIndexationStatus } from '../../api/ce';
import { IndexationStatus } from '../../types/indexation';

const POLLING_INTERVAL_MS = 5000;
const LS_INDEXATION_COMPLETED_NOTIFICATION_SHOULD_BE_DISPLAYED =
  'display_indexation_completed_notification';
const LS_LAST_INDEXATION_SQS_VERSION = 'last_indexation_sqs_version';

let interval: NodeJS.Timeout | undefined;

function stopPolling() {
  if (interval) {
    clearInterval(interval);
  }
}

async function poll(onNewStatus: (status: IndexationStatus) => void) {
  const status = await getIndexationStatus();

  onNewStatus(status);

  if (status.isCompleted) {
    stopPolling();
  }

  return status;
}

async function startPolling(onNewStatus: (status: IndexationStatus) => void) {
  stopPolling();

  const status = await poll(onNewStatus);

  if (!status.isCompleted) {
    interval = setInterval(() => {
      poll(onNewStatus).catch(() => {
        /* noop */
      });
    }, POLLING_INTERVAL_MS);
  }
}

function markCompletedNotificationAsToDisplay() {
  save(LS_INDEXATION_COMPLETED_NOTIFICATION_SHOULD_BE_DISPLAYED, true.toString());
}

function markCompletedNotificationAsDisplayed() {
  remove(LS_INDEXATION_COMPLETED_NOTIFICATION_SHOULD_BE_DISPLAYED);
}

function shouldDisplayCompletedNotification() {
  return JSON.parse(
    get(LS_INDEXATION_COMPLETED_NOTIFICATION_SHOULD_BE_DISPLAYED) ?? false.toString(),
  );
}

function saveLastIndexationSQSVersion(version: string) {
  save(LS_LAST_INDEXATION_SQS_VERSION, version);
}

function getLastIndexationSQSVersion() {
  return get(LS_LAST_INDEXATION_SQS_VERSION);
}

const IndexationNotificationHelper = {
  startPolling,
  stopPolling,
  poll,
  markCompletedNotificationAsToDisplay,
  markCompletedNotificationAsDisplayed,
  shouldDisplayCompletedNotification,
  saveLastIndexationSQSVersion,
  getLastIndexationSQSVersion,
};

export default IndexationNotificationHelper;
