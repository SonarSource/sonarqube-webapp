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

import { getBeamerNewsList, getBeamerUnreadCount, markUnreadPosts } from '~shared/api/beamer';
import { BeamerNewsItem } from '~shared/types/beamer';
import { getUsers } from '../../../api/users';
import { mockCurrentUser, mockLoggedInUser, mockPaging } from '../../../helpers/testMocks';
import { renderApp } from '../../../helpers/testReactTestingUtils';
import { CurrentUser, RestUserDetailed } from '../../../types/users';
import { BeamerWidgetCustom } from '../BeamerWidgetCustom';

const mockBeamerContextData = jest.fn();
const mockGetBeamerAPIKey = jest.fn();

/* eslint-disable @typescript-eslint/no-unsafe-return */

jest.mock('~adapters/helpers/vendorConfig', () => ({
  useBeamerContextData: () => mockBeamerContextData(),
  getBeamerAPIKey: () => mockGetBeamerAPIKey(),
}));

jest.mock('~shared/api/beamer', () => ({
  getBeamerNewsList: jest.fn(() => []),
  getBeamerUnreadCount: jest.fn(() => ({ count: 0 })),
  markUnreadPosts: jest.fn(),
  PAGE_SIZE: 2,
}));
jest.mock('~sq-server-commons/api/users', () => ({
  getUsers: jest.fn(),
}));

const mockedCurrentUser = mockLoggedInUser();

const mockNewsData: BeamerNewsItem[] = [
  {
    id: 1,
    category: 'new;feature',
    date: '2024-01-15',
    translations: [
      {
        category: 'new;feature',
        content: 'We are excited to announce a new feature',
        contentHtml: '<p>We are excited to announce a new feature</p>',
        language: 'en',
        linkUrl: 'https://example.com',
        linkText: 'Learn more',
        postUrl: 'https://example.com/post/1',
        title: 'New Feature Release',
      },
    ],
  },
  {
    id: 2,
    category: 'announcement',
    date: '2024-01-10',
    translations: [
      {
        category: 'announcement',
        content: 'Scheduled maintenance on Sunday',
        contentHtml: '<p>Scheduled maintenance on Sunday</p>',
        language: 'en',
        postUrl: 'https://example.com/post/2',
        title: 'Maintenance Notice',
      },
    ],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockBeamerContextData.mockReturnValue('userPersona:standardUser;productVersion:5.2');
  mockGetBeamerAPIKey.mockReturnValue('test-api-key');
  jest.mocked(getBeamerNewsList).mockResolvedValue(mockNewsData);
  jest.mocked(getBeamerUnreadCount).mockResolvedValue({ count: 3 });
  jest.mocked(markUnreadPosts).mockResolvedValue(undefined);
  jest.mocked(getUsers).mockResolvedValue({
    page: mockPaging(),
    users: [{ login: mockedCurrentUser.login, id: 'test-user-id' } as RestUserDetailed],
  });
});

describe('BeamerWidgetCustom', () => {
  it('should not render when user is not logged in', () => {
    renderBeamerWidgetCustom({ currentUser: mockCurrentUser() });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render bell icon for logged in user', async () => {
    renderBeamerWidgetCustom();
    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'global_nav.news.tooltip');
  });

  it('should hide counter by default', async () => {
    renderBeamerWidgetCustom();

    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('should show unread counter when hideCounter is false', async () => {
    renderBeamerWidgetCustom({ hideCounter: false });

    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not show counter when hideCounter is false but no unread count', async () => {
    jest.mocked(getBeamerUnreadCount).mockResolvedValue({ count: 0 });
    renderBeamerWidgetCustom({ hideCounter: false });

    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should open news panel when bell icon is clicked', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getByText('beamer.panel.title')).toBeInTheDocument();
    expect(getBeamerNewsList).toHaveBeenCalled();
    expect(markUnreadPosts).toHaveBeenCalled();
  });

  it('should display news items in the panel', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getByText('New Feature Release')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Notice')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('feature')).toBeInTheDocument();
    expect(screen.getByText('announcement')).toBeInTheDocument();
  });

  it('should format dates correctly', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('January 10, 2024')).toBeInTheDocument();
  });

  it('should render HTML content safely', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getByText('We are excited to announce a new feature')).toBeInTheDocument();
    expect(screen.getByText('Scheduled maintenance on Sunday')).toBeInTheDocument();
  });

  it('should render link when linkUrl is provided', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    const link = screen.getByRole('link', { name: /Learn more/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should not render link when linkUrl is not provided', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getAllByRole('link')).toHaveLength(1); // Only one link should be present
  });

  it('should show error message when news list fails to load', async () => {
    const user = userEvent.setup();
    jest.mocked(getBeamerNewsList).mockRejectedValue(new Error('API Error'));

    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getByText('beamer.news.error')).toBeInTheDocument();
  });

  it('should show no news message when news list is empty', async () => {
    const user = userEvent.setup();
    jest.mocked(getBeamerNewsList).mockResolvedValueOnce([]);

    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(screen.getByText('beamer.news.no_news')).toBeInTheDocument();
  });

  it('should show load more button when there are more pages', async () => {
    const user = userEvent.setup();

    // First call returns full page, second call returns empty to simulate no more pages
    jest
      .mocked(getBeamerNewsList)
      .mockResolvedValueOnce(mockNewsData) // First page
      .mockResolvedValueOnce([]); // Second page (empty)

    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    const loadMoreButton = screen.getByRole('button', { name: /load_more/ });
    expect(loadMoreButton).toBeInTheDocument();

    await user.click(loadMoreButton);
    expect(getBeamerNewsList).toHaveBeenCalledTimes(2);
  });

  it('should filter out news items without translations', async () => {
    const user = userEvent.setup();
    const newsWithMissingTranslations: BeamerNewsItem[] = [
      ...mockNewsData,
      {
        id: 3,
        category: 'update',
        date: '2024-01-05',
        translations: [],
      },
    ];

    jest.mocked(getBeamerNewsList).mockResolvedValueOnce(newsWithMissingTranslations);

    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    expect(await screen.findByText('New Feature Release')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Notice')).toBeInTheDocument();
    expect(screen.queryByText('update')).not.toBeInTheDocument();
  });

  it('should render but queries disabled when beamer context data is not available', async () => {
    mockBeamerContextData.mockReturnValue(undefined);

    renderBeamerWidgetCustom();

    expect(await screen.findByRole('button')).toBeInTheDocument();
    // When context data is undefined, API calls should not be made
    expect(getBeamerUnreadCount).not.toHaveBeenCalled();
  });

  it('should use correct badge variety for categories', async () => {
    const user = userEvent.setup();
    renderBeamerWidgetCustom();

    await user.click(await screen.findByRole('button'));

    const newBadge = screen.getByText('new');
    expect(newBadge).toBeInTheDocument();
  });
});

function renderBeamerWidgetCustom(
  overrides: { currentUser?: CurrentUser; hideCounter?: boolean } = {},
) {
  const { hideCounter, ...appOverrides } = overrides;
  return renderApp('/', <BeamerWidgetCustom hideCounter={hideCounter} />, {
    currentUser: mockedCurrentUser,
    ...appOverrides,
  });
}
