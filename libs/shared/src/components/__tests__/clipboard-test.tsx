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

import { Button } from '@sonarsource/echoes-react';
import { act, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { copy } from 'clipboard';
import { render, renderWithContext } from '../../helpers/test-utils';
import { ClipboardButton, ClipboardIconButton, useCopyClipboardEffect } from '../clipboard';

jest.mock('clipboard', () => ({
  copy: jest.fn().mockImplementation((a: string) => a),
}));

describe('useCopyClipboardEffect', () => {
  function TestComponent() {
    const [copySuccess, handleCopy] = useCopyClipboardEffect('foo');
    return <Button onClick={handleCopy}>{copySuccess ? 'copied' : 'copy'}</Button>;
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should allow its content to be copied', async () => {
    const { user } = render(<TestComponent />, {}, { delay: null });
    const btn = screen.getByRole('button', { name: 'copy' });
    expect(btn).toHaveTextContent('copy');

    await user.click(btn);
    expect(copy).toHaveBeenCalled();
    expect(btn).toHaveTextContent('copied');

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(btn).toHaveTextContent('copied');

    act(() => {
      jest.runAllTimers();
    });
    expect(btn).toHaveTextContent('copy');
  });
});

describe('ClipboardButton', () => {
  it('should display and function correctly', async () => {
    /* Delay: null is necessary to play well with fake timers
     * https://github.com/testing-library/user-event/issues/833
     */
    const user = userEvent.setup({ delay: null });
    renderClipboardButton();

    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'copy' }));

    expect(await screen.findByRole('tooltip', { name: 'copied_action' })).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByRole('tooltip', { name: 'copied_action' }));
  });

  it('should render a custom label if provided', () => {
    renderClipboardButton('Foo Bar');
    expect(screen.getByRole('button', { name: 'Foo Bar' })).toBeInTheDocument();
  });

  function renderClipboardButton(children?: React.ReactNode) {
    renderWithContext(<ClipboardButton copyValue="foo">{children}</ClipboardButton>);
  }
});

describe('ClipboardIconButton', () => {
  it('should display and function correctly', async () => {
    /* Delay: null is necessary to play well with fake timers
     * https://github.com/testing-library/user-event/issues/833
     */
    const user = userEvent.setup({ delay: null });
    renderWithContext(<ClipboardIconButton copyValue="foo" />);

    const copyButton = screen.getByRole('button', {
      name: 'copy_to_clipboard',
    });
    expect(copyButton).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'copy_to_clipboard' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'copy_to_clipboard' }));

    expect(await screen.findByRole('tooltip', { name: 'copied_action' })).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByRole('tooltip', { name: 'copied_action' }));
  });
});
