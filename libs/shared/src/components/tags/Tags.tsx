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
import {
  DropdownMenu,
  DropdownMenuAlign,
  DropdownMenuSide,
  Text,
  Tooltip,
  cssVar,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import tw from 'twin.macro';

const MIN_TAGS_TO_DISPLAY = 3;

interface Props {
  align?: DropdownMenuAlign;
  allowUpdate?: boolean;
  className?: string;
  isOpen?: boolean;
  menuId?: string;
  overlay?: ReactNode;
  setIsOpen?: (isOpen: boolean) => void;
  side?: DropdownMenuSide;
  tags: string[];
  tagsToDisplay?: number;
}

export function Tags({
  align,
  allowUpdate = false,
  className,
  menuId = '',
  overlay,
  tags,
  tagsToDisplay = MIN_TAGS_TO_DISPLAY,
  side,
  isOpen,
  setIsOpen,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const displayedTags = tags.slice(0, tagsToDisplay);
  const extraTags = tags.slice(tagsToDisplay);

  const tagsContent = (
    <Tooltip content={tags.length > 0 ? tags.join(', ') : formatMessage({ id: 'no_tags' })}>
      <span className="sw-inline-flex sw-items-center sw-gap-1">
        {displayedTags.map((tag) => (
          <TagLabel key={tag}>{tag}</TagLabel>
        ))}

        {extraTags.length > 0 ? <TagLabel aria-hidden="true">...</TagLabel> : null}

        {tags.length === 0 && (
          <Text isSubtle>
            <FormattedMessage id="no_tags" />
          </Text>
        )}
      </span>
    </Tooltip>
  );

  return (
    <span className={classNames('sw-cursor-default sw-flex sw-items-center', className)}>
      {allowUpdate ? (
        <DropdownMenu
          align={align}
          id={menuId}
          isOpen={isOpen}
          items={overlay}
          onClick={() => setIsOpen?.(true)}
          onClose={() => {
            setIsOpen?.(false);
          }}
          side={side}
        >
          <button
            aria-label={
              tags.length > 0
                ? formatMessage({ id: 'tags.edit_button_label' }, { tags: tags.join(', ') })
                : formatMessage({ id: 'tags.add_tags' })
            }
            className="sw-flex sw-items-center sw-gap-1 sw-cursor-pointer sw-bg-transparent sw-border-none sw-p-0"
            type="button"
          >
            {tagsContent}
            <TagLabel aria-hidden="true" className="sw-cursor-pointer">
              +
            </TagLabel>
          </button>
        </DropdownMenu>
      ) : (
        <span
          aria-label={
            tags.length > 0
              ? formatMessage({ id: 'tags_list_x' }, { tags: tags.join(', ') })
              : formatMessage({ id: 'no_tags' })
          }
        >
          {tagsContent}
        </span>
      )}
    </span>
  );
}

const TagLabel = styled.span`
  color: ${cssVar('color-text-default')};
  background: ${cssVar('color-background-neutral-subtle-default')};

  ${tw`sw-typo-sm`}
  ${tw`sw-box-border`}
  ${tw`sw-truncate`}
  ${tw`sw-rounded-1/2`}
  ${tw`sw-px-1 sw-py-1/2`}
  ${tw`sw-max-w-[8rem]`}
`;
