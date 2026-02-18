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

import { Button, ButtonIcon, ButtonVariety, IconEdit } from '@sonarsource/echoes-react';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ChevronDownIcon, Dropdown, ItemDownload } from '~design-system';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { PopupZLevel } from '~sq-server-commons/design-system/helpers/positioning';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { EditionKey } from '~sq-server-commons/types/editions';
import { getFileNameSuffix } from '../utils';
import ChangeLogLevelForm from './ChangeLogLevelForm';

interface Props {
  cluster: boolean;
  logLevel: string;
  onLogLevelChange: () => void;
  serverId?: string;
}

export default function PageActions(props: Props) {
  const { cluster, logLevel, onLogLevelChange, serverId } = props;

  const [openLogsLevelForm, setOpenLogsLevelForm] = useState(false);
  const { edition } = useAppState();
  const intl = useIntl();

  const handleLogsLevelOpen = useCallback(() => {
    setOpenLogsLevelForm(true);
  }, []);

  const handleLogsLevelClose = useCallback(() => {
    setOpenLogsLevelForm(false);
  }, []);

  const handleLogsLevelChange = useCallback(() => {
    onLogLevelChange();
    handleLogsLevelClose();
  }, [handleLogsLevelClose, onLogLevelChange]);

  const removeElementFocus = useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    event.currentTarget.blur();
  }, []);

  const infoUrl = getBaseUrl() + '/api/system/info';
  const logsUrl = getBaseUrl() + '/api/system/logs';

  const filenameTemplate = useCallback(
    (name: string) => `sonarqube_${name}.${edition === EditionKey.datacenter ? 'zip' : 'log'}`,
    [edition],
  );

  return (
    <>
      <div className="sw-flex sw-items-center">
        <span>
          <FormattedMessage id="system.logs_level" />
          {': '}
          <strong>{logLevel}</strong>
        </span>
        <ButtonIcon
          Icon={IconEdit}
          ariaLabel={intl.formatMessage({ id: 'system.logs_level.change' })}
          className="sw-ml-1"
          id="edit-logs-level-button"
          onClick={handleLogsLevelOpen}
          variety={ButtonVariety.DefaultGhost}
        />
      </div>

      <Dropdown
        id="system-logs-download"
        overlay={
          <>
            <ItemDownload download={filenameTemplate('app')} href={logsUrl + '?name=app'}>
              Main Process
            </ItemDownload>
            <ItemDownload download={filenameTemplate('ce')} href={logsUrl + '?name=ce'}>
              Compute Engine
            </ItemDownload>

            {!cluster && (
              <ItemDownload download={filenameTemplate('es')} href={logsUrl + '?name=es'}>
                Search Engine
              </ItemDownload>
            )}

            <ItemDownload download={filenameTemplate('web')} href={logsUrl + '?name=web'}>
              Web Server
            </ItemDownload>

            <ItemDownload download={filenameTemplate('access')} href={logsUrl + '?name=access'}>
              Access Logs
            </ItemDownload>

            <ItemDownload
              download={filenameTemplate('deprecation')}
              href={logsUrl + '?name=deprecation'}
            >
              Deprecation Logs
            </ItemDownload>
          </>
        }
        zLevel={PopupZLevel.Global}
      >
        <Button variety={ButtonVariety.Primary}>
          <FormattedMessage id="system.download_logs" />
          <ChevronDownIcon className="sw-ml-1" />
        </Button>
      </Dropdown>

      <Button
        download={`sonarqube-system-info-${getFileNameSuffix(serverId)}.json`}
        id="download-link"
        onClick={removeElementFocus}
        to={infoUrl}
        variety={ButtonVariety.Primary}
      >
        <FormattedMessage id="system.download_system_info" />
      </Button>
      {openLogsLevelForm && (
        <ChangeLogLevelForm
          infoMsg={intl.formatMessage({
            id: cluster ? 'system.cluster_log_level.info' : 'system.log_level.info',
          })}
          logLevel={logLevel}
          onChange={handleLogsLevelChange}
          onClose={handleLogsLevelClose}
        />
      )}
    </>
  );
}
