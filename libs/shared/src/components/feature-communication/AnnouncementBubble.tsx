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

import { TeachingBubble, TeachingBubbleProps } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import { useCallback, useState } from 'react';
import { useDismissNotice, useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';

interface Props extends Omit<TeachingBubbleProps, 'onClose'> {
  dismissSetting: string;
}

/**
 * Wraps the TeachingBubble component to handle the dismissal in a common way.
 *
 * `isOpen` only controls the TeachingBubble if the user is logged in and has *not* dismissed it!
 */
export function AnnouncementBubble(props: Readonly<Props>) {
  const { dismissSetting, isOpen, ...teachinBubbleProps } = props;

  const { isLoggedIn } = useCurrentUser();
  const isDismissed = useIsNoticeDismissed(dismissSetting);
  const { dismissNotice } = useDismissNotice();

  // Local state just in case the actual dismissal fails
  const [closed, setClosed] = useState(false);

  const handleClose = useCallback(() => {
    setClosed(true);
    dismissNotice(dismissSetting).catch(noop);
  }, [dismissNotice, dismissSetting]);

  if (isDismissed || closed || !isLoggedIn) {
    return teachinBubbleProps.children;
  }

  return <TeachingBubble {...teachinBubbleProps} isOpen={isOpen} onClose={handleClose} />;
}
