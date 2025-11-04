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

import { FormattedMessage, useIntl } from 'react-intl';
import { ExecutionFlowIcon } from '~design-system';
import { FlowType, Issue } from '~sq-server-commons/types/types';

interface Props {
  issue: Pick<Issue, 'flows' | 'flowsWithType' | 'secondaryLocations'>;
}

export default function IssueItemLocationsQuantity(props: Props) {
  const { formatMessage } = useIntl();

  const { id, titleValues, values } = getLocationsText(props.issue);

  if (id) {
    return (
      <div className="sw-flex sw-items-center sw-justify-center sw-gap-1 sw-overflow-hidden">
        <ExecutionFlowIcon />
        <span className="sw-truncate" title={formatMessage({ id }, titleValues)}>
          <FormattedMessage id={id} values={values} />
        </span>
      </div>
    );
  }

  return null;
}

function getLocationsText(issue: Props['issue']) {
  const { flows, flowsWithType, secondaryLocations } = issue;

  if (flows.length > 0) {
    return {
      id: 'issues.x_execution_flows',
      titleValues: {
        flowsCount: flows.length,
        flows: flows.length,
      },
      values: {
        flowsCount: flows.length,
        flows: <span className="sw-typo-semibold">{flows.length}</span>,
      },
    };
  } else if (flowsWithType.length > 0) {
    const dataFlows = flowsWithType.filter(({ type }) => type === FlowType.DATA);
    const executionFlows = flowsWithType.filter(({ type }) => type === FlowType.EXECUTION);

    if (dataFlows.length > 0 && executionFlows.length > 0) {
      return {
        id: 'issues.x_data_and_execution_flows',
        titleValues: {
          dataFlows: dataFlows.length,
          dataFlowsCount: dataFlows.length,
          executionFlows: executionFlows.length,
          executionFlowsCount: executionFlows.length,
        },
        values: {
          dataFlows: <span className="sw-typo-semibold">{dataFlows.length}</span>,
          dataFlowsCount: dataFlows.length,
          executionFlows: <span className="sw-typo-semibold">{executionFlows.length}</span>,
          executionFlowsCount: executionFlows.length,
        },
      };
    }

    if (dataFlows.length > 0) {
      return {
        id: 'issues.x_data_flows',
        titleValues: {
          flows: dataFlows.length,
          flowsCount: dataFlows.length,
        },
        values: {
          flows: <span className="sw-typo-semibold">{dataFlows.length}</span>,
          flowsCount: dataFlows.length,
        },
      };
    }

    return {
      id: 'issues.x_execution_flows',
      titleValues: {
        flows: flowsWithType.length,
        flowsCount: flowsWithType.length,
      },
      values: {
        flows: <span className="sw-typo-semibold">{flowsWithType.length}</span>,
        flowsCount: flowsWithType.length,
      },
    };
  } else if (secondaryLocations.length > 0) {
    return {
      id: 'issues.x_locations',
      titleValues: {
        locations: secondaryLocations.length,
        locationsCount: secondaryLocations.length,
      },
      values: {
        locations: <span className="sw-typo-semibold">{secondaryLocations.length}</span>,
        locationsCount: secondaryLocations.length,
      },
    };
  }

  return {};
}
