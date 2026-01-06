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

import { Heading, IconLink, Link, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';
import { getPathUrlAsString, getRuleUrl } from '~sq-server-commons/helpers/urls';
import { useRefreshBranchStatus } from '~sq-server-commons/queries/branch';
import { getComponentSecurityHotspotsUrl } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Hotspot, HotspotStatusOption } from '~sq-server-commons/types/security-hotspots';
import { Component } from '~sq-server-commons/types/types';
import HotspotHeaderRightSection from './HotspotHeaderRightSection';
import Status from './status/Status';

export interface HotspotHeaderProps {
  branchLike?: BranchLike;
  component: Component;
  hotspot: Hotspot;
  onUpdateHotspot: (statusUpdate?: boolean, statusOption?: HotspotStatusOption) => Promise<void>;
  standards?: StandardsInformation;
}

export function HotspotHeader(props: HotspotHeaderProps) {
  const intl = useIntl();
  const { branchLike, component, hotspot, standards } = props;
  const { message, messageFormattings, rule, key } = hotspot;
  const refreshBranchStatus = useRefreshBranchStatus(component.key);

  const permalink = getPathUrlAsString(
    getComponentSecurityHotspotsUrl(component.key, branchLike, {
      hotspots: key,
    }),
    false,
  );

  const categoryStandard =
    standards?.[StandardsInformationKey.SONARSOURCE][rule.securityCategory]?.title;
  const handleStatusChange = async (statusOption: HotspotStatusOption) => {
    await props.onUpdateHotspot(true, statusOption);
    refreshBranchStatus();
  };

  return (
    <div className="sw-flex sw-justify-between sw-gap-8 hotspot-header">
      <div className="sw-flex-1">
        <div className="sw-flex sw-items-center">
          <Heading as="h1" className="sw-whitespace-normal sw-overflow-visible" size="medium">
            <IssueMessageHighlighting message={message} messageFormattings={messageFormattings} />
          </Heading>
          <ClipboardIconButton
            Icon={IconLink}
            aria-label={intl.formatMessage({ id: 'hotspots.permalink_copy' }, { title: message })}
            className="sw-ml-1"
            copyValue={permalink}
            discreet
          />
        </div>
        <div className="sw-mt-2 sw-mb-4 sw-typo-default">
          <Text isSubtle>{rule.name}</Text>
          <Link className="sw-ml-1" enableOpenInNewTab to={getRuleUrl(rule.key)}>
            {rule.key}
          </Link>
        </div>
        <Status hotspot={hotspot} onStatusChange={handleStatusChange} />
      </div>
      <div className="sw-flex sw-flex-col sw-gap-4">
        <HotspotHeaderRightSection
          categoryStandard={categoryStandard}
          hotspot={hotspot}
          onUpdateHotspot={props.onUpdateHotspot}
        />
      </div>
    </div>
  );
}
