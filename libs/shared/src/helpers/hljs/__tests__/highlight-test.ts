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

import hljs from 'highlight.js/lib/core';
import { createCodeHighlighter, highlightCode } from '../highlight';

afterEach(() => {
  jest.restoreAllMocks();
});

it('highlights a registered language', () => {
  const result = highlightCode('const answer = 42;', 'javascript');

  expect(result.language).toBe('javascript');
  expect(result.value).toContain('<span class="hljs-keyword">const</span>');
});

it('recognizes registered language aliases', () => {
  const result = highlightCode('<p>Hello</p>', 'web');

  expect(result.value).toContain('hljs-tag');
});

it.each(['dos', 'cmd'])('highlights Windows command variables with %s', (language) => {
  const result = highlightCode('echo %SONAR_TOKEN%', language);

  expect(result.language).toBe(language);
  expect(result.value).toContain('<span class="hljs-variable">%SONAR_TOKEN%</span>');
});

it.each([undefined, 'unknown-language'])('uses plain text for language %s', (language) => {
  const result = highlightCode('const answer = 42;', language);

  expect(result).toMatchObject({ language: 'plaintext', value: 'const answer = 42;' });
});

it('uses plain text when highlighting is disabled', () => {
  const result = highlightCode('const answer = 42;', 'javascript', false);

  expect(result).toMatchObject({ language: 'plaintext', value: 'const answer = 42;' });
});

it('falls back to plain text when highlighting throws', () => {
  jest.spyOn(hljs, 'highlight').mockImplementationOnce(() => {
    throw new Error('highlight failed');
  });

  const result = highlightCode('const answer = 42;', 'javascript');

  expect(result).toMatchObject({ language: 'plaintext', value: 'const answer = 42;' });
});

it('configures new instances with the shared languages and aliases', () => {
  const highlighter = createCodeHighlighter();

  expect(highlighter).not.toBe(hljs);
  expect(highlighter.listLanguages()).toEqual(hljs.listLanguages());

  expect(highlightCode('<p>Hello</p>', 'web', true, highlighter).value).toBe(
    highlightCode('<p>Hello</p>', 'web').value,
  );
});

it('keeps custom plugins isolated from the default instance', () => {
  const highlighter = createCodeHighlighter();

  highlighter.addPlugin({
    'before:highlight': (data) => {
      data.code = 'custom code';
    },
  });

  expect(highlightCode('original code', undefined, true, highlighter).value).toBe('custom code');
  expect(highlightCode('original code', undefined).value).toBe('original code');
});

it('keeps fallback on the provided instance', () => {
  const highlighter = createCodeHighlighter();

  const highlightSpy = jest.spyOn(highlighter, 'highlight').mockImplementationOnce(() => {
    throw new Error('highlight failed');
  });

  const result = highlightCode('const answer = 42;', 'javascript', true, highlighter);

  expect(result).toMatchObject({ language: 'plaintext', value: 'const answer = 42;' });

  expect(highlightSpy).toHaveBeenLastCalledWith('const answer = 42;', {
    ignoreIllegals: true,
    language: 'plaintext',
  });
});
