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

import styled from '@emotion/styled';
import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconX,
  Link,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  cssVar,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import tw from 'twin.macro';
import { useDismissNotice, useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';
import { useModeModifiedQuery, useStandardExperienceModeQuery } from '../../queries/mode';
import { Permissions } from '../../types/permissions';
import { NoticeType } from '../../types/users';

interface Props {
  as: 'facetBanner' | 'wideBanner';
}

export default function ModeBanner({ as }: Readonly<Props>) {
  const intl = useIntl();
  const { currentUser } = useCurrentUser();
  const isDismissed = useIsNoticeDismissed(NoticeType.MQR_MODE_ADVERTISEMENT_BANNER);
  const { dismissNotice } = useDismissNotice();
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const { data: isModified, isLoading } = useModeModifiedQuery();

  const onDismiss = () => {
    dismissNotice(NoticeType.MQR_MODE_ADVERTISEMENT_BANNER);
  };

  const renderSettingsLink = (text: string[]) => (
    <Link highlight={LinkHighlight.CurrentColor} to="/admin/settings?category=mode">
      {text}
    </Link>
  );

  if (
    !currentUser.permissions?.global.includes(Permissions.Admin) ||
    isDismissed ||
    isLoading ||
    isModified
  ) {
    return null;
  }

  return as === 'wideBanner' ? (
    <MessageCallout className="sw-mt-8" onDismiss={onDismiss} variety={MessageVariety.Info}>
      {intl.formatMessage(
        {
          id: `settings.mode.${isStandardMode ? 'standard' : 'mqr'}.advertisement`,
        },
        {
          a: (text) => renderSettingsLink(text),
        },
      )}
    </MessageCallout>
  ) : (
    <FacetBanner role="alert">
      <div className="sw-flex sw-gap-2">
        <div>
          {intl.formatMessage(
            { id: `mode.${isStandardMode ? 'standard' : 'mqr'}.advertisement` },
            {
              a: (text) => renderSettingsLink(text),
            },
          )}
        </div>
        <ButtonIcon
          Icon={IconX}
          ariaLabel={intl.formatMessage({ id: 'dismiss' })}
          className="sw-flex-none"
          onClick={onDismiss}
          size={ButtonSize.Medium}
          variety={ButtonVariety.DefaultGhost}
        />
      </div>
    </FacetBanner>
  );
}

const FacetBanner = styled.div`
  ${tw`sw-p-2 sw-rounded-2`}
  background-color: ${cssVar('color-background-accent-weak-default')};
`;
