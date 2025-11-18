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

export function save(key: string, value?: string, suffix?: string): void {
  try {
    const finalKey = suffix ? `${key}.${suffix}` : key;
    if (value) {
      globalThis.localStorage.setItem(finalKey, value);
    } else {
      globalThis.localStorage.removeItem(finalKey);
    }
  } catch {
    // usually that means the storage is full
    // just do nothing in this case
  }
}

export function remove(key: string, suffix?: string): void {
  try {
    globalThis.localStorage.removeItem(suffix ? `${key}.${suffix}` : key);
  } catch {
    // Fail silently
  }
}

export function get(key: string, suffix?: string): string | null {
  try {
    return globalThis.localStorage.getItem(suffix ? `${key}.${suffix}` : key);
  } catch {
    return null;
  }
}

export function sessionSave(key: string, value?: string, suffix?: string): void {
  try {
    const finalKey = suffix ? `${key}.${suffix}` : key;
    if (value) {
      globalThis.sessionStorage.setItem(finalKey, value);
    } else {
      globalThis.sessionStorage.removeItem(finalKey);
    }
  } catch {
    // usually that means the storage is full
    // just do nothing in this case
  }
}

export function sessionRemove(key: string, suffix?: string): void {
  try {
    globalThis.sessionStorage.removeItem(suffix ? `${key}.${suffix}` : key);
  } catch {
    // Fail silently
  }
}

export function sessionGet(key: string, suffix?: string): string | null {
  try {
    return globalThis.sessionStorage.getItem(suffix ? `${key}.${suffix}` : key);
  } catch {
    return null;
  }
}
