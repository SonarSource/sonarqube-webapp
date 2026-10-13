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
import { forwardRef, Ref } from 'react';
import { BareButton } from '../../sonar-aligned/components/buttons';

interface Props {
  as?: React.ElementType;
  className?: string;
  getFixButton?: React.ReactNode;
  issueKey: string;
  message: React.ReactNode;
  onIssueSelect?: (issueKey: string) => void;
  selected?: boolean;
}

function LineFindingFunc(
  { as, getFixButton, message, issueKey, selected = true, className, onIssueSelect }: Props,
  ref: Ref<HTMLButtonElement>,
) {
  return selected ? (
    <LineFindingStyled
      as="div"
      className={className}
      data-issue={issueKey}
      ref={ref}
      selected={selected}
    >
      {onIssueSelect ? (
        <BareButton
          onClick={() => {
            onIssueSelect(issueKey);
          }}
        >
          {message}
        </BareButton>
      ) : (
        message
      )}
      {getFixButton}
    </LineFindingStyled>
  ) : (
    <LineFindingStyled
      as={as}
      className={className}
      data-issue={issueKey}
      onClick={() => {
        if (onIssueSelect) {
          onIssueSelect(issueKey);
        }
      }}
      ref={ref}
      selected={selected}
    >
      {message}
    </LineFindingStyled>
  );
}

export const LineFinding = forwardRef<HTMLElement, Props>(LineFindingFunc);

const LineFindingStyled = styled(BareButton)<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${cssVar('dimension-space-100', '0.5rem')};
  margin-left: ${cssVar('dimension-space-50', '0.25rem')};
  margin-right: ${cssVar('dimension-space-50', '0.25rem')};
  margin-top: ${cssVar('dimension-space-150', '0.75rem')};
  margin-bottom: ${cssVar('dimension-space-150', '0.75rem')};
  border-radius: ${cssVar('border-radius-200', '0.25rem')};
  padding-left: ${cssVar('dimension-space-150', '0.75rem')};
  padding-right: ${cssVar('dimension-space-150', '0.75rem')};
  width: 100%;
  box-sizing: border-box;
  ${(props) =>
    props.selected
      ? {
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
        }
      : {
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
        }};
  ${(props) =>
    props.selected
      ? {
          font: cssVar('typography-text-large-semi-bold'),
        }
      : {
          font: cssVar('typography-text-default-regular'),
        }};
  ${(props) =>
    props.selected
      ? {
          cursor: 'default',
        }
      : {
          cursor: 'pointer',
        }};

  border: ${(props) =>
    props.selected
      ? `${cssVar('border-width-default')} solid ${cssVar('color-border-danger-default')}`
      : `${cssVar('border-width-default')} solid ${cssVar('color-border-danger-weak')}`};
  color: ${cssVar('color-text-default')};
  word-break: break-word;
  background-color: ${cssVar('color-surface-default')};

  &:hover {
    box-shadow: ${cssVar('box-shadow-small')};
  }
`;
