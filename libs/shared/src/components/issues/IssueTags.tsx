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

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { isInput, isShortcut } from '../../helpers/keyboard';
import { Tags } from '../tags/Tags';

interface Props {
  canSetTags?: boolean;
  className?: string;
  isOpen?: boolean;
  issue: { key: string; tags?: string[] };
  overlay: ReactNode;
  selectedIssueKey?: string;
  tagsToDisplay?: number;
  togglePopup?: (popup: string, isOpen?: boolean) => void;
}

const TAGS_TO_DISPLAY = 2;

export function IssueTags({
  canSetTags,
  className,
  isOpen,
  issue,
  overlay,
  selectedIssueKey,
  tagsToDisplay = TAGS_TO_DISPLAY,
  togglePopup,
}: Readonly<Props>) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const selected = selectedIssueKey === issue.key;
  const { tags = [] } = issue;

  const setPopupOpen = useCallback(
    (open: boolean) => {
      if (togglePopup !== undefined) {
        togglePopup('edit-tags', open);
      } else {
        setInternalIsOpen(open);
      }
    },
    [togglePopup],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isInput(event)) {
        return;
      }
      if (event.key === 't' && !isShortcut(event)) {
        event.preventDefault();
        selectContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setPopupOpen(true);
      }
    },
    [setPopupOpen],
  );

  useEffect(() => {
    if (selected && canSetTags) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, selected, canSetTags]);

  useEffect(() => {
    if (!selected) {
      setInternalIsOpen(false);
    }
  }, [selected]);

  const effectiveIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  return (
    <div ref={selectContainerRef}>
      <Tags
        allowUpdate={canSetTags}
        className={className}
        isOpen={effectiveIsOpen}
        menuId="issue-tags-menu"
        overlay={overlay}
        setIsOpen={setPopupOpen}
        tags={tags}
        tagsToDisplay={tagsToDisplay}
      />
    </div>
  );
}
