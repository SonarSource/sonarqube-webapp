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

import { FormattedMessage } from 'react-intl';
import { useAppState } from '../../context/app-state/withAppStateContext';
import { Modal } from '../../design-system';
import { EditionKey } from '../../types/editions';
import { Task } from '../../types/tasks';
import { Component } from '../../types/types';
import { AnalysisErrorMessage } from './AnalysisErrorMessage';
import { AnalysisLicenseError } from './AnalysisLicenseError';

interface Props {
  component: Component;
  currentTask: Task;
  onClose: () => void;
}

export function AnalysisErrorModal(props: Readonly<Props>) {
  const { component, currentTask, onClose } = props;
  const { edition } = useAppState();

  const licenseError =
    edition !== EditionKey.community && currentTask.errorType?.startsWith('LICENSING');

  return (
    <Modal
      body={
        licenseError ? (
          <AnalysisLicenseError currentTask={currentTask} />
        ) : (
          <AnalysisErrorMessage component={component} currentTask={currentTask} onLeave={onClose} />
        )
      }
      headerTitle={<FormattedMessage id="error" />}
      onClose={onClose}
    />
  );
}
