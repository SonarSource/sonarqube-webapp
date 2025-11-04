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

import { KeyboardEvent as ReactKeyboardEvent } from 'react';

export enum Key {
  ArrowLeft = 'ArrowLeft',
  ArrowUp = 'ArrowUp',
  ArrowRight = 'ArrowRight',
  ArrowDown = 'ArrowDown',

  Alt = 'Alt',
  Option = 'Option',
  Backspace = 'Backspace',
  CapsLock = 'CapsLock',
  Meta = 'Meta',
  Control = 'Control',
  Command = 'Command',
  Delete = 'Delete',
  End = 'End',
  Enter = 'Enter',
  Escape = 'Escape',
  Home = 'Home',
  PageDown = 'PageDown',
  PageUp = 'PageUp',
  Shift = 'Shift',
  Space = ' ',
  Tab = 'Tab',
  Click = 'Click',
}

export function isShortcut(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey;
}

const INPUT_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'UBCOMMENT'];

export function isInput(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  const { tagName } = event.target as HTMLElement;
  return INPUT_TAGS.includes(tagName);
}

export function isTextarea(
  event: KeyboardEvent | ReactKeyboardEvent,
): event is (KeyboardEvent | ReactKeyboardEvent) & { target: HTMLTextAreaElement } {
  return event.target instanceof HTMLTextAreaElement;
}

export function isRadioButton(event: KeyboardEvent | ReactKeyboardEvent) {
  const role = (event.target as HTMLElement | null)?.role ?? '';
  return ['radio', 'radiogroup'].includes(role);
}
