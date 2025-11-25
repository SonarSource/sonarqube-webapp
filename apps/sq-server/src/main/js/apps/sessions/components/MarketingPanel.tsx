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
import { cssVar } from '@sonarsource/echoes-react';
import tw from 'twin.macro';
import { Image } from '~adapters/components/common/Image';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { useLoginMessageQuery } from '~sq-server-commons/queries/settings';

export default function MarketingPanel() {
  const { data: message } = useLoginMessageQuery();

  const displayMessage = message !== undefined && message.length > 0;

  return (
    <div
      className="sw-flex sw-flex-col sw-items-center sw-justify-center sw-relative sw-overflow-hidden sw-w-full"
      style={{
        background: `linear-gradient(
          135deg,
          ${cssVar('color-background-accent-default')} 0%,
          ${cssVar('color-background-accent-hover')} 50%,
          ${cssVar('color-background-accent-active')} 100%
        )`,
      }}
    >
      <Image
        alt="Login Background"
        src="/images/sonar-whale-white.svg"
        style={{
          position: 'absolute',
          height: '105vh',
          width: 'auto',
          opacity: 0.08,
          top: '65%',
          left: '20%',
          transform: 'translate(-50%, calc(-50% + 0px))',
          zIndex: 1,
          pointerEvents: 'none',
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div className="sw-text-white sw-flex sw-flex-col sw-py-10 sw-w-full sw-max-w-[31rem] sw-mx-auto">
        {displayMessage && (
          <CustomMessage>
            <SafeHTMLInjection htmlAsString={message} sanitizeLevel={SanitizeLevel.USER_INPUT}>
              <div className="markdown sw-rounded-2 sw-p-4 sw-mb-6" />
            </SafeHTMLInjection>
          </CustomMessage>
        )}
      </div>
    </div>
  );
}

const CustomMessage = styled.div`
  a {
    ${tw`sw-text-white sw-border-b sw-border-white`};
    ${tw`sw-underline sw-typo-semibold`};

    &:visited {
      ${tw`sw-border-b sw-border-white`}
    }
    &:hover,
    &:focus,
    &:active {
      ${tw`sw-text-white`}
      ${tw`sw-border-b sw-border-white`}
    }
  }
`;
