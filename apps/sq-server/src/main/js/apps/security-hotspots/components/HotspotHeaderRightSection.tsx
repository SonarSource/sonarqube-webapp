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

import { Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import React from 'react';
import { HotspotRating } from '~design-system';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Hotspot, HotspotStatusOption } from '~sq-server-commons/types/security-hotspots';
import Assignee from './Assignee';

interface Props {
  categoryStandard?: string;
  hotspot: Hotspot;
  onUpdateHotspot: (statusUpdate?: boolean, statusOption?: HotspotStatusOption) => Promise<void>;
}

export default function HotspotHeaderRightSection(props: Props) {
  const { hotspot, categoryStandard } = props;
  return (
    <>
      <HotspotHeaderInfo title={translate('hotspots.risk_exposure')}>
        <div className="sw-flex sw-items-center">
          <HotspotRating className="sw-mr-1" rating={hotspot.rule.vulnerabilityProbability} />
          <Text isSubtle>{translate('risk_exposure', hotspot.rule.vulnerabilityProbability)}</Text>
        </div>
      </HotspotHeaderInfo>
      <HotspotHeaderInfo title={translate('category')}>
        <Text isSubtle>{categoryStandard}</Text>
      </HotspotHeaderInfo>
      {hotspot.codeVariants && hotspot.codeVariants.length > 0 && (
        <HotspotHeaderInfo className="sw-truncate" title={translate('issues.facet.codeVariants')}>
          <Text isSubtle>
            <Tooltip content={hotspot.codeVariants.join(', ')}>
              <span>{hotspot.codeVariants.join(', ')}</span>
            </Tooltip>
          </Text>
        </HotspotHeaderInfo>
      )}
      <HotspotHeaderInfo title={translate('assignee')}>
        <Assignee hotspot={hotspot} onAssigneeChange={props.onUpdateHotspot} />
      </HotspotHeaderInfo>
    </>
  );
}

interface HotspotHeaderInfoProps {
  children: React.ReactNode;
  className?: string;
  title: string;
}

function HotspotHeaderInfo({ children, title, className }: HotspotHeaderInfoProps) {
  return (
    <div className={classNames('sw-min-w-abs-150 sw-max-w-abs-250', className)}>
      <div className="sw-typo-semibold">{title}:</div>
      {children}
    </div>
  );
}
