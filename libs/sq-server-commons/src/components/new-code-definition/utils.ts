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

import { isNewCodeDefinitionCompliant } from '../../helpers/new-code-definition';
import { hasGlobalPermission } from '../../helpers/users';
import {
  NewCodeDefinition,
  NewCodeDefinitionBranch,
  NewCodeDefinitionType,
} from '../../types/new-code-definition';
import { Permissions } from '../../types/permissions';
import { Component } from '../../types/types';
import { CurrentUser, isLoggedIn } from '../../types/users';

export enum NewCodeDefinitionLevels {
  Global = 'GLOBAL',
  Project = 'PROJECT',
  Branch = 'BRANCH',
  NewProject = 'NEW_PROJECT',
}

export function getSettingValue({
  analysis,
  numberOfDays,
  referenceBranch,
  type,
}: {
  analysis?: string;
  numberOfDays?: string;
  referenceBranch?: string;
  type?: NewCodeDefinitionType;
}) {
  switch (type) {
    case NewCodeDefinitionType.NumberOfDays:
      return numberOfDays;
    case NewCodeDefinitionType.ReferenceBranch:
      return referenceBranch;
    case NewCodeDefinitionType.SpecificAnalysis:
      return analysis;
    default:
      return undefined;
  }
}

export function validateSetting(state: {
  numberOfDays: string;
  overrideGlobalNewCodeDefinition?: boolean;
  referenceBranch?: string;
  selectedNewCodeDefinitionType?: NewCodeDefinitionType;
}) {
  const {
    numberOfDays,
    overrideGlobalNewCodeDefinition,
    referenceBranch = '',
    selectedNewCodeDefinitionType,
  } = state;

  return (
    overrideGlobalNewCodeDefinition === false ||
    (!!selectedNewCodeDefinitionType &&
      isNewCodeDefinitionCompliant({
        type: selectedNewCodeDefinitionType,
        value: numberOfDays,
      }) &&
      (selectedNewCodeDefinitionType !== NewCodeDefinitionType.ReferenceBranch ||
        referenceBranch.length > 0))
  );
}

export type PreviouslyNonCompliantNCD = NewCodeDefinition &
  Required<Pick<NewCodeDefinition, 'previousNonCompliantValue' | 'updatedAt'>>;

export type PreviouslyNonCompliantBranchNCD = PreviouslyNonCompliantNCD & NewCodeDefinitionBranch;

export function isPreviouslyNonCompliantDaysNCD(
  newCodeDefinition: NewCodeDefinition,
): newCodeDefinition is PreviouslyNonCompliantNCD;
export function isPreviouslyNonCompliantDaysNCD(
  newCodeDefinition: NewCodeDefinitionBranch,
): newCodeDefinition is PreviouslyNonCompliantBranchNCD;
export function isPreviouslyNonCompliantDaysNCD(
  newCodeDefinition: NewCodeDefinition | NewCodeDefinitionBranch,
): newCodeDefinition is PreviouslyNonCompliantNCD | PreviouslyNonCompliantBranchNCD {
  return (
    newCodeDefinition.type === NewCodeDefinitionType.NumberOfDays &&
    newCodeDefinition.previousNonCompliantValue !== undefined &&
    newCodeDefinition.updatedAt !== undefined &&
    !newCodeDefinition.inherited
  );
}

export function isGlobalOrProjectAdmin(currentUser: CurrentUser, component?: Component) {
  if (!isLoggedIn(currentUser)) {
    return false;
  }

  if (component !== undefined) {
    return !!component.configuration?.showSettings;
  }

  return hasGlobalPermission(currentUser, Permissions.Admin);
}
