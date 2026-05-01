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

import { MarginIndicator, Popover, PopoverSide, Spinner, Tooltip } from '@sonarsource/echoes-react';
import { memo, ReactNode, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LineMeta } from '../../../design-system';
import { SourceLine } from '../../../types/types';

export interface LineDuplicationBlockProps {
  blocksLoaded: boolean;
  duplicated: boolean;
  index: number;
  line: SourceLine;
  onClick?: (line: SourceLine) => void;
  renderDuplicationPopup: (index: number, line: number) => ReactNode;
}

export function LineDuplicationBlock(props: LineDuplicationBlockProps) {
  const { blocksLoaded, duplicated, index, line, onClick } = props;
  const { formatMessage } = useIntl();

  const duplicatedBlockLabel = formatMessage({ id: 'source_viewer.tooltip.duplicated_block' });

  const handleClick = useCallback(() => {
    if (!blocksLoaded && line.duplicated && onClick) {
      onClick(line);
    }
  }, [blocksLoaded, line, onClick]);

  return (
    <LineMeta
      className="it__source-line-duplicated"
      data-index={index}
      data-line-number={line.line}
    >
      {duplicated && (
        <Tooltip content={duplicatedBlockLabel} side="right">
          <Popover
            extraContent={
              <Spinner isLoading={!blocksLoaded}>
                {props.renderDuplicationPopup(index, line.line)}
              </Spinner>
            }
            side={PopoverSide.Right}
            title={<FormattedMessage id="component_viewer.transition.duplication" />}
          >
            <MarginIndicator
              ariaLabel={duplicatedBlockLabel}
              indicatorType="duplication"
              isInteractive
              onClick={handleClick}
            />
          </Popover>
        </Tooltip>
      )}
    </LineMeta>
  );
}

export default memo(LineDuplicationBlock);
