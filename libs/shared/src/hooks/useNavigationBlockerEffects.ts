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

import { useEffect, useRef } from 'react';
import { useBeforeUnload } from 'react-router-dom';

interface NavigationBlockerEffectsProps {
  onLinkNavigation: (link: HTMLAnchorElement) => boolean;
  shouldBlock: boolean;
}

export function useNavigationBlockerEffects({
  onLinkNavigation,
  shouldBlock,
}: NavigationBlockerEffectsProps) {
  const isNavigatingRef = useRef(false);

  useBeforeUnload((event) => {
    if (shouldBlock && !isNavigatingRef.current) {
      event.preventDefault();
    }
  });

  useEffect(() => {
    if (!shouldBlock) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link?.href && !link.href.startsWith('javascript:')) {
        const linkUrl = new URL(link.href);
        const currentUrl = new URL(globalThis.location.href);

        if (linkUrl.pathname !== currentUrl.pathname) {
          event.preventDefault();
          event.stopPropagation();

          if (onLinkNavigation(link)) {
            isNavigatingRef.current = true;
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [onLinkNavigation, shouldBlock]);

  return isNavigatingRef;
}
