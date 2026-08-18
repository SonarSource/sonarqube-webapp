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

import type { ComponentType, ReactNode } from 'react';

/**
 * Accordion shell injected by host apps so the modal can use the same accordion implementation as
 * the rest of the page (e.g. Echoes {@link ControlledAccordion} in sq-cloud) without coupling this
 * library to a specific UI package.
 */
export type WidgetModalAccordionComponent = ComponentType<{
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title: ReactNode;
}>;
