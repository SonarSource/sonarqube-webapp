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

import { Path } from 'react-router-dom';
import { getProjectTutorialLocation } from '../../helpers/urls';

/**
 * Automatic analysis is a SQ-Cloud feature, so a SQ-Server project can never be re-analysed on
 * demand. Kept in sync with `useTriggerAutomaticAnalysisMutation` returning `undefined`, and read by
 * shared tests that assert the row menu of both products.
 */
export const IS_AUTOMATIC_ANALYSIS_SUPPORTED = false;

/** Location of the page where the CI-based analysis of a project is set up. */
export function getProjectCiConfigurationUrl(projectKey: string): Partial<Path> {
  return getProjectTutorialLocation(projectKey);
}
