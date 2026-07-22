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
import { cssVar, LinkStandalone, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { isDefined } from '../../helpers/types';
import { LinesOfCodeEllipsesDirection } from '../../types/code-viewer';
import { LinesOfCodeEllipsesIcon } from './LinesOfCodeEllipsesIcon';

interface LinesOfCodeEllipsesProps {
  direction: LinesOfCodeEllipsesDirection;
  handleClick: () => void;
  handleShowAllClick?: () => void;
  isLoading: boolean;
  linesCount?: number;
}

export function LinesOfCodeEllipses(props: Readonly<LinesOfCodeEllipsesProps>) {
  const { direction, handleClick, handleShowAllClick, isLoading } = props;

  return (
    <LinesOfCodeEllipsesStyled className="sw-typo-sm-semibold" direction={direction}>
      <ExpandLink
        direction={direction}
        isLoading={isLoading}
        label={<ExpandLabel {...props} />}
        onClick={handleClick}
      />

      {handleShowAllClick && (
        <ExpandLink
          direction={LinesOfCodeEllipsesDirection.Middle}
          isLoading={isLoading}
          label={<FormattedMessage id="lines_of_code_ellipsis.show_all_lines" tagName="span" />}
          onClick={handleShowAllClick}
        />
      )}
    </LinesOfCodeEllipsesStyled>
  );
}

interface ExpandLinkProps extends Pick<LinesOfCodeEllipsesProps, 'direction' | 'isLoading'> {
  label: ReactNode;
  onClick: () => void;
}

function ExpandLink(props: Readonly<ExpandLinkProps>) {
  const { direction, isLoading, label, onClick } = props;
  return isLoading ? (
    <Text
      className="sw-inline-flex sw-gap-1"
      colorOverride="echoes-color-text-disabled"
      size="small"
    >
      <LinesOfCodeEllipsesIcon color="echoes-color-icon-disabled" direction={direction} />
      {label}
    </Text>
  ) : (
    <LinkStandaloneStyled className="sw-flex sw-gap-1" highlight="subtle" onClick={onClick}>
      <LinesOfCodeEllipsesIcon color="echoes-color-icon-subtle" direction={direction} />
      {label}
    </LinkStandaloneStyled>
  );
}

function ExpandLabel({
  direction,
  linesCount,
}: Readonly<Pick<LinesOfCodeEllipsesProps, 'direction' | 'linesCount'>>) {
  if (isDefined(linesCount)) {
    return (
      <FormattedMessage
        id="lines_of_code_ellipsis.show_x_lines"
        tagName="span"
        values={{ count: linesCount }}
      />
    );
  }

  // Only used in SQS, until we unify the code viewer experience
  switch (direction) {
    case LinesOfCodeEllipsesDirection.Up:
      return <FormattedMessage id="source_viewer.expand_above" tagName="span" />;
    case LinesOfCodeEllipsesDirection.Down:
      return <FormattedMessage id="source_viewer.expand_below" tagName="span" />;
    default:
      return <FormattedMessage id="lines_of_code_ellipsis.show_more_lines" tagName="span" />;
  }
}

/*
 * Prevent the Icon from being underlined
 */
const LinkStandaloneStyled = styled(LinkStandalone)`
  padding: ${cssVar('dimension-space-50')} 0;

  &:hover {
    text-decoration-line: none;

    & > span:not(:first-of-type) {
      text-decoration: underline;
    }
  }
`;

const LinesOfCodeEllipsesStyled = styled.div<Pick<LinesOfCodeEllipsesProps, 'direction'>>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 26px;

  padding: 0 ${cssVar('dimension-space-200')};

  background-color: var(--code-viewer-ellipsis-background);

  &:hover {
    background-color: var(--code-viewer-ellipsis-background-hover);
  }

  border-top: ${(props) =>
    props.direction === LinesOfCodeEllipsesDirection.Up
      ? 'none'
      : '1px solid var(--code-viewer-line-border)'};
  border-bottom: ${(props) =>
    props.direction === LinesOfCodeEllipsesDirection.Down
      ? 'none'
      : '1px solid var(--code-viewer-line-border)'};
`;
