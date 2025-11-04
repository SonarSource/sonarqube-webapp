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

import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BareButton, ExecutionFlowIcon, SubnavigationItem, themeColor } from '~design-system';
import SingleFileLocationNavigator from '~sq-server-commons/components/locations/SingleFileLocationNavigator';
import { RawHotspot } from '~sq-server-commons/types/security-hotspots';
import { getLocations } from '../utils';

interface HotspotListItemProps {
  hotspot: RawHotspot;
  onClick: (hotspot: RawHotspot) => void;
  onLocationClick: (index?: number) => void;
  selected: boolean;
  selectedHotspotLocation?: number;
}

export default function HotspotListItem(props: Readonly<HotspotListItemProps>) {
  const { hotspot, selected, selectedHotspotLocation } = props;
  const intl = useIntl();
  const locations = getLocations(hotspot.flows, undefined);

  const locationMessage =
    locations.length > 1 ? 'hotspot.location.count.plural' : 'hotspot.location.count';

  // Use useCallback instead of useEffect/useRef combination to be notified of the ref changes
  const itemRef = useCallback(
    (node: Element) => {
      if (selected && node) {
        node.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    },
    [selected],
  );

  const handleClick = () => {
    if (!selected) {
      props.onClick(hotspot);
    }
  };

  return (
    <SubnavigationItem
      active={selected}
      className="sw-flex-col sw-items-start"
      innerRef={itemRef}
      onClick={handleClick}
    >
      <StyledHotspotTitle aria-current={selected}>{hotspot.message}</StyledHotspotTitle>
      {locations.length > 0 && (
        <StyledHotspotInfo className="sw-flex sw-justify-end sw-w-full">
          <div className="sw-flex sw-mt-2 sw-items-center sw-justify-center sw-gap-1 sw-overflow-hidden">
            <ExecutionFlowIcon />
            <span
              className="sw-truncate"
              title={intl.formatMessage({ id: locationMessage }, { number: locations.length })}
            >
              <FormattedMessage
                id={locationMessage}
                values={{
                  number: <span className="sw-typo-semibold">{locations.length}</span>,
                }}
              />
            </span>
          </div>
        </StyledHotspotInfo>
      )}
      {selected && locations.length > 0 && (
        <>
          <StyledSeparator className="sw-w-full sw-my-2" />
          <div className="sw-flex sw-flex-col sw-gap-1 sw-my-2 sw-w-full">
            {locations.map((location, index) => (
              <SingleFileLocationNavigator
                concealedMarker
                index={index}
                key={index}
                message={location.msg}
                messageFormattings={location.msgFormattings}
                onClick={props.onLocationClick}
                selected={index === selectedHotspotLocation}
              />
            ))}
          </div>
        </>
      )}
    </SubnavigationItem>
  );
}

const StyledHotspotTitle = styled(BareButton)`
  &:focus {
    background-color: ${themeColor('subnavigationSelected')};
  }
`;

const StyledHotspotInfo = styled.div`
  color: ${cssVar('color-text-subtle')};
`;

const StyledSeparator = styled.div`
  height: 1px;
  background-color: ${themeColor('subnavigationExecutionFlowBorder')};
`;
