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

import { TeachingBubble } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDismissNotice, useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';
import { renderWithContext } from '../../../helpers/test-utils';
import { AnnouncementBubble } from '../AnnouncementBubble';

jest.mock('~adapters/helpers/users', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('~adapters/helpers/notices', () => ({
  useIsNoticeDismissed: jest.fn(),
  useDismissNotice: jest.fn(),
}));

const DISMISS_SETTING = 'my-announcement';
const BUBBLE_TITLE = 'Check out this new feature!';
const CHILDREN_TEXT = 'The target element';

function setupRender({
  isLoggedIn = true,
  isDismissed = false,
  isOpen = true,
  dismissNotice = jest.fn().mockResolvedValue(undefined),
} = {}) {
  jest.mocked(useCurrentUser).mockReturnValue({
    currentUser: {} as any,
    isLoggedIn,
  });
  jest.mocked(useIsNoticeDismissed).mockReturnValue(isDismissed);
  jest.mocked(useDismissNotice).mockReturnValue({ dismissNotice });

  return renderWithContext(
    <AnnouncementBubble
      dismissSetting={DISMISS_SETTING}
      footer={<TeachingBubble.CloseButton>close</TeachingBubble.CloseButton>}
      isOpen={isOpen}
      title={BUBBLE_TITLE}
    >
      <button type="button">{CHILDREN_TEXT}</button>
    </AnnouncementBubble>,
  );
}

describe('AnnouncementBubble', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the TeachingBubble when user is logged in and notice is not dismissed', () => {
    setupRender();

    expect(screen.getByText(BUBBLE_TITLE)).toBeInTheDocument();
  });

  it('renders only children when user is not logged in', () => {
    setupRender({ isLoggedIn: false });

    expect(screen.queryByText(BUBBLE_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText(CHILDREN_TEXT)).toBeInTheDocument();
  });

  it('renders only children when the notice has already been dismissed', () => {
    setupRender({ isDismissed: true });

    expect(screen.queryByText(BUBBLE_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText(CHILDREN_TEXT)).toBeInTheDocument();
  });

  it('dismisses the notice and hides the bubble when closed', async () => {
    const dismissNotice = jest.fn().mockResolvedValue(undefined);
    setupRender({ dismissNotice });

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(dismissNotice).toHaveBeenCalledWith(DISMISS_SETTING);
    expect(screen.queryByText(BUBBLE_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText(CHILDREN_TEXT)).toBeInTheDocument();
  });

  it('still hides locally even when the dismissal API call fails', async () => {
    const dismissNotice = jest.fn().mockRejectedValue(new Error('Network error'));
    setupRender({ dismissNotice });

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByText(BUBBLE_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText(CHILDREN_TEXT)).toBeInTheDocument();
  });
});
