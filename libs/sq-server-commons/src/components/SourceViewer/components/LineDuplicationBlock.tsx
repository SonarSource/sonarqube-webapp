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

import { memo, ReactNode, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  DuplicationBlock,
  LineMeta,
  OutsideClickHandler,
  PopupPlacement,
} from '../../../design-system';
import { SourceLine } from '../../../types/types';
import Tooltip from '../../controls/Tooltip';

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
  const [popupOpen, setPopupOpen] = useState(false);
  const { formatMessage } = useIntl();

  const duplicatedBlockLabel = formatMessage({ id: 'source_viewer.tooltip.duplicated_block' });
  const tooltip = popupOpen ? undefined : duplicatedBlockLabel;

  const handleClick = useCallback(() => {
    setPopupOpen(!popupOpen);

    if (!blocksLoaded && line.duplicated && onClick) {
      onClick(line);
    }
  }, [blocksLoaded, line, onClick, popupOpen]);

  const handleClose = useCallback(() => {
    setPopupOpen(false);
  }, []);

  return duplicated ? (
    <LineMeta
      className="it__source-line-duplicated"
      data-index={index}
      data-line-number={line.line}
    >
      <OutsideClickHandler onClickOutside={handleClose}>
        <Tooltip
          classNameInner={popupOpen ? 'sw-max-w-abs-400' : undefined}
          content={popupOpen ? props.renderDuplicationPopup(index, line.line) : tooltip}
          isInteractive={popupOpen}
          isOpen={popupOpen ? true : undefined}
          key={popupOpen ? 'open' : 'closed'}
          side={PopupPlacement.Right}
        >
          <DuplicationBlock
            aria-expanded={popupOpen}
            aria-haspopup="dialog"
            aria-label={duplicatedBlockLabel}
            onClick={handleClick}
            role="button"
            tabIndex={0}
          />
        </Tooltip>
      </OutsideClickHandler>
    </LineMeta>
  ) : (
    <LineMeta data-index={index} data-line-number={line.line} />
  );
}

export default memo(LineDuplicationBlock);
