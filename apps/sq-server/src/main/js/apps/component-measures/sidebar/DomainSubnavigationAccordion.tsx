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
import classNames from 'classnames';
import { ReactNode, useCallback, useState } from 'react';
import {
  BareButton,
  OpenCloseIndicator,
  selectableItemState,
  SubnavigationGroup,
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
          className={classNames(
            'sw:flex sw:items-center sw:justify-between sw:box-border',
            'sw:typo-semibold sw:p-4 sw:w-full sw:cursor-pointer',
            { 'sw:pr-16': helpDescription },
          )}
          id={`${id}-subnavigation-accordion-button`}
          onClick={toggleExpanded}
        >
          {header}

          <OpenCloseIndicator open={expanded} />
        </SubnavigationAccordionItem>

        {helpDescription && (
          <AccordionHeaderAction
            className={classNames(
              'sw:absolute sw:top-[50%] sw:-translate-y-[50%]',
              'sw:right-10 sw:flex sw:items-center',
            )}
          >
            <ToggleTip description={helpDescription} />
          </AccordionHeaderAction>
        )}
      </AccordionHeader>

      {expanded && children}
    </SubnavigationGroup>
  );
}

const AccordionHeader = styled.div({
  position: 'relative',
});

const AccordionHeaderAction = styled.div({
  zIndex: 1,
});

const SubnavigationAccordionItem = styled(BareButton)`
  color: ${selectableItemState.text};
  background-color: ${selectableItemState.defaultBackground};
  transition: 0.2 ease;
  transition-property: border-left, background-color, color;

  &:hover,
  &:focus {
    background-color: ${selectableItemState.hoverBackground};
  }
`;

SubnavigationAccordionItem.displayName = 'SubnavigationAccordionItem';
