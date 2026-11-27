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

import { highlightCode } from '~shared/helpers/hljs/highlight';
import { mapHtmlCodeBlocks } from '~shared/helpers/hljs/map-html-code-blocks';
import { decodeHtmlCode } from './decodeHtmlCode';

interface Options {
  escapeDom?: boolean;
  highlight?: boolean;
  language?: string;
}

export function highlightHtmlCode(
  htmlAsString: string,
  { escapeDom = true, highlight = true, language }: Readonly<Options> = {},
) {
  return mapHtmlCodeBlocks(htmlAsString, (code) => {
    const unescapedCode = escapeDom ? decodeHtmlCode(code) : code;

    return highlightCode(unescapedCode, language, highlight).value;
  });
}
