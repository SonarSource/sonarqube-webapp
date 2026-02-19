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

import {
  Button,
  ButtonIcon,
  ButtonVariety,
  DropdownMenu,
  IconChevronDown,
  IconEdit,
} from '@sonarsource/echoes-react';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
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

export function PageActions(props: Readonly<Props>) {
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

      <DropdownMenu
        id="system-logs-download"
        items={
          <>
            <DropdownMenu.ItemLinkDownload
              download={filenameTemplate('app')}
              to={logsUrl + '?name=app'}
            >
              <FormattedMessage id="system.logs.app" />
            </DropdownMenu.ItemLinkDownload>

            <DropdownMenu.ItemLinkDownload
              download={filenameTemplate('ce')}
              to={logsUrl + '?name=ce'}
            >
              <FormattedMessage id="system.logs.ce" />
            </DropdownMenu.ItemLinkDownload>

            {!cluster && (
              <DropdownMenu.ItemLinkDownload
                download={filenameTemplate('es')}
                to={logsUrl + '?name=es'}
              >
                <FormattedMessage id="system.logs.es" />
              </DropdownMenu.ItemLinkDownload>
            )}

            <DropdownMenu.ItemLinkDownload
              download={filenameTemplate('web')}
              to={logsUrl + '?name=web'}
            >
              <FormattedMessage id="system.logs.web" />
            </DropdownMenu.ItemLinkDownload>

            <DropdownMenu.ItemLinkDownload
              download={filenameTemplate('access')}
              to={logsUrl + '?name=access'}
            >
              <FormattedMessage id="system.logs.access" />
            </DropdownMenu.ItemLinkDownload>

            <DropdownMenu.ItemLinkDownload
              download={filenameTemplate('deprecation')}
              to={logsUrl + '?name=deprecation'}
            >
              <FormattedMessage id="system.logs.deprecation" />
            </DropdownMenu.ItemLinkDownload>
          </>
        }
      >
        <Button variety={ButtonVariety.Primary}>
          <FormattedMessage id="system.download_logs" />

          <IconChevronDown className="sw-ml-1" />
        </Button>
      </DropdownMenu>

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
