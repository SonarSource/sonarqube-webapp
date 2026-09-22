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

import { debounce } from 'lodash';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useDismissNotice } from '~adapters/helpers/notices';
import { NoticeType } from '../../../types/users';

const DEBOUNCE_FOR_SCROLL = 250;

interface UseEducationPrinciplesVisibilityParams {
  displayEducationalPrinciplesNotification: boolean;
  educationPrinciplesRef: RefObject<HTMLDivElement | null>;
  isMoreInfoSelected: boolean;
}

/**
 * Auto-dismisses the "education principles" notice once its content has scrolled into view
 * while the More Info tab is selected.
 */
export function useEducationPrinciplesVisibility({
  displayEducationalPrinciplesNotification,
  educationPrinciplesRef,
  isMoreInfoSelected,
}: Readonly<UseEducationPrinciplesVisibilityParams>) {
  const { dismissNotice } = useDismissNotice();
  const [
    educationalPrinciplesNotificationHasBeenDismissed,
    setEducationalPrinciplesNotificationHasBeenDismissed,
  ] = useState(false);

  const latestVisibilityCheckInputsRef = useRef({
    displayEducationalPrinciplesNotification,
    educationalPrinciplesNotificationHasBeenDismissed,
    dismissNotice,
  });
  latestVisibilityCheckInputsRef.current = {
    displayEducationalPrinciplesNotification,
    educationalPrinciplesNotificationHasBeenDismissed,
    dismissNotice,
  };

  const checkIfEducationPrinciplesAreVisible = useMemo(
    () =>
      debounce(() => {
        const {
          displayEducationalPrinciplesNotification: shouldDisplay,
          educationalPrinciplesNotificationHasBeenDismissed: hasBeenDismissed,
          dismissNotice: dismissEducationPrinciplesNotice,
        } = latestVisibilityCheckInputsRef.current;

        if (educationPrinciplesRef.current) {
          const rect = educationPrinciplesRef.current.getBoundingClientRect();
          const isVisible =
            rect.top <= (window.innerHeight || document.documentElement.clientHeight);

          if (isVisible && shouldDisplay && !hasBeenDismissed) {
            void dismissEducationPrinciplesNotice(NoticeType.EDUCATION_PRINCIPLES);
            setEducationalPrinciplesNotificationHasBeenDismissed(true);
          }
        }
        // Reads latest values via `latestVisibilityCheckInputsRef` instead, so the debounced
        // function's cadence isn't reset when those values change.
      }, DEBOUNCE_FOR_SCROLL),
    [educationPrinciplesRef],
  );

  useEffect(() => {
    if (educationalPrinciplesNotificationHasBeenDismissed) {
      return undefined;
    }

    document.addEventListener('scroll', checkIfEducationPrinciplesAreVisible, { capture: true });

    return () => {
      document.removeEventListener('scroll', checkIfEducationPrinciplesAreVisible, {
        capture: true,
      });
      checkIfEducationPrinciplesAreVisible.cancel();
    };
  }, [checkIfEducationPrinciplesAreVisible, educationalPrinciplesNotificationHasBeenDismissed]);

  useEffect(() => {
    if (isMoreInfoSelected) {
      checkIfEducationPrinciplesAreVisible();
    }
  }, [isMoreInfoSelected, checkIfEducationPrinciplesAreVisible]);
}
