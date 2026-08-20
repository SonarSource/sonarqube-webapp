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

/**
 * Consistent currency formatting: $1,234 / $48.0K / $4.8M
 */
export function formatCurrency(dollars: number): string {
  const abs = Math.abs(dollars);
  const sign = dollars < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

/**
 * Consistent hours formatting: 1,234 hours / 48.0K hours
 */
export function formatHours(hours: number): string {
  const abs = Math.abs(hours);
  if (abs >= 1_000) {
    return `${(hours / 1_000).toFixed(1)}K hours`;
  }
  return `${hours.toLocaleString()} hours`;
}

/**
 * Benchmark costs: $4.79M (always millions for breach costs)
 */
export function formatBenchmark(dollars: number): string {
  if (dollars >= 1_000_000) {
    const millions = dollars / 1_000_000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2)}M`;
  }
  return `$${dollars.toLocaleString()}`;
}
