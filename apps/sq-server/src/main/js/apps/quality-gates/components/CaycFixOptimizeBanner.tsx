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
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { CardWithPrimaryBackground } from '~design-system';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import { useMetrics } from '~sq-server-shared/context/metrics/withMetricsContext';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { translate } from '~sq-server-shared/helpers/l10n';
import { Condition, QualityGate } from '~sq-server-shared/types/types';
import CaycReviewUpdateConditionsModal from './ConditionReviewAndUpdateModal';

interface Props {
  conditions: Condition[];
  isOptimizing?: boolean;
  qualityGate: QualityGate;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CaycNonCompliantBanner({
  isOptimizing,
  conditions,
  setEditing,
  qualityGate,
}: Readonly<Props>) {
  const metrics = useMetrics();

  return (
    <CardWithPrimaryBackground className="sw-mt-9 sw-p-8">
      <Heading as="h3" className="sw-mb-2">
        {translate(
          isOptimizing
            ? 'quality_gates.cayc_optimize.banner.title'
            : 'quality_gates.cayc_missing.banner.title',
        )}
      </Heading>
      <div>
        <FormattedMessage
          id={
            isOptimizing
              ? 'quality_gates.cayc_optimize.banner.description'
              : 'quality_gates.cayc_missing.banner.description'
          }
          values={{
            cayc_link: (
              <DocumentationLink to={DocLink.CaYC}>
                {translate('quality_gates.cayc')}
              </DocumentationLink>
            ),
          }}
        />
      </div>

      <CaycReviewUpdateConditionsModal
        canEdit
        conditions={conditions}
        isOptimizing={isOptimizing}
        lockEditing={() => {
          setEditing(false);
        }}
        metrics={metrics}
        qualityGate={qualityGate}
        scope="new-cayc"
      />
    </CardWithPrimaryBackground>
  );
}
