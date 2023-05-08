/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from '../MultiSelect';

const elements = ['foo', 'bar', 'baz'];

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

it('should allow selecting and deselecting a new option', async () => {
  const user = userEvent.setup({ delay: null });
  const onSelect = jest.fn();
  const onUnselect = jest.fn();
  renderMultiselect({ elements, onSelect, onUnselect, allowNewElements: true });

  await user.keyboard('new option');
  jest.runAllTimers(); // skip the debounce

  expect(screen.getByText('new option')).toBeInTheDocument();

  await user.click(screen.getByText('new option'));

  expect(onSelect).toHaveBeenCalledWith('new option');

  renderMultiselect({
    elements,
    onUnselect,
    allowNewElements: true,
    selectedElements: ['new option'],
  });

  await user.click(screen.getByText('new option'));
  expect(onUnselect).toHaveBeenCalledWith('new option');
});

it('should ignore the left and right arrow keys', async () => {
  const user = userEvent.setup({ delay: null });
  const onSelect = jest.fn();
  renderMultiselect({ elements, onSelect });

  /* eslint-disable testing-library/no-node-access */
  await user.keyboard('{arrowdown}');
  expect(screen.getAllByRole('checkbox')[1].parentElement).toHaveClass('active');

  await user.keyboard('{arrowleft}');
  expect(screen.getAllByRole('checkbox')[1].parentElement).toHaveClass('active');

  await user.keyboard('{arrowright}');
  expect(screen.getAllByRole('checkbox')[1].parentElement).toHaveClass('active');

  await user.keyboard('{arrowdown}');
  expect(screen.getAllByRole('checkbox')[1].parentElement).not.toHaveClass('active');
  expect(screen.getAllByRole('checkbox')[2].parentElement).toHaveClass('active');

  await user.keyboard('{arrowup}');
  await user.keyboard('{arrowup}');
  expect(screen.getAllByRole('checkbox')[0].parentElement).toHaveClass('active');
  await user.keyboard('{arrowup}');
  expect(screen.getAllByRole('checkbox')[2].parentElement).toHaveClass('active');

  expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
  await user.keyboard('{enter}');
  expect(onSelect).toHaveBeenCalledWith('baz');
});

it('should show no results', () => {
  renderMultiselect();
  expect(screen.getByText('no results')).toBeInTheDocument();
});

function renderMultiselect(props: Partial<MultiSelect['props']> = {}) {
  return render(
    <MultiSelect
      clearIconAriaLabel="clear"
      createElementLabel="create thing"
      elements={[]}
      filterSelected={jest.fn()}
      listSize={10}
      noResultsLabel="no results"
      onSearch={jest.fn(() => Promise.resolve())}
      onSelect={jest.fn()}
      onUnselect={jest.fn()}
      placeholder=""
      searchInputAriaLabel="search"
      selectedElements={[]}
      {...props}
    />
  );
}
