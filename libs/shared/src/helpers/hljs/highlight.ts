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

import type { HLJSApi } from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import actionscript from 'highlight.js/lib/languages/actionscript';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import docker from 'highlight.js/lib/languages/dockerfile';
import dos from 'highlight.js/lib/languages/dos';
import go from 'highlight.js/lib/languages/go';
import gradle from 'highlight.js/lib/languages/gradle';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import objectivec from 'highlight.js/lib/languages/objectivec';
import pgsql from 'highlight.js/lib/languages/pgsql';
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import properties from 'highlight.js/lib/languages/properties';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import scala from 'highlight.js/lib/languages/scala';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import vbnet from 'highlight.js/lib/languages/vbnet';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import apex from 'highlightjs-apex';
import cobol from 'highlightjs-cobol';
import abap from 'highlightjs-sap-abap';
import { isDefined } from '../types';
import { hljsIssueIndicatorPlugin } from './hljs-issue-indicator-plugin';
import { hljsUnderlinePlugin } from './hljs-underline-plugin';

configureHighlighter(hljs);

export function createCodeHighlighter() {
  const highlighter = hljs.newInstance();
  configureHighlighter(highlighter);

  return highlighter;
}

export function highlightCode(
  code: string,
  language: string | undefined,
  highlight = true,
  highlighter: HLJSApi = hljs,
) {
  try {
    const actualLanguage =
      highlight && isDefined(language) && highlighter.getLanguage(language)
        ? language
        : 'plaintext';

    return highlighter.highlight(code, { ignoreIllegals: true, language: actualLanguage });
  } catch {
    return highlighter.highlight(code, { ignoreIllegals: true, language: 'plaintext' });
  }
}

function configureHighlighter(highlighter: HLJSApi) {
  // Supported languages: https://highlightjs.readthedocs.io/en/latest/supported-languages.html
  // Register languages individually to avoid bundling every language.
  // The Terraform package is outdated and unmaintained
  highlighter.registerLanguage('actionscript', actionscript);
  highlighter.registerLanguage('bash', bash);
  highlighter.registerLanguage('c', c);
  highlighter.registerLanguage('cpp', cpp);
  highlighter.registerLanguage('csharp', csharp);
  highlighter.registerLanguage('css', css);
  highlighter.registerLanguage('dart', dart);
  highlighter.registerLanguage('docker', docker);
  highlighter.registerLanguage('dos', dos);
  highlighter.registerLanguage('go', go);
  highlighter.registerLanguage('gradle', gradle);
  highlighter.registerLanguage('java', java);
  highlighter.registerLanguage('javascript', javascript);
  highlighter.registerLanguage('json', json);
  highlighter.registerLanguage('kotlin', kotlin);
  highlighter.registerLanguage('objectivec', objectivec);
  highlighter.registerLanguage('pgsql', pgsql);
  highlighter.registerLanguage('php', php);
  highlighter.registerLanguage('plaintext', plaintext);
  highlighter.registerLanguage('powershell', powershell);
  highlighter.registerLanguage('properties', properties);
  highlighter.registerLanguage('python', python);
  highlighter.registerLanguage('ruby', ruby);
  highlighter.registerLanguage('scala', scala);
  highlighter.registerLanguage('shell', shell);
  highlighter.registerLanguage('sql', sql);
  highlighter.registerLanguage('swift', swift);
  highlighter.registerLanguage('typescript', typescript);
  highlighter.registerLanguage('vbnet', vbnet);
  highlighter.registerLanguage('xml', xml);
  highlighter.registerLanguage('yaml', yaml);
  highlighter.registerLanguage('abap', abap);
  highlighter.registerLanguage('apex', apex);
  highlighter.registerLanguage('cobol', cobol);

  // Map rule-language names to Highlight.js languages
  highlighter.registerAliases('azureresourcemanager', { languageName: 'json' });
  highlighter.registerAliases('flex', { languageName: 'actionscript' });
  highlighter.registerAliases('objc', { languageName: 'objectivec' });
  highlighter.registerAliases('plsql', { languageName: 'pgsql' });
  highlighter.registerAliases('ipynb', { languageName: 'python' });
  // tsql plugin doesn't work with Vite and is ~13kb in size
  highlighter.registerAliases('tsql', { languageName: 'sql' });
  highlighter.registerAliases('secrets', { languageName: 'markdown' });
  highlighter.registerAliases('web', { languageName: 'xml' });

  highlighter.registerAliases(['cloudformation', 'kubernetes'], {
    languageName: 'yaml',
  });

  highlighter.addPlugin(hljsIssueIndicatorPlugin);
  highlighter.addPlugin(hljsUnderlinePlugin);
}
