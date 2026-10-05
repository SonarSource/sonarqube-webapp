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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  CodeAttribute,
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '~shared/types/clean-code-taxonomy';
import { IssueSeverity } from '~shared/types/issues';
import { ISSUE_2 } from '~sq-server-commons/api/mocks/data/ids';
import { IssueType } from '~sq-server-commons/types/issues';
import { Mode } from '~sq-server-commons/types/mode';
import {
  branchHandler,
  componentsHandler,
  issuesHandler,
  modeHandler,
  usersHandler,
} from '~sq-server-commons/utils/issues-test-utils';
import { renderProjectIssuesApp } from '../test-utils';

beforeEach(() => {
  issuesHandler.reset();
  componentsHandler.reset();
  branchHandler.reset();
  usersHandler.reset();
  modeHandler.reset();
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollTo = jest.fn();
});

it('should show the clean code attribute and software quality impact in MQR mode', async () => {
  renderProjectIssuesApp(`project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`);

  expect(
    await byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Responsible}`).find(
      undefined,
      { timeout: 10_000 },
    ),
  ).toBeInTheDocument();
  expect(
    byText(`cct.clean_code_attribute.${CodeAttribute.Respectful}`, { exact: false }).get(),
  ).toBeInTheDocument();

  expect(
    byRole('button', {
      name: `software_impact.button.change.severity_impact.${SoftwareImpactSeverity.High}.software_quality.${SoftwareQuality.Security}`,
    }).get(),
  ).toBeInTheDocument();
});

it('should allow updating the severity in MQR mode', async () => {
  const user = userEvent.setup();
  renderProjectIssuesApp(`project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`);

  await user.click(
    await screen.findByLabelText(
      `software_impact.button.change.severity_impact.${SoftwareImpactSeverity.High}.software_quality.${SoftwareQuality.Security}`,
      undefined,
      { timeout: 10_000 },
    ),
  );
  await user.click(screen.getByText(`severity_impact.${SoftwareImpactSeverity.Blocker}`));

  expect(
    await screen.findByLabelText(
      `software_impact.button.change.severity_impact.${SoftwareImpactSeverity.Blocker}.software_quality.${SoftwareQuality.Security}`,
    ),
  ).toBeInTheDocument();
});

it('should allow updating the severity in Standard mode', async () => {
  const user = userEvent.setup();
  modeHandler.setMode(Mode.Standard);
  renderProjectIssuesApp(`project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`);

  await user.click(
    await screen.findByLabelText(
      `issue.type.severity.button.change.severity.${IssueSeverity.Major}.issue.type.${IssueType.CodeSmell}`,
      undefined,
      { timeout: 10_000 },
    ),
  );
  await user.click(screen.getByText(`severity.${IssueSeverity.Blocker}`));

  expect(
    await screen.findByLabelText(
      `issue.type.severity.button.change.severity.${IssueSeverity.Blocker}.issue.type.${IssueType.CodeSmell}`,
    ),
  ).toBeInTheDocument();
});

it('should show the legacy type and severity, and hide software qualities, in Standard mode', async () => {
  modeHandler.setMode(Mode.Standard);
  renderProjectIssuesApp(`project/issues?issueStatuses=CONFIRMED&open=${ISSUE_2}&id=myproject`);

  // Shows old type and severity
  expect(
    await screen.findByLabelText(
      `issue.type.severity.button.change.severity.${IssueSeverity.Major}.issue.type.${IssueType.CodeSmell}`,
      undefined,
      { timeout: 10_000 },
    ),
  ).toBeInTheDocument();

  // No clean code attribute badge
  expect(
    byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Responsible}`).query(),
  ).not.toBeInTheDocument();

  // No software qualities
  expect(byText(`software_quality.${SoftwareQuality.Security}`).query()).not.toBeInTheDocument();
});
