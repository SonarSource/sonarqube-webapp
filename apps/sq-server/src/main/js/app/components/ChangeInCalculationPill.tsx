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

import { Popover } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import { Pill, PillVariant } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';

interface Props {
  qualifier: ComponentQualifier;
}

export default function ChangeInCalculation({ qualifier }: Readonly<Props>) {
  const { data: isStandardMode, isLoading } = useStandardExperienceModeQuery();

  if (isStandardMode || isLoading) {
    return null;
  }

  return (
    <Popover
      description={translate(`projects.awaiting_scan.description.${qualifier}`)}
      footer={
        <DocumentationLink shouldOpenInNewTab standalone to={DocLink.MetricDefinitions}>
          {translate('projects.awaiting_scan.learn_more')}
        </DocumentationLink>
      }
      title={translate('projects.awaiting_scan.title')}
    >
      <Pill className="sw-ml-2" onClick={noop} variant={PillVariant.Info}>
        {translate('projects.awaiting_scan')}
      </Pill>
    </Popover>
  );
}
