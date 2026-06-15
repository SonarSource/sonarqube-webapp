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

import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole, byText } from '../../../helpers/testSelector';
import { Tags } from '../Tags';

const ui = {
  editButton: byRole('button', { name: /tags\.edit_button_label/ }),
  addButton: byRole('button', { name: /tags\.add_tags/ }),
};

function setup(props: Partial<ComponentProps<typeof Tags>> = {}) {
  return renderWithContext(<Tags tags={[]} {...props} />);
}

describe('Tags', () => {
  it('renders each tag label', () => {
    setup({ tags: ['bug', 'security', 'performance'] });

    expect(byText('bug').get()).toBeInTheDocument();
    expect(byText('security').get()).toBeInTheDocument();
    expect(byText('performance').get()).toBeInTheDocument();
  });

  it('shows no_tags text when the tags list is empty', () => {
    setup({ tags: [] });

    expect(byText('no_tags').get()).toBeInTheDocument();
  });

  it('truncates tags beyond tagsToDisplay and shows an ellipsis', () => {
    setup({ tags: ['bug', 'security', 'performance', 'critical'] });

    expect(byText('bug').get()).toBeInTheDocument();
    expect(byText('security').get()).toBeInTheDocument();
    expect(byText('performance').get()).toBeInTheDocument();
    expect(byText('...').get()).toBeInTheDocument();
    expect(byText('critical').query()).not.toBeInTheDocument();
  });

  it('respects a custom tagsToDisplay value', () => {
    setup({ tags: ['bug', 'security', 'performance'], tagsToDisplay: 1 });

    expect(byText('bug').get()).toBeInTheDocument();
    expect(byText('security').query()).not.toBeInTheDocument();
    expect(byText('...').get()).toBeInTheDocument();
  });

  it('does not show an ellipsis when all tags fit within tagsToDisplay', () => {
    setup({ tags: ['bug', 'security'], tagsToDisplay: 5 });

    expect(byText('bug').get()).toBeInTheDocument();
    expect(byText('security').get()).toBeInTheDocument();
    expect(byText('...').query()).not.toBeInTheDocument();
  });

  it('does not render a button when allowUpdate is false (default)', () => {
    setup({ tags: ['bug'] });

    expect(byRole('button').query()).not.toBeInTheDocument();
  });

  describe('when allowUpdate is true', () => {
    it('renders an edit button when there are tags', () => {
      setup({ allowUpdate: true, tags: ['bug', 'security'] });

      expect(ui.editButton.get()).toBeInTheDocument();
    });

    it('renders an add-tags button when there are no tags', () => {
      setup({ allowUpdate: true, tags: [] });

      expect(ui.addButton.get()).toBeInTheDocument();
    });

    it('shows a "+" label inside the button', () => {
      setup({ allowUpdate: true, tags: ['bug'] });

      expect(byText('+').get()).toBeInTheDocument();
    });

    it('calls setIsOpen(true) when the button is clicked', async () => {
      const setIsOpen = jest.fn();
      const { user } = setup({ allowUpdate: true, tags: ['bug'], setIsOpen });

      await user.click(ui.editButton.get());

      expect(setIsOpen).toHaveBeenCalledWith(true);
    });

    it('calls setIsOpen(false) when the dropdown is closed', async () => {
      const setIsOpen = jest.fn();
      const { user } = setup({ allowUpdate: true, tags: ['bug'], isOpen: true, setIsOpen });

      await user.click(document.body);

      expect(setIsOpen).toHaveBeenCalledWith(false);
    });
  });
});
