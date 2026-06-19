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

import { DropdownMenu, toast } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import { memo, MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { useCopyClipboardEffect } from '~shared/components/clipboard';
import { SourceLine } from '../../../types/types';
import { getLineCodeAsPlainText } from '../helpers/lines';

interface Props {
  line: SourceLine;
  permalink: string;
}

const handleCopy = (e: MouseEvent, copyFn: (e: MouseEvent<HTMLButtonElement>) => Promise<void>) => {
  copyFn(e as MouseEvent<HTMLButtonElement>)
    .then(() => {
      toast.success({
        description: <FormattedMessage id="source_viewer.copied_to_clipboard" />,
      });
    })
    .catch(noop);
};

export function LineOptionsPopup({ line, permalink }: Readonly<Props>) {
  const lineCodeAsPlainText = getLineCodeAsPlainText(line.code);
  const [, handleCopyPermalink] = useCopyClipboardEffect(permalink);
  const [, handleCopyLine] = useCopyClipboardEffect(lineCodeAsPlainText ?? '');

  return (
    <>
      <DropdownMenu.ItemButton
        onClick={(e) => {
          handleCopy(e, handleCopyPermalink);
        }}
      >
        <FormattedMessage id="source_viewer.copy_permalink" />
      </DropdownMenu.ItemButton>
      {lineCodeAsPlainText && (
        <DropdownMenu.ItemButton
          onClick={(e) => {
            handleCopy(e, handleCopyLine);
          }}
        >
          <FormattedMessage id="source_viewer.copy_line" />
        </DropdownMenu.ItemButton>
      )}
    </>
  );
}

export default memo(LineOptionsPopup);
