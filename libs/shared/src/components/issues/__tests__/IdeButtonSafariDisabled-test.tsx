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

import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole, byText } from '../../../helpers/testSelector';
import IdeButtonSafariDisabled from '../IdeButtonSafariDisabled';

type IdeButtonSafariDisabledProps = ComponentProps<typeof IdeButtonSafariDisabled>;

const ui = {
  openInIdeButton: byRole('button', { name: 'Open in IDE' }),
  notSupportedText: byText('open_in_ide.safari.not_supported'),
  popoverTitle: byRole('heading', { name: 'open_in_ide.safari.not_supported.title' }),
};

it('renders correctly', async () => {
  const user = userEvent.setup();
  renderIdeButtonDisabledSafari();
  expect(ui.openInIdeButton.get()).toBeDisabled();
  expect(ui.notSupportedText.get()).toBeInTheDocument();

  await user.click(ui.notSupportedText.get());

  expect(ui.popoverTitle.get()).toBeInTheDocument();
});

function renderIdeButtonDisabledSafari(props: Partial<IdeButtonSafariDisabledProps> = {}) {
  return renderWithContext(<IdeButtonSafariDisabled buttonKey="Open in IDE" {...props} />);
}
