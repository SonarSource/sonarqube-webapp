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

import { MessageCallout, MessageVariety, Spinner } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { withComponentContext } from '~adapters/context/withComponentContext';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { LightComponent } from '~shared/types/component';
import { useReleaseHistory } from '../hooks/useReleaseHistory';
import { QualityGateHistoryContent } from './QualityGateHistoryContent';

interface Props {
  component: LightComponent;
}

function QualityGateHistoryApp(props: Readonly<Props>) {
  const { component } = props;
  const { formatMessage } = useIntl();

  const { isLoading, isPreviousVersion, releases, isError } = useReleaseHistory(component.key);

  return (
    <ProjectPageTemplate
      description={formatMessage({ id: 'quality_gate_history.page_description' })}
      disableBranchSelector
      disableQualityGateStatus
      title={formatMessage({ id: 'quality_gate_history.page_title' })}
    >
      <Spinner isLoading={isLoading}>
        {isError ? (
          <MessageCallout className="sw-mt-8" variety={MessageVariety.Danger}>
            <FormattedMessage id="default_error_message" />
          </MessageCallout>
        ) : (
          <QualityGateHistoryContent isPreviousVersion={isPreviousVersion} releases={releases} />
        )}
      </Spinner>
    </ProjectPageTemplate>
  );
}

export default withComponentContext(QualityGateHistoryApp);
