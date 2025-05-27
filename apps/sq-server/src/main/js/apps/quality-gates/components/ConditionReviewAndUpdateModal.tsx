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
  Button,
  ButtonVariety,
  Heading,
  ModalForm,
  ModalSize,
  Text,
} from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Metric } from '~shared/types/measures';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getWeakMissingAndNonCaycConditions } from '~sq-server-commons/helpers/quality-gates';
import { useFixQualityGateMutation } from '~sq-server-commons/queries/quality-gates';
import { Condition, QualityGate } from '~sq-server-commons/types/types';
import ConditionsTable from './ConditionsTable';

interface Props {
  canEdit: boolean;
  conditions: Condition[];
  isOptimizing?: boolean;
  lockEditing: () => void;
  metrics: Record<string, Metric>;
  qualityGate: QualityGate;
  scope: 'new' | 'overall' | 'new-cayc';
}

export default function CaycReviewUpdateConditionsModal(props: Readonly<Props>) {
  const { conditions, qualityGate, metrics, lockEditing, isOptimizing } = props;
  const { mutateAsync: fixQualityGate } = useFixQualityGateMutation(qualityGate.name);

  const { weakConditions, missingConditions } = getWeakMissingAndNonCaycConditions(conditions);
  const sortedWeakConditions = sortBy(
    weakConditions,
    (condition) => metrics[condition.metric]?.name,
  );

  const sortedMissingConditions = sortBy(
    missingConditions,
    (condition) => metrics[condition.metric]?.name,
  );

  const updateCaycQualityGate = React.useCallback(async () => {
    await fixQualityGate({ weakConditions, missingConditions });
    lockEditing();
  }, [fixQualityGate, weakConditions, missingConditions, lockEditing]);

  const body = (
    <div>
      <Text as="div" className="sw-mb-4">
        <FormattedMessage
          id={
            isOptimizing
              ? 'quality_gates.cayc.review_optimize_modal.description1'
              : 'quality_gates.cayc.review_update_modal.description1'
          }
          values={{
            cayc_link: (
              <DocumentationLink shouldOpenInNewTab to={DocLink.CaYC}>
                {translate('quality_gates.cayc')}
              </DocumentationLink>
            ),
          }}
        />
      </Text>

      {sortedMissingConditions.length > 0 && (
        <>
          <Heading as="h4">
            <FormattedMessage
              id="quality_gates.cayc.review_update_modal.add_condition.header"
              values={{
                count: sortedMissingConditions.length,
              }}
            />
          </Heading>
          <ConditionsTable
            {...props}
            conditions={sortedMissingConditions}
            isCaycModal
            showEdit={false}
          />
        </>
      )}

      {sortedWeakConditions.length > 0 && (
        <>
          <Heading as="h4">
            <FormattedMessage
              id="quality_gates.cayc.review_update_modal.modify_condition.header"
              values={{
                count: sortedWeakConditions.length,
              }}
            />
          </Heading>
          <ConditionsTable
            {...props}
            conditions={sortedWeakConditions}
            isCaycModal
            showEdit={false}
          />
        </>
      )}

      <Heading as="h4" className="sw-mt-4">
        {translate('quality_gates.cayc.review_update_modal.description2')}
      </Heading>
    </div>
  );

  return (
    <ModalForm
      content={body}
      onSubmit={updateCaycQualityGate}
      secondaryButtonLabel={translate('close')}
      size={ModalSize.Wide}
      submitButtonLabel={translate(
        isOptimizing
          ? 'quality_gates.cayc.review_optimize_modal.confirm_text'
          : 'quality_gates.cayc.review_update_modal.confirm_text',
      )}
      title={
        <FormattedMessage
          id={
            isOptimizing
              ? 'quality_gates.cayc.review_optimize_modal.header'
              : 'quality_gates.cayc.review_update_modal.header'
          }
          values={{ qualityGate: qualityGate.name }}
        />
      }
    >
      <Button className="sw-mt-4" variety={ButtonVariety.Primary}>
        {translate(
          isOptimizing
            ? 'quality_gates.cayc_condition.review_optimize'
            : 'quality_gates.cayc_condition.review_update',
        )}
      </Button>
    </ModalForm>
  );
}
