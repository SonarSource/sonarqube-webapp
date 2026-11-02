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

import { ComponentQualifier } from '../types/component';

export function isFile(
  componentQualifier?: string | ComponentQualifier,
): componentQualifier is ComponentQualifier.File {
  return [ComponentQualifier.File, ComponentQualifier.TestFile].includes(
    componentQualifier as ComponentQualifier,
  );
}

export function isProject(
  componentQualifier?: string | ComponentQualifier,
): componentQualifier is ComponentQualifier.Project {
  return componentQualifier === ComponentQualifier.Project;
}

export function isPortfolioLike(
  componentQualifier?: string | ComponentQualifier,
): componentQualifier is ComponentQualifier.Portfolio | ComponentQualifier.SubPortfolio {
  return (
    componentQualifier === ComponentQualifier.Portfolio ||
    componentQualifier === ComponentQualifier.SubPortfolio
  );
}

export function isApplication(
  componentQualifier?: string | ComponentQualifier,
): componentQualifier is ComponentQualifier.Application {
  return componentQualifier === ComponentQualifier.Application;
}

export function isView(
  componentQualifier?: string | ComponentQualifier,
): componentQualifier is
  | ComponentQualifier.Application
  | ComponentQualifier.Portfolio
  | ComponentQualifier.SubPortfolio {
  return isPortfolioLike(componentQualifier) || isApplication(componentQualifier);
}

export function isJupyterNotebookFile(componentKey: string) {
  return componentKey.endsWith('.ipynb');
}
