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

import { Heading } from '@sonarsource/echoes-react';
import { ContentCell, NumericalCell, Table, TableRow } from '~design-system';
import { Metric } from '~shared/types/measures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Condition as ConditionType, QualityGate } from '~sq-server-commons/types/types';
import Condition from './Condition';

interface Props {
  canEdit: boolean;
  conditions: ConditionType[];
  isCaycModal?: boolean;
  metrics: Record<string, Metric>;
  qualityGate: QualityGate;
  scope: 'new' | 'overall' | 'new-cayc';
  showEdit?: boolean;
}

function Header() {
  return (
    <TableRow>
      <ContentCell>
        <Heading as="h4">{translate('quality_gates.conditions.metric')}</Heading>
      </ContentCell>
      <ContentCell>
        <Heading as="h4">{translate('quality_gates.conditions.operator')}</Heading>
      </ContentCell>
      <NumericalCell>
        <Heading as="h4">{translate('quality_gates.conditions.value')}</Heading>
      </NumericalCell>
      <ContentCell />
    </TableRow>
  );
}

export default function ConditionsTable({
  qualityGate,
  metrics,
  canEdit,
  scope,
  conditions,
  isCaycModal,
  showEdit,
}: Readonly<Props>) {
  return (
    <Table
      className="sw-my-2"
      columnCount={4}
      columnWidths={['auto', '150px', '150px', '200px']}
      data-test={`quality-gates__conditions-${scope}`}
      data-testid={`quality-gates__conditions-${scope}`}
      header={<Header />}
    >
      {conditions.map((condition) => (
        <Condition
          canEdit={canEdit}
          condition={condition}
          isCaycModal={isCaycModal}
          key={condition.id}
          metric={metrics[condition.metric]}
          qualityGate={qualityGate}
          showEdit={showEdit}
        />
      ))}
    </Table>
  );
}
