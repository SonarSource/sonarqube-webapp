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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../helpers/test-utils';
import { SelectList, SelectListFilter, SelectListProps } from '../SelectList';

interface TestItem {
  key: string;
  name: string;
}

const items: TestItem[] = [
  { key: 'foo', name: 'Foo' },
  { key: 'bar', name: 'Bar' },
  { key: 'baz', name: 'Baz' },
];

const selectedItems = [items[0]];
const disabledItems = [items[1]];

const columns = [
  {
    key: 'name',
    label: 'Name',
    renderCell: (item: TestItem) => item.name,
  },
];

const itemKey = (item: TestItem) => item.key;

it('should render items', () => {
  renderSelectList({});
  expect(screen.getByText('Foo')).toBeInTheDocument();
  expect(screen.getByText('Bar')).toBeInTheDocument();
  expect(screen.getByText('Baz')).toBeInTheDocument();
});

it('should cancel filter selection when search is active', async () => {
  const user = userEvent.setup();
  const onSearch = jest.fn().mockResolvedValue(undefined);
  renderSelectList({ onSearch });

  // The component calls onSearch on mount
  expect(onSearch).toHaveBeenCalledTimes(1);
  expect(onSearch).toHaveBeenCalledWith({
    query: '',
    filter: SelectListFilter.All,
    page: 1,
    pageSize: 6, // default page size
  });
  onSearch.mockClear();

  await user.click(screen.getByRole('radio', { name: 'unselected' }));

  expect(onSearch).toHaveBeenCalledWith({
    query: '',
    filter: SelectListFilter.Unselected,
    page: 1,
    pageSize: 6,
  });

  const query = 'test';
  await user.type(screen.getByPlaceholderText('search'), query);

  expect(onSearch).toHaveBeenCalledWith({
    query,
    filter: SelectListFilter.All, // Filter is forced to All when searching
    page: 1,
    pageSize: 6,
  });

  await user.clear(screen.getByPlaceholderText('search'));

  // After clearing search, it should research with the previous filter
  expect(onSearch).toHaveBeenCalledWith({
    query: '',
    filter: SelectListFilter.Unselected,
    page: 1,
    pageSize: 6,
  });
});

it('should display pagination element properly and call search method with correct parameters', async () => {
  const user = userEvent.setup();
  const onSearch = jest.fn().mockResolvedValue(undefined);
  const pageSize = 10;
  renderSelectList({
    totalItemCount: 100,
    onSearch,
    pageSize,
  });

  // on mount
  expect(onSearch).toHaveBeenCalledWith({
    query: '',
    filter: SelectListFilter.All,
    page: 1,
    pageSize,
  });
  onSearch.mockClear();

  await user.click(screen.getByRole('button', { name: 'show_more' }));

  expect(onSearch).toHaveBeenCalledWith({
    query: '',
    filter: SelectListFilter.All,
    page: 2,
    pageSize,
  }); // Load more call
});

it('should allow to reload when needed', async () => {
  const user = userEvent.setup();
  const onReload = jest.fn();

  renderSelectList({
    totalItemCount: 100,
    onReload,
    needToReload: true,
  });

  await user.click(screen.getByRole('button', { name: 'reload' }));
  expect(onReload).toHaveBeenCalledTimes(1);
});

describe('onLoadMore', () => {
  it('should call onLoadMore when provided', async () => {
    const user = userEvent.setup();
    const onLoadMore = jest.fn();
    renderSelectList({ totalItemCount: 100, onLoadMore });

    await user.click(screen.getByRole('button', { name: 'show_more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});

function renderSelectList(props: Partial<SelectListProps<TestItem>> = {}) {
  const defaultProps: SelectListProps<TestItem> = {
    ariaLabel: 'select list',
    columns,
    items,
    itemKey,
    selectedItems,
    disabledItems,
    onSearch: jest.fn().mockResolvedValue(undefined),
    onSelectionChange: jest.fn(),
  };

  return renderWithContext(<SelectList {...defaultProps} {...props} />);
}
