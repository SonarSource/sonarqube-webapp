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
import { ToggleTip } from '@sonarsource/echoes-react';
import { ReactNode, useCallback, useState } from 'react';
import tw from 'twin.macro';
import {
  BareButton,
  OpenCloseIndicator,
  SubnavigationGroup,
  selectableItemState,
} from '~design-system';

interface Props {
  children: ReactNode;
  header: ReactNode;
  helpDescription?: string;
  id: string;
  initExpanded?: boolean;
}

export default function DomainSubnavigationAccordion(props: Readonly<Props>) {
  const { children, header, helpDescription, id, initExpanded } = props;
  const [expanded, setExpanded] = useState(initExpanded ?? false);

  const toggleExpanded = useCallback(() => {
    setExpanded((currentExpanded) => !currentExpanded);
  }, []);

  return (
    <SubnavigationGroup
      aria-labelledby={`${id}-subnavigation-accordion-button`}
      id={`${id}-subnavigation-accordion`}
      role="region"
    >
      <AccordionHeader>
        <SubnavigationAccordionItem
          aria-controls={`${id}-subnavigation-accordion`}
          aria-expanded={expanded}
          className={helpDescription ? 'sw-pr-16' : undefined}
          id={`${id}-subnavigation-accordion-button`}
          onClick={toggleExpanded}
        >
          {header}

          <OpenCloseIndicator open={expanded} />
        </SubnavigationAccordionItem>

        {helpDescription && (
          <AccordionHeaderAction>
            <ToggleTip description={helpDescription} />
          </AccordionHeaderAction>
        )}
      </AccordionHeader>

      {expanded && children}
    </SubnavigationGroup>
  );
}

const AccordionHeader = styled.div(tw`sw-relative`);

const AccordionHeaderAction = styled.div(() => [
  tw`sw-absolute sw-top-1/2 -sw-translate-y-1/2 sw-right-10 sw-flex sw-items-center`,
  { zIndex: 1 },
]);

const SubnavigationAccordionItem = styled(BareButton)(() => [
  tw`sw-flex sw-items-center sw-justify-between sw-box-border sw-typo-semibold sw-p-4 sw-w-full sw-cursor-pointer`,
  {
    color: selectableItemState.text,
    backgroundColor: selectableItemState.defaultBackground,
    transition: '0.2 ease',
    transitionProperty: 'border-left, background-color, color',
    '&:hover, &:focus': {
      backgroundColor: selectableItemState.hoverBackground,
    },
  },
]);

SubnavigationAccordionItem.displayName = 'SubnavigationAccordionItem';
