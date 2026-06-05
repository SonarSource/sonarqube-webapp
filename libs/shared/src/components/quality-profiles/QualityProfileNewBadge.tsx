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

import { BadgeVariety } from '@sonarsource/echoes-react';
import { NewBadge } from '../badges/NewBadge';

const NEW_AGENTIC_QUALITY_PROFILE_EXPIRATION = '2026-08-19T23:59:59.999Z';

export function QualityProfileNewBadge({ className }: Readonly<{ className?: string }>) {
  return (
    <NewBadge
      className={className}
      expirationDate={NEW_AGENTIC_QUALITY_PROFILE_EXPIRATION}
      variety={BadgeVariety.Neutral}
    />
  );
}
