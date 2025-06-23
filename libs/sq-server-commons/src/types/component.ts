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

import { LightComponent, Visibility } from '~shared/types/component';
import { Task } from './tasks';
import { Component } from './types';

export enum ProjectKeyValidationResult {
  Valid = 'valid',
  Empty = 'empty',
  TooLong = 'too_long',
  InvalidChar = 'invalid_char',
  OnlyDigits = 'only_digits',
}

export interface TreeComponent extends LightComponent {
  id?: string;
  path?: string;
  refId?: string;
  refKey?: string;
  tags?: string[];
  visibility: Visibility;
}

export interface TreeComponentWithPath extends TreeComponent {
  path: string;
}

export interface ComponentContextShape {
  component?: Component;
  currentTask?: Task;
  fetchComponent: () => Promise<void>;
  isInProgress?: boolean;
  isPending?: boolean;
  onComponentChange: (changes: Partial<Component>) => void;
}
