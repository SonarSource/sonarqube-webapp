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

import { Link, LinkHighlight, MessageCallout, MessageVariety } from '@sonarsource/echoes-react';
import { isBefore } from 'date-fns';
import { noop } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentUser } from '~adapters/helpers/users';
import { getAlmSettings } from '../../api/alm-settings';
import { MessageTypes } from '../../api/messages';
import { hasGlobalPermission } from '../../helpers/users';
import {
  useMessageDismissedMutation,
  useMessageDismissedQuery,
} from '../../queries/dismissed-messages';
import { useSupportInformationQuery } from '../../queries/system';
import { AlmKeys, AlmSettingsInstance } from '../../types/alm-settings';
import { Permissions } from '../../types/permissions';

interface BitbucketCloudAppDeprecationMessageProps {
  className?: string;
}

const MAXIMUM_INSTANCE_INSTALLATION_DATE = new Date('2025-09-09');
const APP_PASSWORD_DEACTIVATION_DATE = new Date('2026-06-09');
const BITBUCKET_API_TOKEN_DOCUMENTATION_URL =
  'https://support.atlassian.com/bitbucket-cloud/docs/create-an-api-token/';

export function BitbucketCloudAppDeprecationMessage({
  className,
}: Readonly<BitbucketCloudAppDeprecationMessageProps>) {
  const isFetchingAlmSettings = useRef(false);
  const [bitbucketCloudAlmSettings, setBitbucketCloudAlmSettings] =
    useState<AlmSettingsInstance[]>();

  const { formatMessage } = useIntl();

  const { currentUser } = useCurrentUser();

  const isGlobalAdmin = hasGlobalPermission(currentUser, Permissions.Admin);

  const { data: installationDate, error: supportInformationError } = useSupportInformationQuery({
    enabled: isGlobalAdmin,
    select: (data) => data.statistics.installationDate,
  });
  const { data: isMessageDismissed } = useMessageDismissedQuery(
    {
      messageType: MessageTypes.BitbucketCloudAppDeprecation,
    },
    {
      enabled: isGlobalAdmin,
      select: (data) => data.dismissed,
    },
  );
  const { mutate: dismissMessage } = useMessageDismissedMutation();

  const shouldDisplayBanner = useMemo(() => {
    return (
      isGlobalAdmin &&
      isMessageDismissed === false &&
      Boolean(bitbucketCloudAlmSettings?.length) &&
      isBefore(new Date(), APP_PASSWORD_DEACTIVATION_DATE) &&
      ((installationDate !== undefined &&
        isBefore(new Date(installationDate), MAXIMUM_INSTANCE_INSTALLATION_DATE)) ||
        supportInformationError !== null)
    );
  }, [
    bitbucketCloudAlmSettings,
    installationDate,
    isMessageDismissed,
    isGlobalAdmin,
    supportInformationError,
  ]);

  const onDismissMessage = useCallback(() => {
    dismissMessage({
      messageType: MessageTypes.BitbucketCloudAppDeprecation,
    });
  }, [dismissMessage]);

  useEffect(() => {
    if (
      !isGlobalAdmin ||
      bitbucketCloudAlmSettings !== undefined ||
      isFetchingAlmSettings.current ||
      isMessageDismissed === undefined ||
      isMessageDismissed === true
    ) {
      return;
    }

    isFetchingAlmSettings.current = true;

    getAlmSettings()
      .then((almSettings) => {
        const bbcSettings = almSettings.filter(
          (almSetting) => almSetting.alm === AlmKeys.BitbucketCloud,
        );

        if (bbcSettings.length === 0) {
          onDismissMessage();
          return;
        }

        setBitbucketCloudAlmSettings(bbcSettings);
      })
      .catch(noop);
  }, [bitbucketCloudAlmSettings, isMessageDismissed, isGlobalAdmin, onDismissMessage]);

  if (!shouldDisplayBanner) {
    return null;
  }

  return (
    <MessageCallout
      action={
        <Link highlight={LinkHighlight.Default} to={BITBUCKET_API_TOKEN_DOCUMENTATION_URL}>
          <FormattedMessage id="admin_notification.bitbucket_cloud_app_deprecation.link" />
        </Link>
      }
      className={className}
      onDismiss={onDismissMessage}
      title={formatMessage({ id: 'admin_notification.bitbucket_cloud_app_deprecation.title' })}
      variety={MessageVariety.Info}
    >
      <FormattedMessage id="admin_notification.bitbucket_cloud_app_deprecation.body" />
    </MessageCallout>
  );
}
