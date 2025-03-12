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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, Modal, SubHeading, Title } from '~design-system';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { useDocUrl } from '~sq-server-shared/helpers/docs';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { getWeakMissingAndNonCaycConditions } from '~sq-server-shared/helpers/quality-gates';
import { useFixQualityGateMutation } from '~sq-server-shared/queries/quality-gates';
import { Condition, Dict, Metric, QualityGate } from '~sq-server-shared/types/types';
import ConditionsTable from './ConditionsTable';

interface Props {
  canEdit: boolean;
  conditions: Condition[];
  isOptimizing?: boolean;
  lockEditing: () => void;
  metrics: Dict<Metric>;
  onClose: () => void;
  qualityGate: QualityGate;
  scope: 'new' | 'overall' | 'new-cayc';
}

export default function CaycReviewUpdateConditionsModal(props: Readonly<Props>) {
  const { conditions, qualityGate, metrics, lockEditing, onClose, isOptimizing } = props;
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

  const docUrl = useDocUrl(DocLink.CaYC);

  const updateCaycQualityGate = React.useCallback(async () => {
    await fixQualityGate({ weakConditions, missingConditions });
    lockEditing();
  }, [fixQualityGate, weakConditions, missingConditions, lockEditing]);

  const body = (
    <div className="sw-mb-10">
      <SubHeading as="p" className="sw-typo-default">
        <FormattedMessage
          id={
            isOptimizing
              ? 'quality_gates.cayc.review_optimize_modal.description1'
              : 'quality_gates.cayc.review_update_modal.description1'
          }
          values={{
            cayc_link: <Link to={docUrl}>{translate('quality_gates.cayc')}</Link>,
          }}
        />
      </SubHeading>

      {sortedMissingConditions.length > 0 && (
        <>
          <Title as="h4" className="sw-mb-2 sw-mt-4 sw-typo-semibold">
            {translateWithParameters(
              'quality_gates.cayc.review_update_modal.add_condition.header',
              sortedMissingConditions.length,
            )}
          </Title>
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
          <Title as="h4" className="sw-mb-2 sw-mt-4 sw-typo-semibold">
            {translateWithParameters(
              'quality_gates.cayc.review_update_modal.modify_condition.header',
              sortedWeakConditions.length,
            )}
          </Title>
          <ConditionsTable
            {...props}
            conditions={sortedWeakConditions}
            isCaycModal
            showEdit={false}
          />
        </>
      )}

      <Title as="h4" className="sw-mb-2 sw-mt-4 sw-typo-semibold">
        {translate('quality_gates.cayc.review_update_modal.description2')}
      </Title>
    </div>
  );

  return (
    <Modal
      body={body}
      headerTitle={translateWithParameters(
        isOptimizing
          ? 'quality_gates.cayc.review_optimize_modal.header'
          : 'quality_gates.cayc.review_update_modal.header',
        qualityGate.name,
      )}
      isLarge
      onClose={onClose}
      primaryButton={
        <Button
          hasAutoFocus
          id="fix-quality-gate"
          onClick={updateCaycQualityGate}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate(
            isOptimizing
              ? 'quality_gates.cayc.review_optimize_modal.confirm_text'
              : 'quality_gates.cayc.review_update_modal.confirm_text',
          )}
        </Button>
      }
      secondaryButtonLabel={translate('close')}
    />
  );
}
