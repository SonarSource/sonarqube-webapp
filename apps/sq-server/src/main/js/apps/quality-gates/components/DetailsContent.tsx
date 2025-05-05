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

import { Heading, MessageCallout, MessageType, ToggleTip } from '@sonarsource/echoes-react';
import * as React from 'react';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useInvalidateQualityGateQuery } from '~sq-server-commons/queries/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';
import Conditions from './Conditions';
import Projects from './Projects';
import QualityGatePermissions from './QualityGatePermissions';

export interface DetailsContentProps {
  isFetching?: boolean;
  qualityGate: QualityGate;
}

export function DetailsContent(props: DetailsContentProps) {
  const { qualityGate, isFetching } = props;
  const actions = qualityGate.actions ?? {};
  const invalidateQueryCache = useInvalidateQualityGateQuery();

  return (
    <div>
      {qualityGate.isDefault &&
        (qualityGate.conditions === undefined || qualityGate.conditions.length === 0) && (
          <MessageCallout
            className="sw-mb-4"
            text={translate('quality_gates.is_default_no_conditions')}
            type={MessageType.Warning}
          />
        )}

      <Conditions isFetching={isFetching} qualityGate={qualityGate} />

      <div className="sw-mt-10">
        <div className="sw-flex sw-flex-col">
          <Heading as="h3" className="sw-flex sw-items-center sw-typo-lg-semibold sw-mb-4">
            {translate('quality_gates.projects')}
            <ToggleTip className="sw-ml-2" description={translate('quality_gates.projects.help')} />
          </Heading>

          {qualityGate.isDefault ? (
            <p className="sw-typo-default sw-mb-2">
              {translate('quality_gates.projects_for_default')}
            </p>
          ) : (
            <Projects
              canEdit={actions.associateProjects}
              // pass unique key to re-mount the component when the quality gate changes
              key={qualityGate.name}
              onUpdate={invalidateQueryCache}
              qualityGate={qualityGate}
            />
          )}
        </div>

        {actions.delegate && (
          <div className="sw-mt-10">
            <QualityGatePermissions qualityGate={qualityGate} />
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(DetailsContent);
