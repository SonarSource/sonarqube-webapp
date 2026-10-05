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

import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useDelayedPopupToggle } from '../../hooks/useDelayedPopupToggle';

export const IssuePopupName = {
  Assign: 'assign',
  EditTags: 'edit-tags',
  Transition: 'transition',
} as const;

export interface IssuePopupContextValue {
  currentPopup: string | undefined;
  togglePopup: (popup: string, show?: boolean) => void;
}

export const IssuePopupContext = createContext<IssuePopupContextValue | undefined>(undefined);

interface IssuePopupProviderProps {
  children: ReactNode;
  /**
   * The currently open popup is reset whenever this value changes, e.g. when
   * navigating from one issue's details to another's.
   */
  resetKey?: string;
}

function IssuePopupProvider({ children, resetKey }: Readonly<IssuePopupProviderProps>) {
  const [openPopup, setOpenPopup] = useState<string | undefined>(undefined);

  const setCurrentPopup = useCallback((popup: string, show = true) => {
    // Only close if the popup being closed is the one currently open, so a late close from a
    // previous popup can't dismiss the one that just opened.
    setOpenPopup((current) => {
      if (show) {
        return popup;
      }
      return current === popup ? undefined : current;
    });
  }, []);

  const togglePopup = useDelayedPopupToggle(openPopup, setCurrentPopup);

  useEffect(() => {
    setOpenPopup(undefined);
  }, [resetKey]);

  const value = useMemo(() => ({ currentPopup: openPopup, togglePopup }), [openPopup, togglePopup]);

  return <IssuePopupContext.Provider value={value}>{children}</IssuePopupContext.Provider>;
}

export { IssuePopupProvider };
