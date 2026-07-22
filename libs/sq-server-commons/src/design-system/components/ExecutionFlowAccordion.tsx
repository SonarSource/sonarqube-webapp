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
import classNames from 'classnames';
import { ReactNode } from 'react';
import tw from 'twin.macro';
import { themeContrast } from '../helpers/theme';
import { BareButton } from '../sonar-aligned/components/buttons';
import { OpenCloseIndicator } from './icons/OpenCloseIndicator';

interface Props {
  children: ReactNode;
  expanded?: boolean;
  header: ReactNode;
  hidden?: boolean;
  id: string;
  innerRef?: (node: HTMLDivElement) => void;
  onClick?: () => void;
}

export function ExecutionFlowAccordion(props: Readonly<Props>) {
  const { children, expanded, header, hidden, id, innerRef, onClick } = props;

  return (
    <Accordion className={classNames({ expanded, 'sw-hidden': hidden })} ref={innerRef}>
      <Expander
        aria-controls={`${id}-flow-accordion`}
        aria-expanded={expanded}
        aria-hidden={hidden}
        id={`${id}-flow-accordion-button`}
        onClick={onClick}
      >
        {header}
        <OpenCloseIndicator open={Boolean(expanded)} />
      </Expander>

      {expanded && <Body id={`${id}-flow-accordion-body`}>{children}</Body>}
    </Accordion>
  );
}

const Expander = styled(BareButton)`
  ${tw`sw-flex sw-items-center sw-justify-between`}
  ${tw`sw-box-border`}
  ${tw`sw-p-2`}
  ${tw`sw-w-full`}
  ${tw`sw-cursor-pointer`}

  color: ${themeContrast('subnavigationExecutionFlow')};
  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;

const Accordion = styled.div`
  ${tw`sw-flex sw-flex-col`}
  ${tw`sw-rounded-1/2`}

  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};

  &:hover {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-accent-default')};
  }

  &.expanded {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-accent-default')};
    outline: 4px solid ${cssVar('color-border-accent-default')};

    ${Expander} {
      border-bottom: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
    }
  }
`;

const Body = styled.div`
  ${tw`sw-p-2`}

  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;

ExecutionFlowAccordion.displayName = 'ExecutionFlowAccordion';
