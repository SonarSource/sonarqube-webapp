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

import { EchoesProviderForTests } from '@sonarsource/echoes-react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import CommentActions from '../CommentActions';

const JANE = { author: 'Jane Doe', date: '2019-09-13T17:55:42+0200' };

it.each(['edit', 'delete'])(
  'identifies the author and date of the comment in the %s button name',
  (action) => {
    renderCommentActions(JANE);

    expect(
      screen.getByRole('button', {
        name: `issue.comment.${action}_by_author_on_date.Jane Doe.Sep 13, 2019`,
      }),
    ).toBeVisible();
  },
);

it.each(['edit', 'delete'])(
  'gives distinguishable %s button names to the actions of different comments',
  (action) => {
    renderCommentActions(JANE);
    renderCommentActions({ author: 'John Smith', date: '2020-01-02T10:00:00+0200' });

    expect(
      screen.getAllByRole('button', { name: new RegExp(`^issue\\.comment\\.${action}`) }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: new RegExp(`${action}_by_author_on_date\\.Jane Doe`) }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: new RegExp(`${action}_by_author_on_date\\.John Smith`) }),
    ).toBeVisible();
  },
);

it('falls back to the generic button names when the author is unknown', () => {
  renderCommentActions({ date: JANE.date });

  expect(screen.getByRole('button', { name: 'issue.comment.edit.Sep 13, 2019' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'issue.comment.delete.Sep 13, 2019' })).toBeVisible();
});

it('keeps the short label as tooltip while the button name carries the author and date', async () => {
  const user = userEvent.setup();
  renderCommentActions(JANE);

  await user.hover(screen.getByRole('button', { name: /^issue\.comment\.edit_by_author/ }));

  expect(await screen.findByRole('tooltip')).toHaveTextContent(/^issue\.comment\.edit$/);
});

function renderCommentActions(props: Partial<ComponentProps<typeof CommentActions>> = {}) {
  return render(
    <EchoesProviderForTests router={null} tooltipsDelayDuration={0}>
      <CommentActions
        commentKey="comment-1"
        date="2019-09-13T17:55:42+0200"
        markdown="*TEST*"
        onDeleteComment={jest.fn()}
        onEditComment={jest.fn()}
        {...props}
      />
    </EchoesProviderForTests>,
  );
}
