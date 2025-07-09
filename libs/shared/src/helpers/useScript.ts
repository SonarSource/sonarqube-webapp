/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { useCallback, useState } from 'react';
import { reportError } from '~adapters/helpers/report-error';
import { isDefined } from './types';

interface ScriptAttributes {
  async?: boolean;
  defer?: boolean;
  id: string;
  src: string;
  type?: string;
}

export default function useScript(attributes: ScriptAttributes) {
  const { async = false, defer = true, src, id, type = 'text/javascript' } = attributes;
  const [isLoading, setIsLoading] = useState(true);
  const scriptTag = document.createElement('script');

  const onLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  scriptTag.async = async;
  scriptTag.defer = defer;
  scriptTag.id = id;
  scriptTag.src = src;
  scriptTag.type = type;

  // check if script isn't already loaded
  if (!isDefined(document.getElementById(id))) {
    document.body.appendChild(scriptTag);
    scriptTag.addEventListener('load', onLoad);
    scriptTag.addEventListener('error', () => {
      reportError("Beamer script didn't load correctly.", {
        tags: { type: 'BEAMER_LOAD_ERROR' },
      });
    });
  }

  return { isLoading };
}
