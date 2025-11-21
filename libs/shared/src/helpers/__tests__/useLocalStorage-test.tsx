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
import { ComponentProps } from 'react';
import { render } from '../../helpers/test-utils';
import useLocalStorage from '../../helpers/useLocalStorage';

describe('useLocalStorage hook', () => {
  it('gets/sets boolean value', async () => {
    const user = userEvent.setup();
    renderLSComponent();

    expect(screen.getByRole('button', { name: 'show' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'show' }));
    expect(await screen.findByText('text')).toBeInTheDocument();
  });

  it('gets/sets string value', async () => {
    const user = userEvent.setup();
    const props = { condition: (value: string) => value === 'ok', valueToSet: 'wow' };
    const { rerender } = renderLSComponent(props);

    expect(screen.getByRole('button', { name: 'show' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.queryByText('text')).not.toBeInTheDocument();

    rerender(<LSComponent lsKey="test_ls" {...props} valueToSet="ok" />);
    await user.click(screen.getByRole('button', { name: 'show' }));
    expect(await screen.findByText('text')).toBeInTheDocument();
  });

  it('updates consumers of ls value', async () => {
    const user = userEvent.setup();
    renderLSComponent({ lsKey: 'test_consumer' });

    expect(screen.queryByText('LS consumer value updated')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('LS consumer value updated')).toBeInTheDocument();
  });
});

function renderLSComponent(props: Readonly<Partial<ComponentProps<typeof LSComponent>>> = {}) {
  return render(
    <>
      <LSComponent condition={(value) => Boolean(value)} lsKey="test_ls" valueToSet {...props} />
      <LSConsumerComponent lsKey={props.lsKey ?? 'test_ls'} />
    </>,
  );
}

function LSComponent({
  lsKey,
  condition,
  initialValue,
  valueToSet,
}: Readonly<{
  condition: (value?: boolean | string) => boolean;
  initialValue?: boolean | string;
  lsKey: string;
  valueToSet: boolean | string;
}>) {
  const [value, setValue] = useLocalStorage(lsKey, initialValue);

  return (
    <div>
      <button
        onClick={() => {
          setValue(valueToSet);
        }}
        type="button"
      >
        show
      </button>
      {condition(value) && <span>text</span>}
    </div>
  );
}

function LSConsumerComponent({ lsKey }: Readonly<{ lsKey: string }>) {
  const [value] = useLocalStorage(lsKey);

  if (value) {
    return <span>LS consumer value updated</span>;
  }

  return null;
}
