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

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ide } from '../types/sonarqube-ide';
import { discoverAvailableIDEs } from './ide-discovery';

export interface UseAvailableIDEsOptions {
  filter?: (ide: Ide) => boolean;
  onError?: () => void;
  onSingleIDEFound?: (ide: Ide) => unknown;
  probe: () => Promise<Ide[] | undefined>;
}

export function useAvailableIDEs(options: Readonly<UseAvailableIDEsOptions>) {
  const { filter, onError, onSingleIDEFound, probe } = options;
  const [availableIDEs, setAvailableIDEs] = useState<Ide[]>([]);
  const [isLookingForIDEs, setIsLookingForIDEs] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const closeDropdown = useCallback(() => {
    if (isMounted.current) {
      setAvailableIDEs([]);
    }
  }, []);

  const findAvailableIDEs = useCallback(async () => {
    setAvailableIDEs([]);
    setIsLookingForIDEs(true);

    try {
      const foundIDEs = await discoverAvailableIDEs({
        filter,
        probe,
      });

      if (!isMounted.current) {
        return;
      }

      if (foundIDEs.length === 0) {
        onError?.();
      } else if (foundIDEs.length === 1 && onSingleIDEFound !== undefined) {
        await onSingleIDEFound(foundIDEs[0]);
      } else {
        setAvailableIDEs(foundIDEs);
      }
    } finally {
      if (isMounted.current) {
        setIsLookingForIDEs(false);
      }
    }
  }, [filter, onError, onSingleIDEFound, probe]);

  return { availableIDEs, closeDropdown, findAvailableIDEs, isLookingForIDEs };
}
