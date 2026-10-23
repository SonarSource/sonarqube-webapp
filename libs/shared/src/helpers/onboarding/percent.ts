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

/** Clamps `value` to the [0, 100] range. */
export function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Rounds `value` to a whole percentage that only reads 0% or 100% when it is exactly empty or
 * complete, so 9710 of 9711 shows 99% rather than 100%.
 */
export function toDisplayPercent(value: number): number {
  const clamped = clampPercent(value);
  if (clamped === 0 || clamped === 100) {
    return clamped;
  }
  return Math.min(Math.max(Math.round(clamped), 1), 99);
}
