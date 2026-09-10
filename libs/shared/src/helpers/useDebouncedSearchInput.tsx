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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_DEBOUNCE_DELAY = 250;
const DEFAULT_MIN_LENGTH = 2;

interface Options {
  debounceDelay?: number;
  minLength?: number;
  onChange: (value: string) => void;
  resetBelowMinLength?: boolean;
  value?: string;
}

/**
 * Keeps a search input responsive while synchronizing its value to a debounced external state.
 * External changes are applied unless the user has an in-progress edit waiting to be committed.
 */
export function useDebouncedSearchInput({
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  minLength = DEFAULT_MIN_LENGTH,
  onChange,
  resetBelowMinLength = false,
  value,
}: Options): [string, (value: string) => void] {
  const [inputValue, setInputValue] = useState(value ?? '');
  const pendingValue = useRef<string | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const debouncedOnChange = useMemo(
    () =>
      debounce((nextValue: string, expectedValue = nextValue) => {
        pendingValue.current = expectedValue;
        onChangeRef.current(nextValue);
      }, debounceDelay),
    [debounceDelay],
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  useEffect(() => {
    if (pendingValue.current !== undefined) {
      if (pendingValue.current !== (value ?? '')) {
        return;
      }

      pendingValue.current = undefined;
    }

    setInputValue(value ?? '');
  }, [value]);

  const handleChange = useCallback(
    (nextValue: string) => {
      setInputValue(nextValue);
      pendingValue.current = nextValue;

      if (nextValue.length >= minLength || nextValue.length === 0) {
        debouncedOnChange(nextValue, nextValue);
      } else if (resetBelowMinLength) {
        debouncedOnChange('', nextValue);
      } else {
        debouncedOnChange.cancel();
        pendingValue.current = undefined;
      }
    },
    [debouncedOnChange, minLength, resetBelowMinLength],
  );

  return [inputValue, handleChange];
}
