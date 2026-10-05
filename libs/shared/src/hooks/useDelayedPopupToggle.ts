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

import { useCallback, useEffect, useRef } from 'react';

/**
 * Wraps a `togglePopup` function so that opening a popup while another one is
 * already open closes the current one first and opens the next after a short
 * delay (needed for correct focus handling), and re-requesting the popup
 * that's already open closes it instead.
 */
export function useDelayedPopupToggle(
  openPopup: string | undefined,
  togglePopup: (popup: string, show?: boolean) => void,
) {
  const openPopupRef = useRef(openPopup);

  useEffect(() => {
    openPopupRef.current = openPopup;
  }, [openPopup]);

  return useCallback(
    (popup: string, show = true) => {
      if (popup === openPopupRef.current || !show) {
        togglePopup(popup, false);
        return;
      }

      if (!openPopupRef.current) {
        togglePopup(popup, true);
        return;
      }

      togglePopup(openPopupRef.current, false);

      setTimeout(() => {
        togglePopup(popup, true);
      }, 100);
    },
    [togglePopup],
  );
}
